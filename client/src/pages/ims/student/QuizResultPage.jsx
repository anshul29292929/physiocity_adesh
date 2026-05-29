import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    CheckCircle2, XCircle, Award, Zap, Clock, Flag, 
    BarChart3, RotateCcw, BookMarked, ChevronLeft 
} from "lucide-react";
import { QuizContext } from '../../../context/QuizContext';
import { AppContext } from '../../../context/AppContext';
import { toast } from 'react-toastify';

const QuizResultPage = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, token } = useContext(AppContext);
    const { startQuiz } = useContext(QuizContext);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins === 0 ? `${secs}s` : `${mins}m ${secs}s`;
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!results) return (
        <div className="text-center p-20">
            <h2 className="text-2xl font-bold text-slate-400">Result not found</h2>
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-primary font-bold">Back to Dashboard</button>
        </div>
    );

    const { score, totalQuestions, accuracy, timeTaken, rank, percentile, isPractice, UserAnswers, marks } = results;
    const answeredQs = UserAnswers?.filter(a => a.selectedOption !== null || (a.shortAnswer && a.shortAnswer.trim() !== '')).length || 0;
    const skipped = totalQuestions - answeredQs;
    const incorrect = answeredQs - score;
    const counts = results.mistakeCounts || { conceptual: 0, memory: 0, careless: 0 };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 lg:pt-28 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
                
                {/* Practice Mode Indicator */}
                {isPractice && (
                    <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                            <RotateCcw size={16} /> Practice Mode
                        </div>
                        <span className="text-[10px] text-amber-600 font-medium">This attempt won't count towards your official rank.</span>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-0.5">Assessment Report</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Performance Summary</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
                            <span className="text-2xl font-black text-primary">{marks?.gainedMarks || 0}/{marks?.totalMaxMarks || 0}</span>
                            <span className="text-[9px] uppercase tracking-widest font-black text-primary/60">Total Marks</span>
                        </div>
                        <div className="flex flex-col items-center px-4 py-2 bg-green-50 rounded-2xl border border-green-100">
                            <span className="text-2xl font-black text-green-600">{accuracy.toFixed(0)}%</span>
                            <span className="text-[9px] uppercase tracking-widest font-black text-green-600/60">Accuracy</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <ResultStatCard icon={<CheckCircle2 className="text-green-500" size={18} />} label="Pos. Marks" value={`+${marks?.positiveTotal || 0}`} color="bg-green-50/50" />
                    <ResultStatCard icon={<XCircle className="text-red-500" size={18} />} label="Neg. Marks" value={`-${marks?.negativeTotal || 0}`} color="bg-red-50/50" />
                    <ResultStatCard icon={<Award className="text-primary" size={18} />} label="Score" value={`${score}/${totalQuestions} Qs`} color="bg-primary/5" />
                    <ResultStatCard icon={<Clock className="text-blue-500" size={18} />} label="Time Taken" value={formatDuration(timeTaken)} color="bg-blue-50/50" />
                </div>

                {/* Performance Ranking (Only for Official 1st Attempts) */}
                {!isPractice && rank !== null && (
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-slate-200">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                                <Award size={24} className="text-primary" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold">Official Statistics</h4>
                                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">1st Attempt Ranking</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="px-6 py-2 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center">
                                <span className="text-[9px] uppercase tracking-widest font-black text-primary">Rank</span>
                                <span className="text-xl font-black">#{rank}</span>
                            </div>
                            <div className="px-6 py-2 bg-white/10 rounded-xl border border-white/10 flex flex-col items-center">
                                <span className="text-[9px] uppercase tracking-widest font-black text-primary">Percentile</span>
                                <span className="text-xl font-black">{percentile}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detailed Analysis Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <h3 className="text-[11px] uppercase font-black text-slate-400 tracking-wider mb-5 flex items-center gap-2">
                            <BarChart3 size={14} /> Format Analysis
                        </h3>
                        <div className="space-y-5">
                            {['mcq', 'short_answer'].map(type => {
                                const typeQs = UserAnswers.filter(ua => ua.Question?.responseType === type);
                                if (typeQs.length === 0) return null;
                                
                                const typeCorrect = typeQs.filter(ua => ua.isCorrect).length;
                                const percentage = Math.round((typeCorrect / typeQs.length) * 100);
                                
                                return (
                                    <div key={type} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-slate-600">{type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}</span>
                                            <span className={percentage > 70 ? "text-green-600" : percentage > 40 ? "text-amber-600" : "text-red-600"}>{percentage}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${type === 'mcq' ? 'bg-blue-500' : 'bg-purple-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold">
                                            {typeCorrect} correct out of {typeQs.length} questions
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col">
                        <h3 className="text-[11px] uppercase font-black text-slate-400 tracking-wider mb-5 flex items-center gap-2">
                            <Clock size={14} /> Time Efficiency
                        </h3>
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <div className="relative w-28 h-28 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                        className="text-primary"
                                        strokeDasharray={301.6}
                                        strokeDashoffset={301.6 - (Math.min(100, (timeTaken / (totalQuestions * 60)) * 100) / 100) * 301.6}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-slate-900 leading-none">
                                        {timeTaken > 0 ? (timeTaken / totalQuestions).toFixed(0) : 0}s
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Avg/Q</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[11px] text-slate-500 font-bold leading-tight">
                                    Total: {formatDuration(timeTaken)}
                                </p>
                                <div className="mt-3 px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-600 inline-block shadow-sm">
                                    Pace: {timeTaken / totalQuestions < 30 ? "⚡ Speedster" : "🐢 Methodical"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => navigate(`/quiz/review/${attemptId}`)} 
                        className="group flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <BookMarked size={18} className="group-hover:scale-110 transition-transform" /> Review Solutions
                    </button>
                    <button 
                        onClick={() => startQuiz(results.type).then(() => navigate(`/take-quiz/${results.type}`))} 
                        className="flex-1 py-4 bg-white text-slate-900 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <RotateCcw size={18} /> Re-attempt
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200"
                    >
                        <ChevronLeft size={16} /> Exit
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResultStatCard = ({ icon, label, value, color }) => (
    <div className={`${color} p-4 rounded-2xl border border-white/50 flex items-center gap-4 shadow-sm`}>
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            {icon}
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
            <span className="text-lg font-black text-slate-900 leading-none">{value}</span>
        </div>
    </div>
);


export default QuizResultPage;
