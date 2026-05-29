import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    TrendingUp, Users, Target, AlertCircle, Bookmark, BarChart2,
    Clock, FileText, Trophy, Zap, CheckCircle, XCircle, Star, Award
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import UserAvatar from '../../../components/ims/admin/UserAvatar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const difficultyColor = {
    Easy: 'bg-emerald-50 text-emerald-600',
    Medium: 'bg-amber-50 text-amber-600',
    Hard: 'bg-red-50 text-red-600',
};

const AdminAnalytics = () => {
    const { backendUrl, adminToken } = useContext(AppContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (adminToken) fetchStats();
    }, [adminToken]);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/quiz/stats`, {
                headers: { admintoken: adminToken }
            });
            if (data.success) setStats(data.stats);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fmt = (secs) => {
        if (!secs) return '—';
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm font-bold">Loading deep analytics...</p>
        </div>
    );
    if (!stats) return null;

    const scoreLabels = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'];
    const scoreDistData = {
        labels: scoreLabels,
        datasets: [{
            label: 'Students',
            data: stats.scoreBuckets || [],
            backgroundColor: stats.scoreBuckets?.map((_, i) =>
                i < 4 ? '#fca5a5' : i < 6 ? '#fde68a' : '#6ee7b7'
            ),
            borderRadius: 10,
        }]
    };

    const attemptTypeData = {
        labels: ['Official', 'Practice'],
        datasets: [{
            data: [stats.officialCount, stats.practiceCount],
            backgroundColor: ['#6366f1', '#e2e8f0'],
            borderWidth: 0,
        }]
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-7">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Quiz Analytics</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">Deep platform-wide insights and performance metrics</p>
                </div>

                {/* ── Section 1: Platform KPIs ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Students', value: stats.totalUsers, icon: <Users size={20} />, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Total Attempts', value: stats.totalAttempts, icon: <TrendingUp size={20} />, color: 'text-indigo-600 bg-indigo-50' },
                        { label: 'Avg Score', value: `${stats.avgScore}%`, icon: <Target size={20} />, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Avg Time / Quiz', value: fmt(stats.avgTimeTaken), icon: <Clock size={20} />, color: 'text-amber-600 bg-amber-50' },
                        { label: 'Total Quizzes', value: stats.totalQuizzes, icon: <FileText size={20} />, color: 'text-violet-600 bg-violet-50' },
                        { label: 'Total Questions', value: stats.totalQuestions, icon: <Zap size={20} />, color: 'text-cyan-600 bg-cyan-50' },
                        { label: 'Official Attempts', value: stats.officialCount, icon: <Award size={20} />, color: 'text-rose-600 bg-rose-50' },
                        { label: 'Practice Attempts', value: stats.practiceCount, icon: <Star size={20} />, color: 'text-slate-600 bg-slate-100' },
                    ].map(k => (
                        <div key={k.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${k.color}`}>
                                {k.icon}
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900">{k.value}</p>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{k.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Section 2: Charts ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score Distribution */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <BarChart2 size={16} className="text-indigo-500" /> Score Distribution
                        </h3>
                        <div className="h-[220px]">
                            <Bar
                                data={scoreDistData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { weight: 'bold' } } },
                                        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Official vs Practice */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 self-start flex items-center gap-2">
                            <Target size={16} className="text-indigo-500" /> Attempt Types
                        </h3>
                        <div className="w-40 h-40">
                            <Doughnut data={attemptTypeData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom' } } }} />
                        </div>
                        <div className="flex gap-4 mt-4 text-xs font-bold">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Official: {stats.officialCount}</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> Practice: {stats.practiceCount}</span>
                        </div>
                    </div>
                </div>

                {/* ── Section 3: Per-Quiz Breakdown ── */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={16} className="text-indigo-500" /> Per-Quiz Breakdown
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                <tr>
                                    <th className="px-5 py-3 text-left">Quiz</th>
                                    <th className="px-5 py-3 text-center">Total Attempts</th>
                                    <th className="px-5 py-3 text-center">Official</th>
                                    <th className="px-5 py-3 text-center">Avg Score</th>
                                    <th className="px-5 py-3 text-center">Avg Time</th>
                                    <th className="px-5 py-3 text-center">Score Bar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(stats.perQuiz || []).length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-10 text-slate-400 italic">No quiz data yet.</td></tr>
                                ) : (stats.perQuiz || []).sort((a, b) => b.attempts - a.attempts).map(q => (
                                    <tr key={q.id} className="hover:bg-slate-50/50 transition-all">
                                        <td className="px-5 py-3">
                                            <p className="font-bold text-slate-800">{q.title}</p>
                                            <p className="text-[10px] text-slate-400">{q.totalQuestions} questions</p>
                                        </td>
                                        <td className="px-5 py-3 text-center font-black text-slate-700">{q.attempts}</td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">{q.officialAttempts}</span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`font-black text-sm ${q.avgScore >= 60 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {q.avgScore}%
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center text-slate-500 font-bold text-xs">{fmt(q.avgTime)}</td>
                                        <td className="px-5 py-3">
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden mx-auto">
                                                <div
                                                    className={`h-full rounded-full ${q.avgScore >= 60 ? 'bg-emerald-500' : 'bg-red-400'}`}
                                                    style={{ width: `${Math.max(0, q.avgScore)}%` }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Section 4: Question Intelligence ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Most Missed */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle size={16} className="text-red-500" /> Most Missed Questions
                        </h3>
                        <div className="space-y-2">
                            {(stats.mostMissed || []).length === 0
                                ? <p className="text-slate-400 italic text-sm">No data yet.</p>
                                : stats.mostMissed.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-red-50/60 rounded-2xl border border-red-50">
                                        <span className="text-xs font-black text-red-400 mt-0.5 flex-shrink-0">#{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-700 line-clamp-2">{item.Question?.text}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${difficultyColor[item.Question?.difficulty] || 'bg-slate-100 text-slate-500'}`}>
                                                    {item.Question?.difficulty}
                                                </span>
                                                <span className="text-[10px] text-red-500 font-bold">Missed {item.count}×</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Hardest Questions by Accuracy */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <XCircle size={16} className="text-orange-500" /> Hardest Questions (Lowest Accuracy)
                        </h3>
                        <div className="space-y-2">
                            {(stats.questionAccuracy || []).length === 0
                                ? <p className="text-slate-400 italic text-sm">Need ≥3 attempts per question.</p>
                                : stats.questionAccuracy.map((q, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-orange-50/50 rounded-2xl border border-orange-50">
                                        <span className="text-xs font-black text-orange-400 mt-0.5 flex-shrink-0">#{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-700 line-clamp-2">{q.text}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-orange-400 rounded-full" style={{ width: `${q.accuracy}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-orange-600">{q.accuracy}% accuracy</span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 mt-0.5">{q.correct}/{q.total} correct</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Most Bookmarked */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Bookmark size={16} className="text-amber-500" /> Most Bookmarked Questions
                        </h3>
                        <div className="space-y-2">
                            {(stats.mostBookmarked || []).length === 0
                                ? <p className="text-slate-400 italic text-sm">No bookmarks yet.</p>
                                : stats.mostBookmarked.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-2xl border border-amber-50">
                                        <span className="text-xs font-black text-amber-400 mt-0.5 flex-shrink-0">#{i + 1}</span>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700 line-clamp-2">{item.Question?.text}</p>
                                            <span className="text-[10px] text-amber-600 font-bold">Saved by {item.count} students</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>


                </div>

                {/* ── Section 5: Top Students ── */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Trophy size={16} className="text-amber-500" /> Top Performers (Official Attempts)
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {(stats.topStudents || []).length === 0
                            ? <p className="text-slate-400 italic text-sm p-6">No official data yet.</p>
                            : stats.topStudents.map((s, i) => {
                                const avgSc = parseFloat(s.dataValues?.avgScore || s['avgScore'] || 0).toFixed(1);
                                const attempts = s.dataValues?.attempts || s['attempts'] || 0;
                                const user = s.User;
                                return (
                                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                                            i === 0 ? 'bg-amber-400 text-white' :
                                            i === 1 ? 'bg-slate-300 text-slate-700' :
                                            i === 2 ? 'bg-orange-300 text-white' :
                                            'bg-slate-100 text-slate-400'
                                        }`}>{i + 1}</span>
                                        <UserAvatar imageUrl={user?.imageUrl} name={user?.name} size="md" />
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-sm">{user?.name ?? '—'}</p>
                                            <p className="text-[10px] text-slate-400">{user?.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900 text-sm">{avgSc}%</p>
                                            <p className="text-[10px] text-slate-400">{attempts} attempt{attempts !== 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="w-20">
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${Math.min(100, parseFloat(avgSc))}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminAnalytics;
