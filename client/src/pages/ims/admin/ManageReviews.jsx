import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Star, Trash2, MessageSquare, BookOpen, User } from 'lucide-react';
import Loading from '../../../components/ims/student/Loading';
import ConfirmationModal from '../../../components/ims/admin/ConfirmationModal';

const ManageReviews = () => {
    const { backendUrl, adminToken, calculateDate } = useContext(AppContext);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deletingData, setDeletingData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchAdminCourses = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/courses', {
                headers: { admintoken: adminToken }
            });
            if (data.success) {
                const parsedCourses = data.courses.map(c => {
                    let ratings = c.courseRatings || [];
                    if (typeof ratings === 'string') {
                        try { ratings = JSON.parse(ratings); } catch(e) { ratings = []; }
                    }
                    if (!Array.isArray(ratings)) ratings = [];
                    return { ...c, courseRatings: ratings };
                });
                setCourses(parsedCourses);
                if (parsedCourses.length > 0 && !selectedCourse) {
                    setSelectedCourse(parsedCourses[0]);
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (courseId, userId) => {
        setDeletingData({ courseId, userId });
        setShowConfirmModal(true);
    };

    const handleDeleteReview = async () => {
        if (!deletingData || isDeleting) return;
        const { courseId, userId } = deletingData;
        setIsDeleting(true);
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/delete-review', 
                { courseId, userId },
                { headers: { admintoken: adminToken } }
            );
            if (data.success) {
                toast.success(data.message);
                // Refresh local state
                const updatedCourses = courses.map(c => {
                    if (c.id === courseId) {
                        const updatedRatings = (c.courseRatings || []).filter(r => String(r.userId) !== String(userId));
                        const newCourse = { ...c, courseRatings: updatedRatings };
                        if (selectedCourse?.id === courseId) setSelectedCourse(newCourse);
                        return newCourse;
                    }
                    return c;
                });
                setCourses(updatedCourses);
                setShowConfirmModal(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
            setDeletingData(null);
        }
    };

    useEffect(() => {
        if (adminToken) {
            fetchAdminCourses();
        }
    }, [adminToken]);

    if (loading) return <Loading />;

    return (
        <div className="p-8 bg-[#fafbfc] min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <MessageSquare className="text-primary" /> Manage Reviews
                </h1>
                <p className="text-slate-500 font-medium mt-1">Moderate student feedback across all courses</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Course Selection List */}
                <div className="lg:col-span-1 space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Select Course</p>
                    <div className="space-y-2">
                        {courses.map((course) => (
                            <div 
                                key={course.id}
                                onClick={() => setSelectedCourse(course)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedCourse?.id === course.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white border-slate-100 text-slate-600 hover:border-primary/50'}`}
                            >
                                <p className="text-sm font-bold truncate">{course.courseTitle}</p>
                                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${selectedCourse?.id === course.id ? 'text-white/70' : 'text-slate-400'}`}>
                                    {course.courseRatings?.length || 0} Reviews
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedCourse ? (() => {
                        const courseRatings = selectedCourse.courseRatings || [];
                        return (
                        <>
                            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">{selectedCourse.courseTitle}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">{selectedCourse.courseRatings?.length || 0} Total Reviews</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {courseRatings.length > 0 ? (
                                    courseRatings.map((review, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-start justify-between group">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                                                    {review.userImage ? <img src={review.userImage} alt="" /> : <User size={20} />}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-slate-900">{review.userName || 'Student'}</p>
                                                    <div className="flex gap-1">
                                                        {[...Array(5)].map((_, j) => (
                                                            <Star key={j} size={10} fill={j < review.rating ? "#facc15" : "none"} className={j < review.rating ? "text-yellow-400" : "text-slate-200"} />
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-2 font-medium italic">"{review.comment || 'No comment'}"</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-2">
                                                        {calculateDate(review.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => confirmDelete(selectedCourse.id, review.userId)}
                                                className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                                        <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No reviews for this course yet</p>
                                    </div>
                                )}
                            </div>
                        </>
                        );
                    })() : (
                        <div className="h-full flex items-center justify-center bg-slate-50/50 rounded-[48px] border border-dashed border-slate-200 p-20 text-center">
                            <div>
                                <MessageSquare size={64} className="mx-auto text-slate-200 mb-6" />
                                <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Select a course to view reviews</h3>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={showConfirmModal}
                onClose={() => !isDeleting && setShowConfirmModal(false)}
                onConfirm={handleDeleteReview}
                title="Delete Review?"
                message="Are you sure you want to delete this review? This action cannot be undone."
                isSubmitting={isDeleting}
            />
        </div>
    );
};

export default ManageReviews;
