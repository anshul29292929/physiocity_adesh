import axios from "axios";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";
import { toast } from "react-toastify";

export const QuizContext = createContext();

export const QuizContextProvider = (props) => {
    const { backendUrl, token, userData } = useContext(AppContext);
    const navigate = useNavigate();
    
    // Quiz Environment State
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [results, setResults] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [quizType, setQuizType] = useState('mixed');
    const [totalTimeTaken, setTotalTimeTaken] = useState(0);
    
    // Global App State moved to context
    const [quizzes, setQuizzes] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const timerRef = useRef(null);

    // --- Data Fetching ---

    const fetchQuizzes = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/quiz/all`, {
                headers: { token }
            });
            if (data.success) {
                setQuizzes(data.quizzes);
            }
        } catch (error) {
            console.error("FetchQuizzes Error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/quiz/attempts`, {
                headers: { token }
            });
            if (data.success) {
                setHistory(data.attempts);
            }
        } catch (error) {
            console.error("FetchHistory Error:", error.message);
        }
    };

    // --- Quiz Logic ---

    const startQuiz = async (type = 'mixed', forcedTimeRemaining = null) => {
        try {
            setQuizType(type);
            let url = `${backendUrl}/api/quiz/random`;
            
            if (!isNaN(type)) {
                url = `${backendUrl}/api/quiz/questions/${type}`;
            } else if (type === 'mistake' && userData) {
                url = `${backendUrl}/api/quiz/mistakes/${userData.id}`;
            }

            const { data } = await axios.get(url, { headers: { token } });
            
            if (data.success) {
                const parsedQuestions = data.questions.map(q => ({
                    ...q,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || [])
                }));
                setQuestions(parsedQuestions);
                setCurrentIndex(0);
                setUserAnswers(new Array(data.questions.length).fill(null).map((_, i) => ({
                    questionId: data.questions[i].id,
                    selectedOption: null,
                    shortAnswer: '',
                    mistakeType: 'none',
                    timeTaken: 0
                })));
                setQuizStarted(true);
                setQuizCompleted(false);
                setResults(null);
                setTotalTimeTaken(0);
                
                if (forcedTimeRemaining !== null) {
                    setTimeRemaining(forcedTimeRemaining);
                } else if (data.quiz && data.quiz.timeLimit) {
                    const deadline = Date.now() + data.quiz.timeLimit * 1000;
                    localStorage.setItem('quiz_deadline', deadline);
                    localStorage.setItem('active_quiz_id', type);
                    setTimeRemaining(data.quiz.timeLimit);
                } else {
                    const duration = data.questions.length * 60;
                    const deadline = Date.now() + duration * 1000;
                    localStorage.setItem('quiz_deadline', deadline);
                    localStorage.setItem('active_quiz_id', type);
                    setTimeRemaining(duration);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Auto-resume logic
    useEffect(() => {
        const activeId = localStorage.getItem('active_quiz_id');
        const deadline = localStorage.getItem('quiz_deadline');
        if (activeId && deadline && !quizStarted && token) {
            const remaining = Math.max(0, Math.floor((parseInt(deadline) - Date.now()) / 1000));
            if (remaining > 0) {
                startQuiz(activeId, remaining);
            } else {
                localStorage.removeItem('active_quiz_id');
                localStorage.removeItem('quiz_deadline');
            }
        }
    }, [token]);

    const submitQuiz = async (providedTotalTime = null) => {
        if (quizCompleted) return;
        
        try {
            const finalTotalTime = providedTotalTime !== null ? providedTotalTime : totalTimeTaken;
            const { data } = await axios.post(`${backendUrl}/api/quiz/submit`, {
                userId: userData.id,
                answers: userAnswers,
                type: quizType,
                timeTaken: finalTotalTime
            }, { headers: { token } });

            if (data.success) {
                setResults(data);
                setQuizCompleted(true);
                setQuizStarted(false);
                if (timerRef.current) clearInterval(timerRef.current);
                localStorage.removeItem('quiz_deadline');
                localStorage.removeItem('active_quiz_id');
                toast.success("Quiz submitted successfully!");
                // Refresh history after submission
                fetchHistory();
                return data; // Return data so caller can navigate
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleAnswerSelection = (index, value, mistakeType = 'none') => {
        setUserAnswers(prev => {
            const newAnswers = [...prev];
            const question = questions[index];
            if (!newAnswers[index]) return prev;
            
            if (question.responseType === 'mcq') {
                newAnswers[index] = {
                    ...newAnswers[index],
                    selectedOption: value,
                    mistakeType
                };
            } else {
                newAnswers[index] = {
                    ...newAnswers[index],
                    shortAnswer: value,
                    mistakeType
                };
            }
            return newAnswers;
        });
    };

    const updateQuestionTime = (index, seconds) => {
        setUserAnswers(prev => {
            const newAnswers = [...prev];
            if (newAnswers[index]) {
                newAnswers[index] = {
                    ...newAnswers[index],
                    timeTaken: (newAnswers[index].timeTaken || 0) + seconds
                };
                return newAnswers;
            }
            return prev;
        });
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    useEffect(() => {
        if (quizStarted && !quizCompleted) {
            timerRef.current = setInterval(() => {
                const deadline = localStorage.getItem('quiz_deadline');
                
                // 1. Update per-question time
                setUserAnswers(prev => {
                    const newAnswers = [...prev];
                    if (newAnswers[currentIndex]) {
                        newAnswers[currentIndex] = {
                            ...newAnswers[currentIndex],
                            timeTaken: (newAnswers[currentIndex].timeTaken || 0) + 1
                        };
                        return newAnswers;
                    }
                    return prev;
                });

                // 2. Update total time taken
                setTotalTimeTaken(prev => prev + 1);

                // 3. Update time remaining & check deadline
                if (deadline) {
                    const remaining = Math.max(0, Math.floor((parseInt(deadline) - Date.now()) / 1000));
                    setTimeRemaining(remaining);
                    if (remaining <= 0) {
                        clearInterval(timerRef.current);
                        submitQuiz(); // Auto-submit with state-tracked totalTimeTaken
                    }
                } else {
                    setTimeRemaining(prev => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current);
                            submitQuiz();
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [quizStarted, quizCompleted, currentIndex]);

    const viewPastAttempt = async (attemptData) => {
        // Handle both ID and full object
        const attemptId = typeof attemptData === 'object' ? attemptData.id : attemptData;
        
        try {
            const { data } = await axios.get(`${backendUrl}/api/quiz/attempt/${attemptId}`, {
                headers: { token }
            });
            
            if (data.success) {
                const attempt = data.attempt;
                
                // Map UserAnswers back to the format QuizEngine expects
                const historicalQuestions = (attempt.UserAnswers || []).map(ua => ua.Question);
                const historicalUserAnswers = (attempt.UserAnswers || []).map(ua => ({
                    questionId: ua.questionId,
                    selectedOption: ua.selectedOption,
                    shortAnswer: ua.shortAnswer,
                    mistakeType: ua.mistakeType,
                    timeTaken: ua.timeTaken
                }));

                // Parse mistakeCounts if it's a string
                let counts = attempt.mistakeCounts;
                if (typeof counts === 'string') {
                    try { counts = JSON.parse(counts); } catch (e) { counts = { conceptual: 0, memory: 0, careless: 0 }; }
                }

                setQuestions(historicalQuestions);
                setUserAnswers(historicalUserAnswers);
                setResults({
                    score: attempt.score,
                    accuracy: attempt.accuracy,
                    mistakeCounts: counts,
                    totalQuestions: attempt.totalQuestions,
                    type: attempt.type,
                    timeTaken: attempt.timeTaken
                });
                
                setQuizCompleted(true);
                setQuizStarted(false);
                setCurrentIndex(0);
                
                navigate(`/take-quiz/${attempt.type}`, { state: { viewSolutions: true } });
            }
        } catch (error) {
            console.error("ViewPastAttempt Error:", error);
            toast.error("Failed to load attempt details");
        }
    };

    const resetQuiz = () => {
        setQuestions([]);
        setCurrentIndex(0);
        setUserAnswers([]);
        setQuizStarted(false);
        setQuizCompleted(false);
        setResults(null);
        setTimeRemaining(0);
        localStorage.removeItem('quiz_deadline');
        localStorage.removeItem('active_quiz_id');
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const value = {
        questions, currentIndex, userAnswers, quizStarted, quizCompleted, results,
        timeRemaining, formatTime, quizzes, history, loading,
        nextQuestion, prevQuestion, setCurrentIndex, submitQuiz, startQuiz, resetQuiz, 
        handleAnswerSelection, updateQuestionTime, fetchQuizzes, fetchHistory, viewPastAttempt
    };

    return (
        <QuizContext.Provider value={value}>
            {props.children}
        </QuizContext.Provider>
    );
};

export default QuizContextProvider;
