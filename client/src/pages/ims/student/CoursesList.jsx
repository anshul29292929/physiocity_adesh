import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import CourseCard from '../../../components/ims/student/CourseCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

const CoursesList = () => {
    const { input } = useParams();
    const { allCourses, navigate, fetchAllCourses } = useContext(AppContext);
    const [filteredCourse, setFilteredCourse] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all'); // all, free, paid
    const [searchQuery, setSearchQuery] = useState(input || '');

    useEffect(() => {
        fetchAllCourses();
    }, []);

    useEffect(() => {
        if (allCourses && allCourses.length > 0) {
            let temp = [...allCourses];
            
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                temp = temp.filter(c => 
                    c.courseTitle.toLowerCase().includes(query) || 
                    (c.educator?.name && c.educator.name.toLowerCase().includes(query)) ||
                    (c.educatorName && c.educatorName.toLowerCase().includes(query))
                );
            }

            // Price filter
            if (activeFilter === 'free') {
                temp = temp.filter(c => c.coursePrice === 0);
            } else if (activeFilter === 'paid') {
                temp = temp.filter(c => c.coursePrice > 0);
            }

            setFilteredCourse(temp);
        }
    }, [allCourses, searchQuery, activeFilter]);

    return (
        <div className="min-h-screen bg-[#FDFDFF] pt-24 pb-24">
            {/* Minimal Hero Section */}
            <div className="max-w-7xl mx-auto px-6 mb-8 pt-4 md:pt-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center border-b border-slate-100 pb-12 gap-8"
                >
                    {/* Heading - Top Row */}
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tighter">
                           Academic <span className="font-serif italic text-primary">Section</span>
                        </h1>
                    </div>

                    {/* Navigation Hub - Bottom Row */}
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Quick Navigation</span>
                        <div className="flex items-center gap-2 text-sm font-bold mt-1">
                           <span onClick={() => navigate('/')} className="text-primary cursor-pointer hover:underline">Home</span>
                           <ArrowRight size={14} className="text-slate-300" />
                           <span className="text-slate-400">Courses</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filter & Search Bar */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-4 rounded-[24px] shadow-sm border border-slate-100">
                    <div className="relative w-full md:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by title, educator, or specialty..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl w-full md:w-auto">
                        <button 
                            onClick={() => setActiveFilter('all')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            All Courses
                        </button>
                        <button 
                            onClick={() => setActiveFilter('free')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeFilter === 'free' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Free
                        </button>
                        <button 
                            onClick={() => setActiveFilter('paid')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeFilter === 'paid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Paid
                        </button>
                    </div>
                </div>
            </div>

            {/* Course Grid / Mobile Carousel */}
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <style>{`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                <AnimatePresence>
                    {filteredCourse.length > 0 ? (
                        <div 
                            className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-8 -mx-4 md:mx-0 px-4 md:px-0 pb-10 md:pb-0 no-scrollbar"
                        >
                            {filteredCourse.map((course, index) => (
                                <motion.div
                                    key={course._id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex-shrink-0 w-[82vw] md:w-auto snap-center"
                                >
                                    <CourseCard course={course} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No matching courses</h3>
                            <p className="text-slate-500 font-medium">Try adjusting your filters or search keywords.</p>
                            <button 
                                onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                                className="mt-8 text-primary font-black text-xs uppercase tracking-widest hover:underline"
                            >
                                Reset All Filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CoursesList;