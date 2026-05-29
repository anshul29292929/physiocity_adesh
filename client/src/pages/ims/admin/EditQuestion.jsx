import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Save, Edit } from 'lucide-react';

const EditQuestion = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const quizId = searchParams.get('quizId');
    
    const { backendUrl, adminToken, navigate } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizName, setQuizName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        text: '',
        responseType: 'mcq',
        options: ['', '', '', ''],
        correctOption: 0,
        correctAnswer: '',
        difficulty: 'Medium',
        explanation: {
            correct: ''
        },
        type: 'standard',
        isActive: true,
        quizId: quizId || null,
        positiveMarks: 1,
        negativeMarks: 0
    });

    const fetchQuizName = async () => {
        if (!quizId) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/quiz/quiz/${quizId}`, {
                headers: { admintoken: adminToken }
            });
            if (data.success) {
                setQuizName(data.quiz.title);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchQuizQuestions = async () => {
        if (!quizId) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/quiz/questions`, {
                headers: { admintoken: adminToken }
            });
            if (data.success) {
                const filtered = data.questions.filter(q => q.quizId == quizId);
                setQuizQuestions(filtered);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchQuestion = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/quiz/questions`, {
                headers: { admintoken: adminToken },
                params: { search: '' }
            });
            if (data.success) {
                const q = data.questions.find(item => item.id == id);
                if (q) {
                    // Pre-process JSON fields if they are strings
                    const processed = { ...q };
                    if (typeof processed.options === 'string') {
                        try { processed.options = JSON.parse(processed.options); } catch (e) { processed.options = ['', '', '', '']; }
                    }
                    if (typeof processed.explanation === 'string') {
                        try { processed.explanation = JSON.parse(processed.explanation); } catch (e) { processed.explanation = { correct: '' }; }
                    }
                    setFormData(processed);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (id && adminToken) fetchQuestion();
        if (quizId && adminToken) {
            fetchQuizQuestions();
            fetchQuizName();
        }
    }, [id, quizId, adminToken]);

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleExplanationChange = (field, value) => {
        setFormData({
            ...formData,
            explanation: { ...formData.explanation, [field]: value }
        });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const url = id 
                ? `${backendUrl}/api/admin/quiz/question/${id}` 
                : `${backendUrl}/api/admin/add-question`;
            
            const method = id ? 'put' : 'post';
            
            const submissionData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'options' || key === 'explanation') {
                    submissionData.append(key, JSON.stringify(formData[key]));
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    submissionData.append(key, formData[key]);
                }
            });

            if (imageFile) {
                submissionData.append('image', imageFile);
            }

            const { data } = await axios[method](url, submissionData, {
                headers: { admintoken: adminToken, 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success(id ? "Question updated" : "Question added");
                setFormData({
                    text: '',
                    responseType: formData.responseType,
                    options: ['', '', '', ''],
                    correctOption: 0,
                    correctAnswer: '',
                    difficulty: 'Medium',
                    explanation: { correct: '' },
                    type: 'standard',
                    isActive: true,
                    quizId: quizId || null,
                    positiveMarks: 1,
                    negativeMarks: 0
                });
                setImageFile(null);
                fetchQuizQuestions();
                if (id) {
                    navigate(`/admin/add-question?quizId=${quizId}`);
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen pb-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/admin/quizzes')}
                            className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all border border-slate-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800">
                            {id ? 'Edit' : 'Add'} Question
                            {quizName && <span className="text-slate-400 font-medium ml-3 text-lg border-l-2 border-slate-200 pl-3">{quizName}</span>}
                        </h1>
                    </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Main Question Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            {/* Question and Basic Settings */}
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 lg:col-span-7 space-y-1.5">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 px-1">
                                        Question Text
                                    </label>
                                    <textarea 
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all min-h-[110px] text-sm font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium leading-relaxed"
                                        value={formData.text}
                                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                        placeholder="What is the capital of..."
                                        required
                                    />
                                </div>
                                <div className="col-span-12 lg:col-span-5">
                                    <div className="grid grid-cols-2 gap-3 h-full pt-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Type</label>
                                            <select 
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-indigo-500/20 text-xs font-black text-slate-700 cursor-pointer transition-all"
                                                value={formData.responseType}
                                                onChange={(e) => setFormData({ ...formData, responseType: e.target.value })}
                                            >
                                                <option value="mcq">MCQ</option>
                                                <option value="short_answer">Short Answer</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Difficulty</label>
                                            <select 
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-indigo-500/20 text-xs font-black text-slate-700 cursor-pointer transition-all"
                                                value={formData.difficulty}
                                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Advanced</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Pos Marks</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    step="0.1"
                                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-emerald-500/20 text-xs font-black text-emerald-600"
                                                    value={formData.positiveMarks}
                                                    onChange={(e) => setFormData({ ...formData, positiveMarks: e.target.value })}
                                                    required
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-[9px] font-black">+</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Neg Marks</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    step="0.1"
                                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-rose-500/20 text-xs font-black text-rose-600"
                                                    value={formData.negativeMarks}
                                                    onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
                                                    required
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 text-[9px] font-black">-</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Answer Section */}
                            <div className="grid grid-cols-12 gap-6 items-end">
                                <div className="col-span-12 lg:col-span-7">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 px-1">
                                        Answer Options
                                    </label>
                                    {formData.responseType === 'mcq' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {(Array.isArray(formData.options) ? formData.options : ['', '', '', '']).map((opt, i) => (
                                                <div key={i} className={`group relative flex items-center gap-3 p-4 rounded-xl transition-all border-2 ${formData.correctOption === i ? 'bg-indigo-50/50 border-indigo-500/20 shadow-sm shadow-indigo-500/5' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                                                    <div className="relative flex items-center justify-center">
                                                        <input 
                                                            type="radio" 
                                                            name="correct-option"
                                                            checked={formData.correctOption === i}
                                                            onChange={() => setFormData({ ...formData, correctOption: i })}
                                                            className="peer absolute opacity-0 w-5 h-5 cursor-pointer z-10"
                                                        />
                                                        <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${formData.correctOption === i ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 peer-hover:border-indigo-400'}`}>
                                                            {formData.correctOption === i && <div className="w-1.5 h-1.5 rounded-full bg-white animate-scale-in" />}
                                                        </div>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        placeholder={`Option ${i + 1}`}
                                                        className="w-full bg-transparent outline-none text-xs font-bold text-slate-700 placeholder:text-slate-300"
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(i, e.target.value)}
                                                        required={formData.responseType === 'mcq'}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <input 
                                            type="text" 
                                            placeholder="Enter the correct word or phrase..."
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500/20 text-sm font-bold text-slate-700 placeholder:text-slate-300"
                                            value={formData.correctAnswer}
                                            onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                                            required={formData.responseType === 'short_answer'}
                                        />
                                    )}
                                </div>

                                <div className="col-span-12 lg:col-span-5 group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 px-1">
                                        Question Media
                                    </label>
                                    <div className="relative group/upload">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            className="hidden"
                                            id="question-img"
                                            onChange={(e) => setImageFile(e.target.files[0])}
                                        />
                                        <label 
                                            htmlFor="question-img"
                                            className={`w-full flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:bg-white hover:border-indigo-400/40 min-h-[116px] ${imageFile || formData.image ? 'border-dashed border-indigo-200' : 'border-slate-200'}`}
                                        >
                                            {imageFile || formData.image ? (
                                                <div className="relative group/preview w-full h-full flex items-center justify-center">
                                                    <img 
                                                        src={imageFile ? URL.createObjectURL(imageFile) : `${backendUrl}${formData.image}`} 
                                                        alt="" 
                                                        className="h-20 w-auto rounded-lg object-contain shadow-sm border border-slate-100" 
                                                    />
                                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center rounded-lg transition-all gap-2">
                                                        <span className="text-white text-[9px] font-black uppercase tracking-widest pointer-events-none">Change</span>
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); setImageFile(null); setFormData({...formData, image: null}) }}
                                                            className="p-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover/upload:scale-105 transition-transform">
                                                        <Edit size={18} className="text-slate-400 group-hover/upload:text-indigo-500 transition-colors" />
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Click to upload image</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Explanation and Final Action */}
                            <div className="grid grid-cols-12 gap-6 items-start pt-2">
                                <div className="col-span-12 lg:col-span-9 space-y-1.5">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 px-1">
                                        Solution Explanation
                                    </label>
                                    <textarea 
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500/20 text-xs font-medium text-slate-600 placeholder:text-slate-300 leading-relaxed min-h-[80px]"
                                        value={formData.explanation.correct} 
                                        onChange={(e) => handleExplanationChange('correct', e.target.value)}
                                        placeholder="Detailed reasoning..."
                                        required
                                    />
                                </div>
                                <div className="col-span-12 lg:col-span-3 h-full flex flex-col justify-end pt-7">
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className={`group relative overflow-hidden w-full h-[80px] flex items-center justify-center gap-3 text-white rounded-2xl font-black transition-all disabled:opacity-50 active:scale-95 ${id ? 'bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <Save size={20} className="group-hover:-translate-y-1 transition-transform mb-1" />
                                            <span className="text-[9px] uppercase tracking-widest">{loading ? 'Saving...' : (id ? 'Confirm Update' : 'Publish Question')}</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {quizId && (
                    <div className="mt-8 border-t border-slate-200 pt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs">{quizQuestions.length}</span>
                                Added to this Quiz
                            </h3>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => navigate(`/admin/add-question?quizId=${quizId}`)}
                                    className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold uppercase rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
                                >
                                    + Add New
                                </button>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                        {quizQuestions.filter(q => q.responseType === 'mcq').length} MCQ
                                    </div>
                                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100">
                                        {quizQuestions.filter(q => q.responseType === 'short_answer').length} Short
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {quizQuestions.length > 0 ? (
                                quizQuestions.slice().reverse().map((q, idx) => (
                                    <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center hover:shadow-md hover:border-indigo-100 transition-all group border-l-4 border-l-slate-200 hover:border-l-indigo-500">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${q.responseType === 'mcq' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                    {q.responseType === 'mcq' ? 'MCQ' : 'Short'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question {quizQuestions.length - idx}</span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-500 rounded-lg uppercase">{q.difficulty}</span>
                                            </div>
                                            <p className="text-slate-600 text-sm font-bold truncate group-hover:text-indigo-600 transition-colors">{q.text}</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setFormData(q);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                navigate(`/admin/edit-question/${q.id}?quizId=${quizId}`);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-bold text-xs transition-all shadow-sm"
                                        >
                                            <Edit size={14} />
                                            <span>Edit</span>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-medium">
                                    No questions yet. Use the form above to get started!
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditQuestion;
