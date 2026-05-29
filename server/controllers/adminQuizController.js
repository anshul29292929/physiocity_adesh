import Question from '../models/Question.js';

import QuizAttempt from '../models/QuizAttempt.js';
import UserAnswer from '../models/UserAnswer.js';
import User from '../models/User.js';
import Bookmark from '../models/Bookmark.js';
import QuizConfig from '../models/QuizConfig.js';
import Quiz from '../models/Quiz.js';
import { sequelize } from '../configs/db.js';
import { Op } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';

// Question Management
export const getAdminQuestions = async (req, res) => {
    const { difficulty, isActive, search } = req.query;
    const where = {};
    if (difficulty) where.difficulty = difficulty;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
        where.text = { [Op.like]: `%${search}%` };
    }

    try {
        const questions = await Question.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateQuestion = async (req, res) => {
    const { id } = req.params;
    try {
        const { text, options, correctOption, correctAnswer, responseType, explanation, type, isPaid, quizId, positiveMarks, negativeMarks } = req.body;
        const imageFile = req.file;

        const question = await Question.findByPk(id);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        let imageUrl = question.image;
        if (imageFile) {
            imageUrl = `/uploads/questions/${imageFile.filename}`;
        }

        const resolvedType = responseType || question.responseType;

        await question.update({
            text: text || question.text,
            responseType: resolvedType,
            options: resolvedType === 'mcq' ? (typeof options === 'string' ? JSON.parse(options) : options) : (options || question.options),
            correctOption: resolvedType === 'mcq' ? (correctOption !== undefined ? parseInt(correctOption) : question.correctOption) : null,
            correctAnswer: resolvedType === 'short_answer' ? (correctAnswer || question.correctAnswer) : null,
            explanation: typeof explanation === 'string' ? JSON.parse(explanation) : (explanation || question.explanation),
            type: type || question.type,
            isPaid: isPaid !== undefined ? (isPaid === 'true' || isPaid === true) : question.isPaid,
            image: imageUrl,
            quizId: quizId !== undefined ? (quizId ? parseInt(quizId) : null) : question.quizId,
            positiveMarks: positiveMarks !== undefined ? parseFloat(positiveMarks) : question.positiveMarks,
            negativeMarks: negativeMarks !== undefined ? parseFloat(negativeMarks) : question.negativeMarks
        });

        res.json({ success: true, message: 'Question Updated', question });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteQuestion = async (req, res) => {
    const { id } = req.params;
    try {
        const question = await Question.findByPk(id);
        if (!question) return res.status(404).json({ success: false, message: "Not found" });

        // Delete image file if exists
        if (question.image && !question.image.startsWith('http')) {
            const filePath = path.join(process.cwd(), question.image);
            try { await fs.unlink(filePath); } catch (e) { console.error("File delete error:", e.message); }
        }

        await question.destroy();
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const bulkUploadQuestions = async (req, res) => {
    const { questions } = req.body; // Expects array of question objects
    try {
        const created = await Question.bulkCreate(questions);
        res.json({ success: true, count: created.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Quiz Configuration
export const getQuizConfigs = async (req, res) => {
    try {
        let config = await QuizConfig.findOne();
        if (!config) {
            config = await QuizConfig.create({});
        }
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateQuizConfigs = async (req, res) => {
    try {
        let config = await QuizConfig.findOne();
        if (config) {
            await config.update(req.body);
        } else {
            config = await QuizConfig.create(req.body);
        }
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Deep Analytics
export const getAdminQuizStats = async (req, res) => {
    try {
        // ── Platform-level KPIs ──
        const totalUsers    = await User.count();
        const totalAttempts = await QuizAttempt.count();
        const officialCount = await QuizAttempt.count({ where: { isPractice: false } });
        const practiceCount = await QuizAttempt.count({ where: { isPractice: true  } });
        
        let avgScore = 0, avgTimeTaken = 0;
        try {
            const aggs = await QuizAttempt.findOne({
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('score')), 'avgScore'],
                    [sequelize.fn('AVG', sequelize.col('timeTaken')), 'avgTimeTaken']
                ],
                raw: true
            });
            if (aggs) {
                avgScore = parseFloat(aggs.avgScore) || 0;
                avgTimeTaken = parseFloat(aggs.avgTimeTaken) || 0;
            }
        } catch(e) {}
        const totalQuestions = await Question.count();
        const totalQuizzes  = await Quiz.count();

        // ── Score Distribution (buckets of 10%) ──
        const allScores = await QuizAttempt.findAll({ attributes: ['score'], raw: true });
        const scoreBuckets = Array(10).fill(0);
        allScores.forEach(({ score }) => {
            const bucket = Math.min(Math.floor((parseFloat(score) || 0) / 10), 9);
            scoreBuckets[bucket]++;
        });

        // ── Per-Quiz Breakdown ──
        const quizzes = await Quiz.findAll({ attributes: ['id', 'title', 'totalQuestions'], raw: true });
        const perQuiz = await Promise.all(quizzes.map(async (q) => {
            const attempts = await QuizAttempt.findAll({
                where: { type: String(q.id) },
                attributes: ['score', 'timeTaken', 'isPractice'],
                raw: true
            });
            if (attempts.length === 0) return { ...q, attempts: 0, officialAttempts: 0, avgScore: 0, avgTime: 0 };
            const official = attempts.filter(a => !a.isPractice);
            const avgQScore = attempts.reduce((acc, a) => acc + (parseFloat(a.score) || 0), 0) / attempts.length;
            const avgQTime  = attempts.reduce((acc, a) => acc + (parseInt(a.timeTaken) || 0), 0) / attempts.length;
            return {
                ...q,
                attempts: attempts.length,
                officialAttempts: official.length,
                avgScore: Math.round(avgQScore),
                avgTime: Math.round(avgQTime),
            };
        }));

        // ── Most Missed Questions ──
        const mostMissed = await UserAnswer.findAll({
            where: { isCorrect: false },
            attributes: ['questionId', [sequelize.fn('COUNT', sequelize.col('questionId')), 'count']],
            group: ['questionId'],
            order: [[sequelize.literal('count'), 'DESC']],
            limit: 8,
            include: [{ model: Question, attributes: ['text', 'difficulty'] }]
        });

        // ── Hardest Questions (lowest accuracy) via raw SQL ──
        const [hardestRows] = await sequelize.query(`
            SELECT 
                ua.questionId,
                q.text,
                q.difficulty,
                COUNT(ua.id) as total,
                SUM(CASE WHEN ua.isCorrect = 1 THEN 1 ELSE 0 END) as correct,
                ROUND(SUM(CASE WHEN ua.isCorrect = 1 THEN 1 ELSE 0 END) / COUNT(ua.id) * 100) as accuracy
            FROM UserAnswers ua
            JOIN Questions q ON q.id = ua.questionId
            GROUP BY ua.questionId, q.text, q.difficulty
            HAVING COUNT(ua.id) >= 3
            ORDER BY accuracy ASC
            LIMIT 6
        `);

        // ── Most Bookmarked ──
        const mostBookmarked = await Bookmark.findAll({
            attributes: ['questionId', [sequelize.fn('COUNT', sequelize.col('questionId')), 'count']],
            group: ['questionId'],
            order: [[sequelize.literal('count'), 'DESC']],
            limit: 6,
            include: [{ model: Question, attributes: ['text', 'difficulty'] }]
        });

        // ── Top 5 Students via raw SQL ──
        const [topRows] = await sequelize.query(`
            SELECT 
                qa.userId,
                u.name, u.email, u.imageUrl,
                ROUND(AVG(qa.score), 1) as avgScore,
                COUNT(qa.id) as attempts
            FROM QuizAttempts qa
            JOIN user u ON u.id = qa.userId
            WHERE qa.isPractice = 0
            GROUP BY qa.userId, u.name, u.email, u.imageUrl
            ORDER BY avgScore DESC
            LIMIT 5
        `);

        // ── Mistake breakdown ──
        let mistakeBreakdown = { conceptual: 0, memory: 0, careless: 0 };
        try {
            const mb = await QuizAttempt.findAll({
                attributes: [
                    [sequelize.fn('SUM', sequelize.literal("JSON_EXTRACT(mistakeCounts, '$.conceptual')")), 'conceptual'],
                    [sequelize.fn('SUM', sequelize.literal("JSON_EXTRACT(mistakeCounts, '$.memory')")), 'memory'],
                    [sequelize.fn('SUM', sequelize.literal("JSON_EXTRACT(mistakeCounts, '$.careless')")), 'careless']
                ]
            });
            if (mb[0]) mistakeBreakdown = mb[0].dataValues || mb[0];
        } catch (_) { /* mistakeCounts may not be populated */ }

        res.json({
            success: true,
            stats: {
                totalUsers, totalAttempts, officialCount, practiceCount,
                avgScore: Math.round(avgScore * 10) / 10,
                avgTimeTaken: Math.round(avgTimeTaken),
                totalQuestions, totalQuizzes,
                scoreBuckets,
                perQuiz,
                mostMissed,
                questionAccuracy: hardestRows,
                mostBookmarked,
                topStudents: topRows.map(row => ({
                    ...row,
                    User: { name: row.name, email: row.email, imageUrl: row.imageUrl }
                })),
                mistakeBreakdown,
            }
        });
    } catch (error) {
        console.error('Analytics error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getUserDetailedPerformance = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findByPk(userId);
        const attempts = await QuizAttempt.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({ success: true, user, attempts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Quiz Entity Management (Manual Quizzes)
export const createQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.create({
            ...req.body,
            createdBy: req.auth.adminId
        });
        res.json({ success: true, quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ success: true, quizzes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getQuiz = async (req, res) => {
    const { id } = req.params;
    try {
        const quiz = await Quiz.findByPk(id);
        if (quiz) return res.json({ success: true, quiz });
        res.status(404).json({ success: false, message: "Quiz not found" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateQuiz = async (req, res) => {
    const { id } = req.params;
    try {
        const [updated] = await Quiz.update(req.body, { where: { id } });
        if (updated) {
            const updatedQuiz = await Quiz.findByPk(id);
            return res.json({ success: true, quiz: updatedQuiz });
        }
        res.status(404).json({ success: false, message: "Quiz not found" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteQuiz = async (req, res) => {
    const { id } = req.params;
    try {
        const quiz = await Quiz.findByPk(id);
        if (!quiz) return res.status(404).json({ success: false, message: "Not found" });

        // Find all questions in this quiz to delete their images
        const questions = await Question.findAll({ where: { quizId: id } });
        for (const q of questions) {
            if (q.image && !q.image.startsWith('http')) {
                const filePath = path.join(process.cwd(), q.image);
                try { await fs.unlink(filePath); } catch (e) { console.error("File delete error:", e.message); }
            }
        }

        await quiz.destroy(); // Cascading delete will handle DB records (Questions)
        
        // Handle attempts separately since they use 'type' as a string ID
        await QuizAttempt.destroy({ where: { type: String(id) } });
        
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all submissions for a specific quiz (Admin)
export const getQuizSubmissions = async (req, res) => {
    const { id: quizId } = req.params;
    try {
        const attempts = await QuizAttempt.findAll({
            where: { type: String(quizId) },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'imageUrl']
                },
                {
                    model: UserAnswer,
                    include: [{ model: Question, attributes: ['id', 'text', 'correctOption', 'correctAnswer', 'responseType', 'positiveMarks', 'negativeMarks'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const quiz = await Quiz.findByPk(quizId, { attributes: ['id', 'title', 'totalQuestions', 'timeLimit'] });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        const submissions = attempts.map(a => {
            const json = a.toJSON();
            let gainedMarks = 0, positiveTotal = 0, negativeTotal = 0, totalMaxMarks = 0;
            (json.UserAnswers || []).forEach(ua => {
                const q = ua.Question;
                if (q) {
                    totalMaxMarks += q.positiveMarks || 1;
                    if (ua.isCorrect) positiveTotal += q.positiveMarks || 1;
                    else if (ua.selectedOption !== null || (ua.shortAnswer && ua.shortAnswer.trim() !== ''))
                        negativeTotal += q.negativeMarks || 0;
                }
            });
            gainedMarks = positiveTotal - negativeTotal;
            return {
                ...json,
                marks: { gainedMarks, positiveTotal, negativeTotal, totalMaxMarks }
            };
        });

        res.json({ success: true, quiz, submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
