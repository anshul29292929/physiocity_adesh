import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import {
    ChevronLeft, Search, CheckCircle, XCircle, Clock, Users,
    Trophy, Target, ChevronDown, ChevronUp, Filter, Award, Zap
} from 'lucide-react';
import UserAvatar from '../../../components/ims/admin/UserAvatar';

const QuizSubmissions = () => {
    const { quizId } = useParams();
    const { backendUrl, adminToken, navigate } = useContext(AppContext);
    const [quiz, setQuiz] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [attemptFilter, setAttemptFilter] = useState('all'); // all | official | practice
    const [sortBy, setSortBy] = useState('date'); // date | score | time

    useEffect(() => {
        if (adminToken && quizId) fetchSubmissions();
    }, [adminToken, quizId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/quiz/quiz/${quizId}/submissions`, {
                headers: { admintoken: adminToken }
            });
            if (data.success) {
                setQuiz(data.quiz);
                setSubmissions(data.submissions);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filtered = submissions
        .filter(s => {
            const nameMatch = s.User?.name?.toLowerCase().includes(search.toLowerCase()) ||
                s.User?.email?.toLowerCase().includes(search.toLowerCase());
            const typeMatch = attemptFilter === 'all' ||
                (attemptFilter === 'official' && !s.isPractice) ||
                (attemptFilter === 'practice' && s.isPractice);
            return nameMatch && typeMatch;
        })
        .sort((a, b) => {
            if (sortBy === 'score') return (b.score ?? 0) - (a.score ?? 0);
            if (sortBy === 'time') return (a.timeTaken ?? 0) - (b.timeTaken ?? 0);
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const formatTime = (secs) => {
        if (!secs) return '—';
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Summary stats
    const officialAttempts = submissions.filter(s => !s.isPractice);
    const avgScore = officialAttempts.length
        ? (officialAttempts.reduce((a, s) => a + (s.score || 0), 0) / officialAttempts.length).toFixed(1)
        : 0;
    const avgTime = officialAttempts.length
        ? Math.round(officialAttempts.reduce((a, s) => a + (s.timeTaken || 0), 0) / officialAttempts.length)
        : 0;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/admin/quizzes')}
                        className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all border border-slate-100"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">
                            {quiz ? quiz.title : 'Quiz Submissions'}
                        </h1>
                        <p className="text-sm text-slate-400 font-medium">All student attempt records</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Attempts', value: submissions.length, icon: <Users size={20} />, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Official', value: officialAttempts.length, icon: <Award size={20} />, color: 'text-indigo-600 bg-indigo-50' },
                        { label: 'Avg Score', value: `${avgScore}%`, icon: <Trophy size={20} />, color: 'text-amber-600 bg-amber-50' },
                        { label: 'Avg Time', value: formatTime(avgTime), icon: <Clock size={20} />, color: 'text-emerald-600 bg-emerald-50' },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900">{card.value}</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{card.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap gap-3 mb-5 items-center">
                    <div className="flex-1 min-w-[220px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                        <Filter size={14} className="text-slate-400" />
                        <select
                            value={attemptFilter}
                            onChange={e => setAttemptFilter(e.target.value)}
                            className="text-sm font-bold text-slate-600 outline-none bg-transparent"
                        >
                            <option value="all">All Attempts</option>
                            <option value="official">Official Only</option>
                            <option value="practice">Practice Only</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                        <Zap size={14} className="text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="text-sm font-bold text-slate-600 outline-none bg-transparent"
                        >
                            <option value="date">Sort: Latest</option>
                            <option value="score">Sort: Score</option>
                            <option value="time">Sort: Fastest</option>
                        </select>
                    </div>
                    <span className="text-xs font-bold text-slate-400 ml-auto">{filtered.length} result(s)</span>
                </div>

                {/* Submissions Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-24 text-slate-400">Loading submissions...</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center text-slate-400 italic">No submissions found.</div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((s, idx) => {
                            const isExpanded = expandedId === s.id;
                            const pct = s.marks?.totalMaxMarks > 0
                                ? Math.round((s.marks.gainedMarks / s.marks.totalMaxMarks) * 100)
                                : s.score ?? 0;

                            return (
                                <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    {/* Row Summary */}
                                    <div
                                        className="flex flex-wrap items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-all"
                                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                                    >
                                        {/* Rank / Index */}
                                        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-black flex items-center justify-center flex-shrink-0">
                                            {idx + 1}
                                        </span>

                                        {/* User */}
                                        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                                            <UserAvatar imageUrl={s.User?.imageUrl} name={s.User?.name} size="md" />
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{s.User?.name ?? 'Unknown'}</p>
                                                <p className="text-[10px] text-slate-400">{s.User?.email}</p>
                                            </div>
                                        </div>

                                        {/* Score bar */}
                                        <div className="flex flex-col gap-1 min-w-[120px]">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                <span>Score</span>
                                                <span className={pct >= 60 ? 'text-emerald-600' : 'text-red-500'}>{pct}%</span>
                                            </div>
                                            <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${pct >= 60 ? 'bg-emerald-500' : 'bg-red-400'}`}
                                                    style={{ width: `${Math.max(0, pct)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Marks */}
                                        <div className="text-center min-w-[90px]">
                                            <p className="text-sm font-black text-slate-800">
                                                {s.marks?.gainedMarks?.toFixed(1) ?? s.score ?? '—'} / {s.marks?.totalMaxMarks?.toFixed(1) ?? '—'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Marks</p>
                                        </div>

                                        {/* Correct / Wrong */}
                                        <div className="flex items-center gap-3 text-sm font-black">
                                            <span className="flex items-center gap-1 text-emerald-600">
                                                <CheckCircle size={14} /> {s.correctAnswers ?? 0}
                                            </span>
                                            <span className="flex items-center gap-1 text-red-500">
                                                <XCircle size={14} /> {(s.totalQuestions ?? 0) - (s.correctAnswers ?? 0)}
                                            </span>
                                        </div>

                                        {/* Time */}
                                        <div className="flex items-center gap-1 text-slate-500 text-sm font-bold min-w-[70px]">
                                            <Clock size={14} className="text-slate-400" />
                                            {formatTime(s.timeTaken)}
                                        </div>

                                        {/* Badge */}
                                        <div className="flex items-center gap-2">
                                            {s.isPractice ? (
                                                <span className="text-[10px] uppercase font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-lg">Practice</span>
                                            ) : (
                                                <span className="text-[10px] uppercase font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">Official</span>
                                            )}
                                        </div>

                                        {/* Date */}
                                        <div className="text-[11px] text-slate-400 font-medium ml-auto hidden md:block">
                                            {formatDate(s.createdAt)}
                                        </div>

                                        {/* Expand toggle */}
                                        <div className="text-slate-400">
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>

                                    {/* Expanded: Per-question answers */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-50 px-5 py-4 bg-slate-50/70">
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Per-Question Answers</p>
                                            {/* Mark summary */}
                                            <div className="flex flex-wrap gap-3 mb-4">
                                                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl">
                                                    +{s.marks?.positiveTotal?.toFixed(1)} Positive
                                                </span>
                                                <span className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1 rounded-xl">
                                                    -{s.marks?.negativeTotal?.toFixed(1)} Negative
                                                </span>
                                                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl">
                                                    Net: {s.marks?.gainedMarks?.toFixed(1)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {(s.UserAnswers || []).map((ua, qi) => {
                                                    const q = ua.Question;
                                                    if (!q) return null;
                                                    const options = (() => { try { return JSON.parse(q.options || '[]'); } catch { return []; } })();
                                                    const userAns = ua.selectedOption !== null && ua.selectedOption !== undefined
                                                        ? options[ua.selectedOption] ?? `Option ${ua.selectedOption + 1}`
                                                        : ua.shortAnswer ?? '—';
                                                    const correctAns = q.correctOption !== null && q.correctOption !== undefined
                                                        ? options[q.correctOption] ?? `Option ${q.correctOption + 1}`
                                                        : q.correctAnswer ?? '—';

                                                    return (
                                                        <div
                                                            key={ua.id}
                                                            className={`rounded-2xl p-4 border ${ua.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}
                                                        >
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <p className="text-xs font-bold text-slate-700 leading-snug flex-1">
                                                                    <span className="text-slate-400 mr-1">Q{qi + 1}.</span>
                                                                    {q.text}
                                                                </p>
                                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                                    {ua.isCorrect ? (
                                                                        <CheckCircle size={16} className="text-emerald-600" />
                                                                    ) : (
                                                                        <XCircle size={16} className="text-red-500" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                                                                <span className={`px-2 py-0.5 rounded-lg ${ua.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                                    Answered: {userAns}
                                                                </span>
                                                                {!ua.isCorrect && (
                                                                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                                                                        Correct: {correctAns}
                                                                    </span>
                                                                )}
                                                                {ua.timeTaken !== null && (
                                                                    <span className="px-2 py-0.5 rounded-lg bg-white text-slate-500 border border-slate-100">
                                                                        <Clock size={10} className="inline mr-1" />{formatTime(ua.timeTaken)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizSubmissions;
