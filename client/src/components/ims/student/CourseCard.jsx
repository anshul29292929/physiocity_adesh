import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../../context/AppContext';
import { motion } from 'framer-motion';
import { Star, Clock, Users, PlayCircle, Trophy } from 'lucide-react';

const CourseCard = ({ course }) => {
    const { currency, calculateRating, calculateNoOfRatings, calculateCourseDuration } = useContext(AppContext);
    
    // Determine skill level based on index or title (mocking for UI)
    const levels = ["Beginner", "Intermediate", "Advanced"];
    const level = levels[course._id?.charCodeAt(0) % 3] || "Professional";

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-[28px] overflow-hidden border border-slate-200 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] bg-gradient-to-br from-white via-white to-primary/5 h-full flex flex-col"
        >
            {/* Thumbnail Wrapper */}
            <Link to={'/course/' + course.slug} className="block relative aspect-[16/9] overflow-hidden">
                <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    src={course.courseThumbnail} 
                    alt={course.courseTitle} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Floating Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {course.coursePrice === 0 ? (
                        <div className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                            Free Masterclass
                        </div>
                    ) : course.discount > 0 && (
                        <div className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                            {Math.floor(course.discount)}% Off
                        </div>
                    )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] text-white font-bold tracking-tight">
                        <Clock size={10} />
                        {calculateCourseDuration(course)}
                    </div>
                </div>
            </Link>

            {/* Content Section */}
            <div className="p-3 md:p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1.5 md:mb-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1">
                        <Trophy size={10} className="text-secondary" />
                        {level}
                    </span>
                    <div className="flex items-center gap-1 bg-accent/5 px-1.5 py-0.5 rounded-lg text-accent">
                        <Star size={8} fill="currentColor" />
                        <span>{calculateRating(course).toFixed(1)}</span>
                    </div>
                </div>

                <Link to={'/course/' + course.slug}>
                    <h3 className="text-[14px] md:text-[17px] font-black text-slate-900 leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2 min-h-[40px] md:min-h-[46px]">
                        {course.courseTitle}
                    </h3>
                </Link>

                <p className="text-slate-400 text-[10px] md:text-xs font-medium mb-3 md:mb-4">
                    By {course.educator?.name || course.educatorName || "Physiocity Instructor"}
                </p>

                <div className="mt-auto pt-3 md:pt-4 border-t border-slate-100 flex items-center justify-between gap-2 md:gap-4">
                    <div className="flex flex-col">
                        {course.coursePrice === 0 ? (
                           <span className="text-base md:text-xl font-black text-emerald-600 uppercase tracking-tighter italic">Free</span>
                        ) : (
                           <>
                              <span className="text-base md:text-xl font-black text-primary tracking-tighter">
                                {currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(0)}
                              </span>
                              {course.discount > 0 && (
                                 <span className="text-[9px] md:text-[11px] text-slate-500 line-through font-bold -mt-0.5 md:-mt-1">
                                    {currency}{course.coursePrice}
                                 </span>
                              )}
                           </>
                        )}
                    </div>
                    
                    <Link 
                        to={'/course/' + course.slug}
                        className="flex-1 bg-slate-900 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest py-2 md:py-3 px-2 md:px-4 rounded-xl md:rounded-2xl text-center hover:bg-primary transition-all shadow-md group-hover:shadow-primary/20 whitespace-nowrap"
                    >
                        {course.coursePrice === 0 ? "Enroll" : "Buy Now"}
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default CourseCard;