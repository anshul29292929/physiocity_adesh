import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, Calendar, Clock, CheckCircle, XCircle, Users, AlertTriangle } from 'lucide-react';
import ConfirmationModal from '../../../components/ims/admin/ConfirmationModal';

const ManageQuizzes = () => {
    const { backendUrl, adminToken, navigate } = useContext(AppContext);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/quiz/quizzes`, {
                headers: { admintoken: adminToken }
            });
            if (data.success) {
                setQuizzes(data.quizzes);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminToken) fetchQuizzes();
    }, [adminToken]);

    const confirmDelete = (id) => {
        setDeletingId(id);
        setShowConfirmModal(true);
    };

    const deleteQuiz = async () => {
        if (!deletingId || isDeleting) return;
        setIsDeleting(true);
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/quiz/quiz/${deletingId}`, {
                headers: { admintoken: adminToken }
            });
            if (data.success) {
                setQuizzes(quizzes.filter(q => q.id !== deletingId));
                toast.success("Quiz deleted");
                setShowConfirmModal(false);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const filteredQuizzes = quizzes.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.id.toString() === searchTerm
    );

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manage Quizzes</h1>
                    <p className="text-slate-500 text-sm">Create and organize specialized medical quiz sets</p>
                </div>
            </div>

            {/* Search & Action Bar */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by title or Unique ID..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => navigate('/admin/add-quiz')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    <Plus size={20} /> Add Quiz
                </button>
            </div>

            {/* Quizzes List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Title & Description</th>
                            <th className="px-6 py-4">Questions</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-20 text-slate-400">Loading quizzes...</td></tr>
                        ) : filteredQuizzes.length > 0 ? (
                            filteredQuizzes.map((q) => (
                                <tr key={q.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{q.id}</td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="font-bold text-slate-800 truncate">{q.title}</p>
                                        <p className="text-[10px] text-slate-400 line-clamp-1">{q.description || 'No description'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{q.totalQuestions} Qs</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {q.timeLimit ? `${Math.floor(q.timeLimit / 60)} mins` : 'No Limit'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {q.isDailyQuiz ? (
                                            <span className="flex items-center gap-1 text-[10px] uppercase font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                                                <Calendar size={12} /> Daily
                                            </span>
                                        ) : (
                                            <span className="text-[10px] uppercase font-black text-slate-300">Standard</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1 text-xs font-bold ${q.status === 'active' ? 'text-green-600' : 'text-slate-300'}`}>
                                            {q.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {q.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                        <button 
                                            onClick={() => navigate(`/admin/quiz/${q.id}/submissions`)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="View Submissions"
                                        >
                                            <Users size={18} />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/admin/add-question?quizId=${q.id}`)}
                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                            title="Add Questions to this Quiz"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/admin/edit-quiz/${q.id}`)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => confirmDelete(q.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="text-center py-20 text-slate-400 italic">No quizzes found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={showConfirmModal}
                onClose={() => !isDeleting && setShowConfirmModal(false)}
                onConfirm={deleteQuiz}
                title="Delete Quiz?"
                message="Are you sure you want to delete this quiz? All associated questions and student attempts will be affected."
                isSubmitting={isDeleting}
            />
        </div>
    );
};

export default ManageQuizzes;
