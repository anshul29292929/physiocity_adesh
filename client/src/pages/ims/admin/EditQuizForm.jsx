import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { ChevronLeft, Save, Info, Settings, Clock, ListChecks } from 'lucide-react';

const EditQuizForm = () => {
    const { id } = useParams();
    const { backendUrl, adminToken, navigate } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        totalQuestions: 15,
        timeLimit: 900, // 15 mins default
        isDailyQuiz: false,
        status: 'active'
    });

    const fetchQuiz = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/quiz/quizzes`, {
                headers: { admintoken: adminToken }
            });
            if (data.success) {
                const q = data.quizzes.find(item => item.id == id);
                if (q) setFormData(q);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (id && adminToken) fetchQuiz();
    }, [id, adminToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = id 
                ? `${backendUrl}/api/admin/quiz/quiz/${id}` 
                : `${backendUrl}/api/admin/quiz/quizzes`;
            
            const method = id ? 'put' : 'post';
            const { data } = await axios[method](url, formData, {
                headers: { admintoken: adminToken }
            });

            if (data.success) {
                toast.success(id ? "Quiz updated" : "Quiz created");
                navigate('/admin/quizzes');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={() => navigate('/admin/quizzes')}
                    className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-indigo-600 transition-all"
                >
                    <ChevronLeft size={20} /> Back to Quizzes
                </button>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">{id ? 'Edit' : 'Create New'} Quiz</h1>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100"
                    >
                        <Save size={20} /> {loading ? 'Saving...' : 'Save Quiz'}
                    </button>
                </div>

                <form className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                            <Info size={18} />
                            <h3 className="font-bold uppercase tracking-widest text-[10px]">Basic Details</h3>
                        </div>
                        <section>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Title</label>
                            <input 
                                type="text" 
                                className="w-full p-4 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 border transition-all"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Cardiology Mixed MCQ Set 01"
                                required
                            />
                        </section>
                        <section>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea 
                                className="w-full p-4 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 border transition-all min-h-[100px]"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What is this quiz about?"
                            />
                        </section>
                    </div>

                    {/* Quiz Rules */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <Settings size={18} />
                            <h3 className="font-bold uppercase tracking-widest text-[10px]">Quiz Logic</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <ListChecks size={16} /> Total Questions
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full p-4 bg-slate-50 border-transparent rounded-2xl outline-none border"
                                    value={formData.totalQuestions}
                                    onChange={(e) => setFormData({ ...formData, totalQuestions: e.target.value })}
                                />
                            </section>
                            <section>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Clock size={16} /> Time Limit (seconds)
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full p-4 bg-slate-50 border-transparent rounded-2xl outline-none border"
                                    value={formData.timeLimit}
                                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                                    placeholder="Leave empty for no limit"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">900s = 15 mins | 1800s = 30 mins</p>
                            </section>
                        </div>
                    </div>

                    {/* Status & Settings */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex flex-wrap gap-8">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-bold text-slate-700">Daily Quiz</label>
                                <div 
                                    onClick={() => setFormData({ ...formData, isDailyQuiz: !formData.isDailyQuiz })}
                                    className={`w-12 h-6 rounded-full cursor-pointer transition-all relative ${formData.isDailyQuiz ? 'bg-amber-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isDailyQuiz ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-bold text-slate-700">Status</label>
                                <select 
                                    className="p-3 bg-slate-50 rounded-xl outline-none border"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditQuizForm;
