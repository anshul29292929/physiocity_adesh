import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronLeft, ChevronRight, CheckCircle2, XCircle, 
    BookMarked, Bookmark, BookmarkCheck, Award, Clock, Zap
} from "lucide-react";
import { QuizContext } from '../../../context/QuizContext';
import { AppContext } from '../../../context/AppContext';
import { toast } from 'react-toastify';

const QuizReviewPage = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, token } = useContext(AppContext);
    const { toggleBookmark, bookmarks } = useContext(QuizContext);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewIndex, setReviewIndex] = useState(0);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/quiz/attempt/${attemptId}`, {
                    headers: { token }
                });
                if (data.success) {
                    setResults(data.attempt);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchResults();
    }, [attemptId, token]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!results || !results.UserAnswers || results.UserAnswers.length === 0) return (
        <div className="text-center p-20">
            <h2 className="text-2xl font-bold text-slate-400">Review not available</h2>
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-primary font-bold">Back to Dashboard</button>
        </div>
    );

    const qa = results.UserAnswers[reviewIndex];
    const question = qa.Question;
    const isBookmarked = bookmarks?.some(b => b.questionId === question.id);

    const avgTime = results.UserAnswers.length > 0 ? (results.timeTaken / results.UserAnswers.length).toFixed(1) : 0;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 lg:pt-24 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Review Header */}
            <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    <ChevronLeft size={18} /> Back
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-black text-slate-900">Review Solutions</h2>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Question {reviewIndex + 1} of {results.UserAnswers.length} • Avg: {avgTime}s • Score: {results.marks?.gainedMarks || results.score}/{results.marks?.totalMaxMarks || results.totalQuestions}
                    </span>
                </div>
                <button 
                    onClick={() => toggleBookmark(question.id)}
                    className={`p-2 rounded-xl transition-all ${isBookmarked ? 'bg-amber-50 text-amber-500' : 'text-slate-300 hover:text-slate-400'}`}
                >
                    {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                </button>
            </div>

            {/* Question Card */}
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${qa.isCorrect ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                {qa.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <Clock size={12} /> {qa.timeTaken || 0}s
                            </span>
                             <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${qa.isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                {qa.isCorrect ? `+${question.positiveMarks}` : `-${question.negativeMarks}`}
                            </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {question.responseType === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
                        </span>
                    </div>
                    <div className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
                        {question.text}
                    </div>
                    {question.imageUrl && (
                        <img src={question.imageUrl} alt="Question" className="max-h-60 object-contain rounded-2xl bg-slate-50 p-2" />
                    )}
                </div>

                {/* Options / Answer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.responseType === 'mcq' ? (
                        (typeof question.options === 'string' ? JSON.parse(question.options) : question.options).map((opt, idx) => {
                            const isUserSelected = qa.selectedOption === idx;
                            const isCorrect = question.correctOption === idx;
                            
                            let statusClasses = "bg-slate-50 border-slate-100 text-slate-600";
                            if (isCorrect) statusClasses = "bg-green-50 border-green-200 text-green-700 ring-2 ring-green-100";
                            if (isUserSelected && !isCorrect) statusClasses = "bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100";

                            return (
                                <div key={idx} className={`p-3 md:p-4 rounded-xl border-2 transition-all flex items-center justify-between font-bold text-[13px] ${statusClasses}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] ${isCorrect ? 'bg-green-500 text-white' : 'bg-white shadow-sm'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        {opt}
                                    </div>
                                    {isCorrect && <CheckCircle2 size={18} />}
                                    {isUserSelected && !isCorrect && <XCircle size={18} />}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className={`p-5 rounded-2xl border-2 font-bold text-sm ${qa.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <span className="text-[10px] uppercase text-slate-400 mb-2 block tracking-widest">Your Answer</span>
                                <div className={qa.isCorrect ? 'text-green-700' : 'text-red-700'}>{qa.shortAnswer || "(Skipped)"}</div>
                            </div>
                            {!qa.isCorrect && (
                                <div className="p-5 rounded-2xl border-2 border-green-200 bg-green-50 font-bold text-sm">
                                    <span className="text-[10px] uppercase text-green-600 mb-2 block tracking-widest">Correct Answer</span>
                                    <div className="text-green-700">{question.correctAnswer}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Community Insights & Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {/* Community Stats */}
                    {qa.globalStats && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={12} className="text-amber-500" /> Community Insights
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Avg Time</span>
                                    <span className="text-sm font-black text-slate-900">{qa.globalStats.avgTime}s</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Community Accuracy</span>
                                    <span className="text-sm font-black text-slate-900">{qa.globalStats.accuracy}%</span>
                                </div>
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 italic">
                                Based on {qa.globalStats.totalParticipants} recent attempts
                            </div>
                        </div>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <BookMarked size={12} /> Academic Insight
                            </h4>
                            <p className="text-[13px] text-indigo-900/70 leading-relaxed italic font-medium">
                                {typeof question.explanation === 'object' ? question.explanation.correct : question.explanation}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
                <button 
                    disabled={reviewIndex === 0}
                    onClick={() => setReviewIndex(prev => prev - 1)}
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                    <ChevronLeft size={20} /> Preview
                </button>
                <button 
                    disabled={reviewIndex === results.UserAnswers.length - 1}
                    onClick={() => setReviewIndex(prev => prev + 1)}
                    className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-200"
                >
                    Next Question <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default QuizReviewPage;
