import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';
import UserAnswer from '../models/UserAnswer.js';
import User from '../models/User.js';
import Bookmark from '../models/Bookmark.js';
import QuizConfig from '../models/QuizConfig.js';
import Quiz from '../models/Quiz.js';
import { sequelize } from '../configs/db.js';
import { Op } from 'sequelize';

// Helper to calculate Rank and Percentile
const calculateRankAndPercentile = async (userId, type) => {
    const isManualQuiz = !isNaN(type);
    if (!isManualQuiz) return { rank: null, percentile: null };

    // Get all unique users' first attempts for this quiz
    const allFirstAttempts = await QuizAttempt.findAll({
        where: { type: String(type), isPractice: false },
        attributes: ['userId', 'score', 'timeTaken'],
        order: [['score', 'DESC'], ['timeTaken', 'ASC']]
    });

    const totalUsers = allFirstAttempts.length;
    const userIndex = allFirstAttempts.findIndex(a => a.userId === userId);

    if (userIndex !== -1) {
        const rank = userIndex + 1;
        const percentile = totalUsers > 0 ? ((totalUsers - userIndex) / totalUsers * 100).toFixed(1) : 100;
        return { rank, percentile };
    }
    return { rank: null, percentile: null };
};

// Get Random Quiz (based on Admin Config)
export const getRandomQuiz = async (req, res) => {
    try {
        const config = await QuizConfig.findOne() || { 
            questionCount: 15, 
            difficultyDistribution: { easy: 40, medium: 40, hard: 20 } 
        };

        const { questionCount, difficultyDistribution } = config;
        
        const counts = {
            Easy: Math.round((difficultyDistribution.easy / 100) * questionCount),
            Medium: Math.round((difficultyDistribution.medium / 100) * questionCount),
            Hard: Math.round((difficultyDistribution.hard / 100) * questionCount)
        };

        const questions = [];
        
        for (const [diff, count] of Object.entries(counts)) {
            if (count > 0) {
                const diffQuestions = await Question.findAll({
                    where: { difficulty: diff, isActive: true },
                    order: sequelize.random(),
                    limit: count
                });
                questions.push(...diffQuestions);
            }
        }

        // Shuffle the combined list
        const shuffled = questions.sort(() => Math.random() - 0.5);

        res.json({ success: true, questions: shuffled });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit Quiz
export const submitQuiz = async (req, res) => {
    const { userId, answers, timeTaken, type } = req.body; // answers: [{ questionId, selectedOption, mistakeType, timeTaken }]
    
    try {
        const totalQuestions = answers.length;
        let score = 0;
        const processedAnswers = [];
        const mistakeCounts = { conceptual: 0, memory: 0, careless: 0 };

        for (const ans of answers) {
            const question = await Question.findByPk(ans.questionId);
            if (!question) continue;

            let isCorrect = false;
            if (question.responseType === 'mcq') {
                isCorrect = question.correctOption === ans.selectedOption;
            } else if (question.responseType === 'short_answer') {
                const userAns = (ans.shortAnswer || "").toLowerCase().trim();
                const correctAns = (question.correctAnswer || "").toLowerCase().trim();
                isCorrect = userAns === correctAns;
            }
            
            if (isCorrect) score++;
            else if (ans.mistakeType && mistakeCounts[ans.mistakeType] !== undefined) {
                mistakeCounts[ans.mistakeType]++;
            }

            processedAnswers.push({
                questionId: ans.questionId,
                selectedOption: question.responseType === 'mcq' ? ans.selectedOption : null,
                shortAnswer: question.responseType === 'short_answer' ? ans.shortAnswer : null,
                isCorrect,
                mistakeType: isCorrect ? 'none' : (ans.mistakeType || 'none'),
                timeTaken: ans.timeTaken || 0
            });
        }

        const accuracy = (score / totalQuestions) * 100;

        // Check if this is the first attempt for this quiz (manual quiz only)
        // Manual quizzes have numeric type (quiz ID)
        const isManualQuiz = !isNaN(type);
        let isPractice = false;
        
        if (isManualQuiz) {
            const existingAttempt = await QuizAttempt.findOne({ 
                where: { userId, type: String(type) } 
            });
            if (existingAttempt) isPractice = true;
        }

        // Create Attempt
        const attempt = await QuizAttempt.create({
            userId,
            score,
            totalQuestions,
            accuracy,
            mistakeCounts,
            type: type || 'mixed',
            timeTaken: timeTaken || 0,
            isPractice,
            completedAt: new Date()
        });

        // Create User Answers
        await UserAnswer.bulkCreate(processedAnswers.map(pa => ({
            ...pa,
            attemptId: attempt.id
        })));

        // Ranking and Percentile Logic
        const { rank, percentile } = await calculateRankAndPercentile(userId, type || 'mixed');

        // Update User Stats (only for first attempt or mixed practice)
        const user = await User.findByPk(userId);
        if (user) {
            const allAttempts = await QuizAttempt.findAll({ where: { userId } });
            const avgAccuracy = allAttempts.reduce((acc, curr) => acc + curr.accuracy, 0) / allAttempts.length;
            
            let level = 'Beginner';
            if (avgAccuracy > 75) level = 'Advanced';
            else if (avgAccuracy > 50) level = 'Intermediate';

            // Daily Streak Logic
            const today = new Date().toDateString();
            const lastDate = user.lastQuizDate ? new Date(user.lastQuizDate).toDateString() : null;
            
            let newStreak = user.dailyStreak;
            if (lastDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (lastDate === yesterday.toDateString()) {
                    newStreak++;
                } else {
                    newStreak = 1;
                }
            }

            await user.update({
                accuracy: avgAccuracy,
                performanceLevel: level,
                dailyStreak: newStreak,
                lastQuizDate: new Date()
            });
        }

        res.json({ 
            success: true, 
            attemptId: attempt.id, 
            score, 
            accuracy, 
            totalQuestions, 
            mistakeCounts, 
            type: type || 'mixed', 
            timeTaken: timeTaken || 0,
            isPractice,
            rank,
            percentile
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle Bookmark
export const toggleBookmark = async (req, res) => {
    const { userId, questionId } = req.body;
    try {
        const existing = await Bookmark.findOne({ where: { userId, questionId } });
        if (existing) {
            await existing.destroy();
            res.json({ success: true, bookmarked: false });
        } else {
            await Bookmark.create({ userId, questionId });
            res.json({ success: true, bookmarked: true });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get User Dashboard Stats
export const getUserStats = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findByPk(userId);
        const [allAttempts, quizzes] = await Promise.all([
            QuizAttempt.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']]
            }),
            Quiz.findAll()
        ]);

        const quizMap = quizzes.reduce((acc, q) => ({ ...acc, [q.id]: q.title }), {});

        // Compute aggregate stats
        let totalQuestions = 0;
        let totalCorrect = 0;
        let totalTime = 0;

        allAttempts.forEach(a => {
            totalQuestions += a.totalQuestions;
            totalCorrect += a.score;
            totalTime += a.timeTaken;
        });

        const avgTime = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0;

        const recentAttempts = allAttempts.slice(0, 5).map(a => ({
            ...a.toJSON(),
            quizTitle: quizMap[a.type] || (a.type === 'mixed' ? 'Mixed Practice' : 'Specialized Practice')
        }));

        res.json({ 
            success: true, 
            stats: {
                accuracy: user.accuracy,
                level: user.performanceLevel,
                streak: user.dailyStreak,
                totalQuestions,
                totalCorrect,
                avgTime,
                recentAttempts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Mistake-based Quiz
export const getMistakeQuiz = async (req, res) => {
    const { userId } = req.params;
    try {
        // Find questions user got wrong recently
        const wrongAnswers = await UserAnswer.findAll({
            include: [{
                model: QuizAttempt,
                where: { userId },
                attributes: []
            }],
            where: { isCorrect: false },
            attributes: ['questionId'],
            group: ['questionId'],
            limit: 20
        });

        const questionIds = wrongAnswers.map(wa => wa.questionId);
        const questions = await Question.findAll({
            where: { id: { [Op.in]: questionIds } },
            order: sequelize.random()
        });

        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all bookmarks for a user
export const getBookmarks = async (req, res) => {
    const userId = req.params.userId;
    try {
        const bookmarks = await Bookmark.findAll({
            where: { userId },
            include: [{ model: Question }]
        });
        res.json({ success: true, bookmarks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all active manual quizzes for students
export const getQuizzes = async (req, res) => {
    try {
        const userId = req.user.id;
        const [quizzes, attempts] = await Promise.all([
            Quiz.findAll({
                where: { status: 'active' },
                order: [['createdAt', 'DESC']]
            }),
            QuizAttempt.findAll({
                where: { userId },
                attributes: ['type']
            })
        ]);

        const attemptedIds = new Set(attempts.map(a => String(a.type)));

        const quizzesWithStatus = quizzes.map(q => ({
            ...q.toJSON(),
            isAttempted: attemptedIds.has(String(q.id))
        }));

        res.json({ success: true, quizzes: quizzesWithStatus });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getQuizQuestions = async (req, res) => {
    const { id } = req.params;
    try {
        const quiz = await Quiz.findByPk(id);
        if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

        // Logic: Pick random questions matching the quiz's totalQuestions count
        // In a real system, you might have a many-to-many relationship, 
        // but for now we'll pick them randomly from the pool according to the count.
        const questions = await Question.findAll({
            where: { quizId: id, isActive: true },
            order: [['createdAt', 'ASC']]
        });

        res.json({ success: true, quiz, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get All Attempts for a specific user
export const getUserAttempts = async (req, res) => {
    try {
        const userId = req.user.id;
        const attempts = await QuizAttempt.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        
        // Fetch all quizzes to map titles (assuming type is the quiz ID for manual ones)
        const quizzes = await Quiz.findAll();
        const quizMap = quizzes.reduce((acc, q) => ({ ...acc, [q.id]: q.title }), {});

        const attemptsWithTitles = attempts.map(a => ({
            ...a.toJSON(),
            quizTitle: quizMap[a.type] || (a.type === 'mixed' ? 'Mixed Practice' : 'Specialized Practice')
        }));

        res.json({ success: true, attempts: attemptsWithTitles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Full Details for a Specific Attempt
export const getAttemptDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const attempt = await QuizAttempt.findByPk(id, {
            include: [{
                model: UserAnswer,
                include: [{
                    model: Question
                }]
            }]
        });

        if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });

        // Calculate marks
        let totalMaxMarks = 0;
        let gainedMarks = 0;
        let positiveTotal = 0;
        let negativeTotal = 0;

        attempt.UserAnswers.forEach(ua => {
            const q = ua.Question;
            if (q) {
                totalMaxMarks += q.positiveMarks || 1;
                if (ua.isCorrect) {
                    positiveTotal += q.positiveMarks || 1;
                } else if (!ua.isCorrect && (ua.selectedOption !== null || (ua.shortAnswer && ua.shortAnswer.trim() !== ''))) {
                    // Only apply negative marks for answered but incorrect questions
                    negativeTotal += q.negativeMarks || 0;
                }
            }
        });

        gainedMarks = positiveTotal - negativeTotal;

        // Add ranking info on the fly
        const { rank, percentile } = await calculateRankAndPercentile(attempt.userId, attempt.type);

        // Add global stats for each question
        const userAnswersWithStats = await Promise.all(attempt.UserAnswers.map(async (ua) => {
            const stats = await UserAnswer.findOne({
                where: { questionId: ua.questionId },
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('timeTaken')), 'avgTime'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalAttempts'],
                    [sequelize.literal('SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END)'), 'correctCount']
                ],
                raw: true
            });

            return {
                ...ua.toJSON(),
                globalStats: {
                    avgTime: Math.round(stats.avgTime || 0),
                    accuracy: stats.totalAttempts > 0 ? Math.round((stats.correctCount / stats.totalAttempts) * 100) : 0,
                    totalParticipants: stats.totalAttempts || 0
                }
            };
        }));

        res.json({ 
            success: true, 
            attempt: {
                ...attempt.toJSON(),
                UserAnswers: userAnswersWithStats,
                rank,
                percentile,
                marks: {
                    totalMaxMarks,
                    gainedMarks,
                    positiveTotal,
                    negativeTotal
                }
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
