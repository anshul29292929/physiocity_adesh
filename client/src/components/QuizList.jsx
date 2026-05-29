import React, { useContext, useEffect, useState } from 'react';
import { QuizContext } from '../context/QuizContext';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BarChart3, RotateCcw, Play, Clock, ChevronRight, 
    Award, Zap, Search, Filter, Calendar, Tag, Activity, 
    CheckCircle2, XCircle, ArrowRight, BookOpen, HelpCircle,
    History, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizList = () => {
    const { 
        quizzes, 
        history, 
        loading, 
        fetchQuizzes, 
        fetchHistory,
        viewPastAttempt 
    } = useContext(QuizContext);

    const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'history'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest'

    useEffect(() => {
        fetchQuizzes();
        fetchHistory();
    }, []);

    // Tab button component for consistency
    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === id 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Learning Assessments</h1>
                    <p className="text-slate-500 mt-2 text-lg">Master your subjects through targeted practice.</p>
                </div>
                
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 self-start">
                    <TabButton id="browse" label="Browse Quizzes" icon={Search} />
                    <TabButton id="history" label="My History" icon={History} />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'browse' ? (
                    <motion.div 
                        key="browse"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                    >
                        {/* Search and Filter Bar */}
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search quizzes by title or description..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700"
                                />
                            </div>
                            
                            <div className="flex gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-48">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <select 
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full pl-10 pr-8 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold text-slate-600 cursor-pointer"
                                    >
                                        <option value="All">All Categories</option>
                                        {[...new Set(quizzes.map(q => q.category || 'General'))].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative flex-1 md:w-48">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <select 
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="w-full pl-10 pr-8 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold text-slate-600 cursor-pointer"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Quiz Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(() => {
                                let filtered = quizzes.filter(q => {
                                    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                          (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase()));
                                    const matchesCat = selectedCategory === 'All' || (q.category || 'General') === selectedCategory;
                                    return matchesSearch && matchesCat;
                                });

                                if (sortOption === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                                else if (sortOption === 'oldest') filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                                return filtered.length > 0 ? (
                                    filtered.map((quiz) => (
                                        <QuizCard key={quiz.id} quiz={quiz} />
                                    ))
                                ) : (
                                    <div className="col-span-full">
                                        <NoDataMessage icon={Search} message="No quizzes match your search criteria." />
                                    </div>
                                );
                            })()}
                        </div>
                    </motion.div>

                ) : (
                    <motion.div 
                        key="history"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {history.length > 0 ? (
                            history.map((attempt) => (
                                <HistoryCard 
                                    key={attempt.id} 
                                    attempt={attempt} 
                                    onView={() => viewPastAttempt(attempt)}
                                />
                            ))
                        ) : (
                            <NoDataMessage icon={History} message="You haven't attempted any quizzes yet." />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const QuizCard = ({ quiz }) => {
    const navigate = useNavigate();
    return (
        <div className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-primary/5 transition-colors">
                    <BookOpen className="text-slate-400 group-hover:text-primary transition-colors" size={24} />
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                        {quiz.difficulty || 'Intermediate'}
                    </span>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
                        <Tag size={10} /> {quiz.category || 'General'}
                    </span>
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{quiz.title}</h3>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-grow">{quiz.description}</p>
            
            <div className="flex items-center gap-4 mb-8 text-slate-400 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                    <Clock size={14} /> {quiz.timeLimit ? Math.floor(quiz.timeLimit / 60) : 0} mins
                </div>
                <div className="flex items-center gap-1.5">
                    <HelpCircle size={14} /> Mixed Questions
                </div>
            </div>

            <button 
                onClick={() => navigate(`/take-quiz/${quiz.id}`)}
                className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    quiz.isAttempted 
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                    : 'bg-slate-900 text-white hover:bg-primary shadow-lg shadow-primary/5'
                }`}
            >
                {quiz.isAttempted ? 'Practice Mode' : 'Start Assessment'} <ArrowRight size={18} />
            </button>
        </div>
    );
};

const HistoryCard = ({ attempt, onView }) => {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                    <History className="text-indigo-500" size={24} />
                </div>
                <div className="text-right">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-tight">Score</span>
                    <span className="text-2xl font-black text-slate-900">{attempt.score}/{attempt.totalQuestions}</span>
                </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{attempt.Quiz?.title || 'Mixed Quiz'}</h3>
            <p className="text-slate-400 text-xs mb-6">Attempted on {new Date(attempt.createdAt).toLocaleDateString('en-GB')}</p>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Accuracy</span>
                    <span className="text-sm font-bold text-slate-700">{attempt.accuracy?.toFixed(0)}%</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Time</span>
                    <span className="text-sm font-bold text-slate-700">{Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</span>
                </div>
            </div>

            <button 
                onClick={onView}
                className="w-full py-4 bg-white text-slate-900 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
                View Solutions <ChevronRight size={18} />
            </button>
        </div>
    );
};

const NoDataMessage = ({ icon: Icon, message }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
        <div className="p-5 bg-white rounded-3xl shadow-sm mb-6">
            <Icon size={40} className="text-slate-200" />
        </div>
        <p className="text-slate-500 font-medium text-lg">{message}</p>
    </div>
);

export default QuizList;
