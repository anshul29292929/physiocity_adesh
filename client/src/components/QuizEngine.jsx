import React, { useContext, useState, useEffect, useRef } from "react";
import { QuizContext } from "../context/QuizContext";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Timer, Flag, BookMarked, CheckCircle2, XCircle, LayoutGrid, Zap, Clock, Edit } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const QuizEngine = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { backendUrl } = useContext(AppContext);
    const {
        questions, currentIndex, userAnswers,
        quizStarted, quizCompleted,
        timeRemaining, formatTime, quizzes, fetchQuizzes,
        nextQuestion, prevQuestion, setCurrentIndex, submitQuiz, startQuiz, resetQuiz, handleAnswerSelection,
        updateQuestionTime, results, totalTimeTaken
    } = useContext(QuizContext);

    const [showNavPanel, setShowNavPanel] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    useEffect(() => {
        if (quizzes.length === 0) {
            fetchQuizzes();
        }
    }, [quizzes, fetchQuizzes]);

    // Find current quiz details
    const currentQuiz = quizzes.find(q => q.id === parseInt(id));

    // Auto-redirect handles completion logic
    
    // Auto-redirect when quiz completes (handles timer expiry & manual submission)
    useEffect(() => {
        if (quizCompleted && results?.attemptId) {
            navigate(`/quiz/result/${results.attemptId}`);
        }
    }, [quizCompleted, results, navigate]);

    const handleExit = () => {
        resetQuiz();
        navigate("/quiz");
    };

    const onFinish = () => {
        setShowConfirmPopup(true);
    };

    const confirmSubmission = async () => {
        setShowConfirmPopup(false);
        setIsSubmitting(true);
        try {
            await submitQuiz(totalTimeTaken);
        } catch (error) {
            setIsSubmitting(false);
            toast.error("Failed to submit. Please try again.");
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) return `${secs}s`;
        return `${mins}m ${secs}s`;
    };

    // --- PRE-QUIZ SCREEN ---
    if (!quizStarted && !quizCompleted) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="flex flex-col md:grid md:grid-cols-5 md:min-h-[440px]">
                        
                        {/* Left Side: Instructions & Rules */}
                        <div className="md:col-span-3 p-6 md:p-8 flex flex-col gap-5 border-b md:border-b-0 md:border-r border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-center flex-shrink-0">
                                    <BookMarked className="text-primary" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{currentQuiz?.title || "Quiz Instructions"}</h2>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{currentQuiz?.category || "Medical Assessment"}</p>
                                </div>
                            </div>

                            {currentQuiz?.description && (
                                <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100/50">
                                    <p className="text-slate-600 text-xs leading-relaxed italic line-clamp-3">
                                        "{currentQuiz.description}"
                                    </p>
                                </div>
                            )}

                            <div className="flex-1 space-y-3">
                                <h3 className="text-[11px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                                    <LayoutGrid size={14} className="text-primary" /> Rules and Regulations
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        "Time-bound assessment with auto-submission.",
                                        "Balanced pacing per question is highly encouraged.",
                                        "Accuracy is prioritized over speed for learning.",
                                        "Negative marks may apply per question format.",
                                    ].map((rule, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50/50 rounded-lg border border-slate-50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                            <span className="text-[11px] text-slate-600 font-medium">{rule}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Quick Stats & Start Button */}
                        <div className="md:col-span-2 bg-slate-50/30 p-6 md:p-8 flex flex-col justify-between gap-6">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-1">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{currentQuiz?.totalQuestions || 0}</span>
                                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Questions</span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-1">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{Math.floor((currentQuiz?.timeLimit || 0) / 60)}m</span>
                                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Duration</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="flex items-start gap-3 p-4 bg-white/80 rounded-2xl border border-slate-200 cursor-pointer group hover:border-primary/30 transition-all shadow-sm">
                                    <input 
                                        type="checkbox" 
                                        checked={agreed} 
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="mt-0.5"
                                    />
                                    <span className="text-[11px] text-slate-500 font-medium leading-tight group-hover:text-slate-900 transition-colors">
                                        I am ready to start the assessment and will follow all instructions carefully.
                                    </span>
                                </label>

                                <div className="space-y-2">
                                    <button 
                                        onClick={() => startQuiz(id || 'mixed')} 
                                        disabled={!agreed}
                                        className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${agreed ? "bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 shadow-primary/20" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
                                    >
                                        <Zap size={18} /> Start Quiz
                                    </button>
                                    <button onClick={handleExit} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-primary transition-all flex items-center justify-center gap-2">
                                        Cancel & Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- QUIZ-TAKING SCREEN ---
    const currentQuestion = questions[currentIndex];
    const currentAnswer = userAnswers[currentIndex];
    const answeredCount = userAnswers.filter(a => a && (a.selectedOption !== null || (a.shortAnswer && a.shortAnswer.trim() !== ''))).length;

    const QuestionNavButton = ({ idx }) => {
        const ans = userAnswers[idx];
        const isAnswered = ans && (ans.selectedOption !== null || (ans.shortAnswer && ans.shortAnswer.trim() !== ""));
        const isCurrent = currentIndex === idx;
        return (
            <button
                onClick={() => { setCurrentIndex(idx); setShowNavPanel(false); }}
                className={`aspect-square flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                    isCurrent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : isAnswered ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                    : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                }`}
            >
                {idx + 1}
            </button>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-3 md:p-6 min-h-screen flex flex-col gap-3 md:gap-6 relative">
            {/* Submission Loader & Confirmation Popup */}
            <AnimatePresence>
                {showConfirmPopup && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowConfirmPopup(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-6"
                        >
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                                <Flag size={32} className="text-amber-500" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-black text-slate-900">Submit Assessment?</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                    You have completed most of the questions. Are you ready to submit your results for final evaluation?
                                </p>
                            </div>
                            <div className="flex flex-col w-full gap-3 mt-2">
                                <button 
                                    onClick={confirmSubmission}
                                    className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest text-xs"
                                >
                                    Yes, Submit Now
                                </button>
                                <button 
                                    onClick={() => setShowConfirmPopup(false)}
                                    className="w-full py-4 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
                                >
                                    Wait, Let me Review
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {isSubmitting && (
                <div className="fixed inset-0 z-[120] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                    <div className="flex flex-col items-center">
                        <p className="text-lg font-black text-slate-900">Submitting Assessment...</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Please do not refresh the page</p>
                    </div>
                </div>
            )}

            {/* Sticky Header - Mobile Optimized */}
            <div className="sticky top-16 md:top-20 z-20 flex items-center justify-between bg-white/90 backdrop-blur-md px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Mobile nav toggle */}
                    <button
                        onClick={() => setShowNavPanel(p => !p)}
                        className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${showNavPanel ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}
                    >
                        <LayoutGrid size={17} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-slate-400">Progress</span>
                        <div className="flex items-center gap-1">
                            <span className="text-base md:text-lg font-bold text-slate-900">{answeredCount}</span>
                            <span className="text-xs font-bold text-slate-400">/{questions.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-sm transition-all ${timeRemaining < 60 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-900 text-white border-transparent'}`}>
                        <Timer size={15} />
                        <span className="font-mono">{formatTime(timeRemaining)}</span>
                    </div>
                    <button 
                    onClick={onFinish}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                >
                    <CheckCircle2 size={14} /> Submit Quiz
                </button>
                </div>
            </div>

            {/* Mobile Quick Nav Panel */}
            <AnimatePresence>
                {showNavPanel && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-4 overflow-hidden"
                    >
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto">
                            {questions.map((_, idx) => <QuestionNavButton key={idx} idx={idx} />)}
                        </div>
                        <div className="flex items-center gap-3 mt-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <div className="w-2.5 h-2.5 rounded-md bg-indigo-600" /> Current
                            <div className="w-2.5 h-2.5 rounded-md bg-green-100 border border-green-200" /> Answered
                            <div className="w-2.5 h-2.5 rounded-md bg-slate-100 border border-slate-200" /> Unseen
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start">
                {/* Main Question View */}
                <div className="flex-1 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-5 md:gap-6 min-h-[260px]"
                        >
                            {/* Question Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 md:gap-4 flex-1">
                                    <span className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm md:text-base shadow-lg shadow-indigo-100">
                                        {currentIndex + 1}
                                    </span>
                                    <div className="flex flex-col gap-2 md:gap-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-base md:text-xl font-bold text-slate-900 leading-snug">
                                                {currentQuestion?.text}
                                            </h2>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-black rounded-lg border border-green-100">+{currentQuestion?.positiveMarks || 1}</span>
                                                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black rounded-lg border border-red-100">-{currentQuestion?.negativeMarks || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-bold whitespace-nowrap flex-shrink-0">
                                    <Clock size={12} /> {formatDuration(currentAnswer?.timeTaken || 0)}
                                </div>
                            </div>

                            {/* Question Image (Responsive) */}
                            {currentQuestion?.image && (
                                <div className="w-full flex justify-center bg-slate-50/30 rounded-xl p-1 md:p-1.5 border border-slate-100/50">
                                    <img 
                                        src={currentQuestion.image.startsWith('http') ? currentQuestion.image : `${backendUrl}${currentQuestion.image}`} 
                                        alt="Question Visual" 
                                        className="max-w-full h-auto max-h-[130px] md:max-h-[220px] object-contain rounded-lg shadow-sm"
                                    />
                                </div>
                            )}

                            {/* Options */}
                            <div className="pl-0 md:pl-12">
                                {currentQuestion?.responseType === 'mcq' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {(currentQuestion.options || []).map((option, oIdx) => (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleAnswerSelection(currentIndex, oIdx)}
                                                className={`group p-3.5 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all duration-200 flex items-center gap-3 text-left ${
                                                    currentAnswer?.selectedOption === oIdx
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 -translate-y-0.5'
                                                        : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                <span className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                                                    currentAnswer?.selectedOption === oIdx
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                                }`}>
                                                    {String.fromCharCode(65 + oIdx)}
                                                </span>
                                                <span className="font-semibold text-xs md:text-sm leading-snug">{option}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Type your answer here..."
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-sm md:text-base text-slate-800"
                                            value={currentAnswer?.shortAnswer || ''}
                                            onChange={(e) => handleAnswerSelection(currentIndex, e.target.value)}
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                                            <Edit size={18} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between pt-4 md:pt-5 border-t border-slate-50">
                                <button
                                    onClick={prevQuestion}
                                    disabled={currentIndex === 0}
                                    className={`px-4 py-2 md:px-5 md:py-3 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs md:text-sm ${
                                        currentIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <ChevronLeft size={16} /> Prev
                                </button>

                                <div className="text-slate-400 font-bold text-xs md:text-[13px]">
                                    {currentIndex + 1} / {questions.length}
                                </div>

                                <button
                                    onClick={nextQuestion}
                                    disabled={currentIndex === questions.length - 1}
                                    className={`px-5 py-2 md:px-8 md:py-3 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs md:text-sm ${
                                        currentIndex === questions.length - 1
                                            ? 'text-slate-300 cursor-not-allowed'
                                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                                    }`}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden lg:flex w-72 xl:w-80 flex-col sticky top-40">
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                <LayoutGrid size={14} className="text-indigo-600" /> Questions
                            </h3>
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black tracking-widest">QUICK NAV</span>
                        </div>

                        <div className="grid grid-cols-5 gap-2 max-h-[280px] overflow-y-auto pr-1">
                            {questions.map((_, idx) => {
                                const ans = userAnswers[idx];
                                const isAnswered = ans && (ans.selectedOption !== null || (ans.shortAnswer && ans.shortAnswer.trim() !== ""));
                                const isCurrent = currentIndex === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-full aspect-square flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                                            isCurrent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110 z-10'
                                            : isAnswered ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                                            : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-5 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 flex-wrap gap-y-1.5">
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-md bg-indigo-600" /> Current</div>
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-md bg-green-100 border border-green-200" /> Answered</div>
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-md bg-slate-50 border border-slate-200" /> Unseen</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pb-20" />
        </div>
    );
};

export default QuizEngine;
