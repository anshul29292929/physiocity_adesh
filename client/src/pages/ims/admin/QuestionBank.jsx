import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ConfirmationModal from '../../../components/ims/admin/ConfirmationModal';

const QuestionBank = () => {
    const { backendUrl, adminToken, navigate } = useContext(AppContext);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ difficulty: '', search: '', isActive: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/quiz/questions`, {
                headers: { admintoken: adminToken },
                params: filters
            });
            if (data.success) {
                setQuestions(data.questions);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminToken) fetchQuestions();
    }, [adminToken, filters]);

    const toggleStatus = async (id, currentStatus) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/admin/quiz/question/${id}`, 
                { isActive: !currentStatus },
                { headers: { admintoken: adminToken } }
            );
            if (data.success) {
                setQuestions(questions.map(q => q.id === id ? { ...q, isActive: !currentStatus } : q));
                toast.success("Status updated");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const confirmDelete = (id) => {
        setDeletingId(id);
        setShowConfirmModal(true);
    };

    const deleteQuestion = async () => {
        if (!deletingId || isDeleting) return;
        setIsDeleting(true);
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/quiz/question/${deletingId}`, {
                headers: { admintoken: adminToken }
            });
            if (data.success) {
                setQuestions(questions.filter(q => q.id !== deletingId));
                toast.success("Question deleted");
                setShowConfirmModal(false);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Question Bank</h1>
                    <p className="text-slate-500 text-sm">Manage your global pool of medical MCQs</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/add-question')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} /> Add New Question
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search questions..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl transition-all outline-none border"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <select 
                    className="px-4 py-3 bg-slate-50 border-transparent rounded-xl outline-none"
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
                <select 
                    className="px-4 py-3 bg-slate-50 border-transparent rounded-xl outline-none"
                    value={filters.isActive}
                    onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                >
                    <option value="">All Status</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Question Text</th>
                            <th className="px-6 py-4">Difficulty</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-20 text-slate-400">Loading...</td></tr>
                        ) : questions.length > 0 ? (
                            questions.map((q) => (
                                <tr key={q.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 py-4 max-w-md">
                                        <p className="font-medium text-slate-800 line-clamp-2">{q.text}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                            q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                            q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => toggleStatus(q.id, q.isActive)}
                                            className={`flex items-center gap-2 text-xs font-bold ${q.isActive ? 'text-green-600' : 'text-slate-300'}`}
                                        >
                                            {q.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            {q.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button 
                                            onClick={() => navigate(`/admin/edit-question/${q.id}`)}
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
                            <tr><td colSpan="4" className="text-center py-20 text-slate-400 italic">No questions found matching filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={showConfirmModal}
                onClose={() => !isDeleting && setShowConfirmModal(false)}
                onConfirm={deleteQuestion}
                title="Delete Question?"
                message="Are you sure you want to delete this question? This will remove it from all quizzes that use it."
                isSubmitting={isDeleting}
            />
        </div>
    );
};

export default QuestionBank;
