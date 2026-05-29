import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import { QuizContext } from '../../../context/QuizContext';
import { motion } from 'framer-motion';
import { BookMarked, ChevronRight, Trash2, PlayCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const RevisionPage = () => {
    const { backendUrl, token, navigate } = useContext(AppContext);
    const { startQuiz } = useContext(QuizContext);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookmarks = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/quiz/bookmarks`, {
                headers: { token }
            });
            if (data.success) {
                setBookmarks(data.bookmarks);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (questionId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/quiz/bookmark`, { questionId }, {
                headers: { token }
            });
            if (data.success) {
                setBookmarks(bookmarks.filter(b => b.questionId !== questionId));
                toast.success("Removed from bookmarks");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const handleStartRevision = () => {
        startQuiz('revision');
        navigate('/quiz');
    };

    return (
        <div className="md:px-36 px-8 pt-32 pb-16 min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto flex flex-col gap-10">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <BookMarked className="text-primary" /> My Revision
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium italic">Review and master your bookmarked questions.</p>
                    </div>
                    {bookmarks.length > 0 && (
                        <button 
                            onClick={handleStartRevision}
                            className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <PlayCircle size={20} /> Start Revision Quiz
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                ) : bookmarks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {bookmarks.map((bookmark, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={bookmark.id} 
                                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900 leading-snug">{bookmark.Question.text}</h3>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {bookmark.Question.options.map((opt, idx) => (
                                                <span key={idx} className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${idx === bookmark.Question.correctOption ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                                    {opt}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeBookmark(bookmark.questionId)}
                                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Explanation</p>
                                     <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                         {bookmark.Question.explanation.correct}
                                     </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookMarked className="text-slate-300" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No bookmarks yet</h3>
                        <p className="text-slate-400 mb-8 max-w-xs mx-auto">Questions you bookmark during quizzes will appear here for focused revision.</p>
                        <button 
                            onClick={() => navigate('/quiz')}
                            className="text-primary font-bold hover:underline underline-offset-4"
                        >
                            Go to Quiz Engine
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RevisionPage;
