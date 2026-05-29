import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search, Users, FileText, Clock, ChevronRight } from 'lucide-react';

const AllQuizSubmissions = () => {
    const { backendUrl, adminToken, navigate } = useContext(AppContext);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (adminToken) fetchQuizzes();
    }, [adminToken]);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/quiz/quizzes`, {
                headers: { admintoken: adminToken }
            });
            if (data.success) setQuizzes(data.quizzes);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filtered = quizzes.filter(q =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        String(q.id) === search
    );

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-7">
                    <h1 className="text-2xl font-black text-slate-900">View Submissions</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                        Select a quiz to see all student attempts and their answers.
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-5 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by title or ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    />
                </div>

                {/* Quiz Cards Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-24 text-slate-400 text-sm">Loading quizzes...</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center text-slate-400 italic text-sm">
                        No quizzes found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(q => (
                            <button
                                key={q.id}
                                onClick={() => navigate(`/admin/quiz/${q.id}/submissions`)}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-left hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col gap-3"
                            >
                                {/* ID Badge + Title */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-col flex-1">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">#{q.id}</span>
                                        <h3 className="font-black text-slate-800 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                                            {q.title}
                                        </h3>
                                    </div>
                                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-lg self-start flex-shrink-0 ${
                                        q.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                    }`}>{q.status}</span>
                                </div>

                                {/* Meta */}
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <FileText size={12} /> {q.totalQuestions} Qs
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {q.timeLimit ? `${Math.floor(q.timeLimit / 60)}m` : 'No limit'}
                                    </span>
                                    {q.isDailyQuiz && (
                                        <span className="bg-amber-50 text-amber-500 px-2 py-0.5 rounded-lg">Daily</span>
                                    )}
                                </div>

                                {/* CTA */}
                                <div className="flex items-center gap-1.5 text-xs font-black text-indigo-500 mt-auto pt-1 border-t border-slate-50 group-hover:text-indigo-700 transition-colors">
                                    <Users size={13} /> View Submissions
                                    <ChevronRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllQuizSubmissions;
