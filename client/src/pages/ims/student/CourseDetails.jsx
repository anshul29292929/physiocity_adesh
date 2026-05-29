import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../../../assets/assets';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../../../context/AppContext';
import { toast } from 'react-toastify';
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube';
import Loading from '../../../components/ims/student/Loading';
import { 
  Play, 
  ChevronDown, 
  Clock, 
  BookOpen, 
  Star, 
  Users, 
  Check, 
  ShieldCheck, 
  Award,
  Globe,
  FileText,
  FileDown,
  Layers,
  Share2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CourseDetails = () => {

  const { slug } = useParams()
  const location = useLocation();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null)
  const [playerData, setPlayerData] = useState(null)
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)

  const { 
    backendUrl, currency, 
    calculateRating, calculateNoOfRatings, calculateNoOfLectures, calculateCourseDuration, calculateDate,
    userData, token, setShowLogin, fetchUserEnrolledCourses, fetchUserData
  } = useContext(AppContext)

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/' + slug)
      if (data.success) {
        const cData = data.courseData;
        if (typeof cData.courseRatings === 'string') {
          try { cData.courseRatings = JSON.parse(cData.courseRatings); } catch (e) { cData.courseRatings = []; }
        }
        if (!Array.isArray(cData.courseRatings)) cData.courseRatings = [];
        setCourseData(cData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const [openSections, setOpenSections] = useState({});
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleRate = async () => {
    try {
      if (!userData) return toast.warn("Please Login to Review");
      setIsSubmittingReview(true);
      const { data } = await axios.post(backendUrl + '/api/user/add-rating',
        { courseId: courseData.id, rating: reviewRating, comment: reviewComment },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message)
        setReviewComment('');
        setReviewRating(5);
        fetchCourseData();
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmittingReview(false);
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: courseData.courseTitle,
      text: `Check out this course on Physiocity: ${courseData.courseTitle}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Course link copied to clipboard!');
      }
    } catch (_) {}
  };

  const enrollCourse = async () => {
    try {
      if (!userData) {
        navigate('/login', { state: { redirect: location.pathname } })
        return;
      }
      if (isAlreadyEnrolled) {
        return navigate('/player/' + courseData.id)
      }
      setIsEnrolling(true);
      const { data } = await axios.post(backendUrl + '/api/user/purchase',
        { courseId: courseData.id },
        { headers: { token } }
      )
      if (data.success) {
        const { order } = data;
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SV7ZDMWZ6qwH4D',
          amount: order.amount,
          currency: order.currency,
          name: 'Physiocity Academy',
          description: `Purchase for ${courseData.courseTitle}`,
          order_id: order.id,
          handler: async (response) => {
            try {
              const { data: verifyData } = await axios.post(backendUrl + '/api/user/verify-razorpay',
                response,
                { headers: { token } }
              );
              if (verifyData.success) {
                await fetchUserEnrolledCourses();
                await fetchUserData();
                setIsEnrolling(false);
                navigate('/payment-success');
              } else {
                toast.error('Payment verification failed. Please contact support.');
                setIsEnrolling(false);
                navigate('/course/' + slug);
              }
            } catch (error) {
              toast.error('Payment verification error: ' + error.message);
              setIsEnrolling(false);
              navigate('/course/' + slug);
            }
          },
          modal: {
            ondismiss: () => {
              setIsEnrolling(false);
            }
          },
          prefill: {
            name: userData.name,
            email: userData.email,
          },
          theme: {
            color: '#0ea5a4',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async () => {
          try {
            await axios.post(backendUrl + '/api/user/payment-failed', 
              { razorpay_order_id: order.id },
              { headers: { token } }
            );
          } catch (err) {
            console.error('Failed to log payment failure:', err);
          }
          toast.error('Payment failed. Please try again.');
          setIsEnrolling(false);
          navigate('/course/' + slug);
        });
        rzp.open();
      } else {
        toast.error(data.message);
        setIsEnrolling(false);
      }
    } catch (error) {
      toast.error(error.message);
      setIsEnrolling(false);
    }
  }

  const enrollFree = async () => {
    try {
      if (!userData) return setShowLogin(true);
      setIsEnrolling(true);
      const { data } = await axios.post(backendUrl + '/api/user/enroll-free', 
        { courseId: courseData.id },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        await fetchUserEnrolledCourses();
        await fetchUserData();
        setIsAlreadyEnrolled(true);
        setIsEnrolling(false);
        navigate('/payment-success');
      } else {
        toast.error(data.message);
        setIsEnrolling(false);
      }
    } catch (error) {
      toast.error(error.message);
      setIsEnrolling(false);
    }
  }

  const calculateChapterTime = (chapter) => {
    const totalDurationMinutes = chapter.chapterContent.reduce((sum, lecture) => sum + lecture.lectureDuration, 0);
    return humanizeDuration(totalDurationMinutes * 60 * 1000, { units: ['h', 'm'], round: true });
  };

  useEffect(() => {
    fetchCourseData()
  }, [slug])

  useEffect(() => {
    if (userData && courseData && userData.enrolledCourses) {
        // Enrolled courses can be stored as JSON array in User model return from API
        let enrolled = userData.enrolledCourses;
        if(typeof enrolled === 'string') {
            try { enrolled = JSON.parse(enrolled); } catch(e) { enrolled = []; }
        }
        setIsAlreadyEnrolled(enrolled.includes(courseData.id) || enrolled.includes(String(courseData.id)))
    }
  }, [userData, courseData])

  if (!courseData) return <Loading />;

  const discountedPrice = (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2);
  const rating = calculateRating(courseData);

  return (
    <div className="min-h-screen bg-[#FDFDFF] selection:bg-primary/20">
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
             {[...Array(30)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                 animate={{ 
                   opacity: [0, 1, 0], 
                   scale: [0, Math.random() * 1.5 + 1, 0], 
                   x: (Math.random() - 0.5) * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                   y: (Math.random() - 0.5) * (typeof window !== 'undefined' ? window.innerHeight : 800),
                   rotate: Math.random() * 360
                 }}
                 transition={{ duration: 2.5, ease: "easeOut", delay: Math.random() * 0.3 }}
                 className="absolute text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
               >
                 <Star size={Math.random() * 40 + 20} fill="currentColor" />
               </motion.div>
             ))}
          </div>
        )}
      </AnimatePresence>
      {/* Premium Hero Background Layers */}
      <div className="absolute top-0 left-0 w-full h-[700px] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[120%] bg-primary/5 blur-[120px] rounded-full rotate-12" />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[100%] bg-cyan-100/20 blur-[100px] rounded-full -rotate-12" />
        <div className="absolute bottom-0 left-[20%] w-[60%] h-[40%] bg-slate-50 blur-[80px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto lg:px-8 md:px-6 px-4 pt-32 pb-24 relative z-10">
        {/* Breadcrumb - Added back for better context */}
        <div className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
           <span onClick={() => navigate('/')} className="hover:text-primary cursor-pointer transition-colors">Home</span>
           <ChevronDown size={10} className="-rotate-90" />
           <span onClick={() => navigate('/courses')} className="hover:text-primary cursor-pointer transition-colors">Courses</span>
           <ChevronDown size={10} className="-rotate-90" />
           <span className="text-slate-900 truncate max-w-[200px]">{courseData.courseTitle}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Main Content Side */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 space-y-12"
          >
            {/* Header Info */}
            <div className="space-y-8">


              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h1 className="text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  {courseData.courseTitle}
                </h1>
                <button 
                  onClick={handleShare}
                  className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-md transition-all active:scale-95 group shrink-0"
                >
                  <Share2 size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Mobile: Image + Quick Actions — right below the title */}
              <div className="lg:hidden w-full space-y-4">
                {/* Thumbnail / Player */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white">
                  {playerData
                    ? <YouTube videoId={playerData.videoId} opts={{ playerVars: { autoplay: 1 } }} iframeClassName='w-full aspect-video' />
                    : <img src={courseData.courseThumbnail} className="w-full aspect-video object-cover" alt="" />
                  }
                </div>

                {/* Compact price + enroll card */}
                <div className="bg-white/60 backdrop-blur-2xl border border-white rounded-3xl p-5 flex items-center justify-between gap-4 shadow-lg ring-1 ring-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Price</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-slate-900 tracking-tighter">{currency}{discountedPrice}</span>
                      {Number(courseData.discount) > 0 && (
                        <span className="text-xs text-slate-300 line-through font-bold">{currency}{courseData.coursePrice}</span>
                      )}
                    </div>
                    {Number(courseData.discount) > 0 && (
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">{Math.floor(courseData.discount)}% OFF</span>
                    )}
                  </div>
                  <button
                    onClick={() => Number(courseData.coursePrice) === 0 ? enrollFree() : enrollCourse()}
                    disabled={isEnrolling}
                    className="py-4 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {isAlreadyEnrolled ? (
                      <><BookOpen size={16} /> Resume</>
                    ) : isEnrolling ? (
                      <><Loader2 className="animate-spin" size={16} /> Enrolling</>
                    ) : (
                      <><ShieldCheck size={16} /> {Number(courseData.coursePrice) === 0 ? 'Free Enroll' : 'Enroll Now'}</>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < Math.floor(rating) ? "#0ea5a4" : "none"} className={i < Math.floor(rating) ? "text-primary" : "text-slate-200"} />
                    ))}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-black text-slate-900 text-lg leading-none">{rating}</span>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-tight">({calculateNoOfRatings(courseData)} Verified Reviews)</span>
                  </div>
                </div>
                
                <div className="h-4 w-px bg-slate-200 hidden md:block" />

                <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border-2 border-white shadow-sm flex items-center justify-center text-primary overflow-hidden">
                        <img src={assets.user_icon} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Lead Educator</span>
                        <p className="font-bold text-slate-900 leading-none">
                            {courseData.educatorName || "PhysioCity Specialist"}
                        </p>
                    </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                 {[
                   { label: 'Learners', val: courseData.enrolledStudents.length, icon: <Users size={20} /> },
                   { label: 'Lessons', val: calculateNoOfLectures(courseData), icon: <BookOpen size={20} /> },
                   { label: 'Duration', val: calculateCourseDuration(courseData), icon: <Clock size={20} /> },
                   { label: 'Level', val: 'Advanced', icon: <Layers size={21} /> },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2 group hover:border-primary/20 transition-colors">
                      <div className="text-slate-300 group-hover:text-primary transition-colors">{stat.icon}</div>
                      <div>
                         <p className="text-lg font-black text-slate-900 leading-none">{stat.val}</p>
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>



            {/* Course Navigation Tabs (Visual Only for now) */}
            <div className="border-b border-slate-100 hidden md:flex gap-8">
               {['Curriculum', 'Overview', 'Instructor', 'Reviews'].map((tab, i) => (
                 <button key={tab} className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${i === 0 ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>
                    {tab}
                 </button>
               ))}
            </div>

            {/* Course Curriculum Section */}
            <div className="space-y-8 pt-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <Layers size={24} />
                    </div>
                    Curriculum Overview
                    </h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-3 ml-1">
                        Comprehensive path to professional mastery
                    </p>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Play size={14} className="text-primary" fill="currentColor" />
                        <span className="text-xs font-black text-slate-900 tabular-nums">{calculateNoOfLectures(courseData)} Lessons</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs font-black text-slate-400 tabular-nums">{calculateCourseDuration(courseData)}</span>
                    </div>
                </div>
              </div>

              <div className="space-y-5">
                {courseData.courseContent.map((chapter, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-primary/10 transition-all duration-500"
                  >
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full px-8 py-7 flex items-center justify-between text-left focus:outline-none"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-inner ${openSections[index] ? 'bg-primary text-white rotate-180 shadow-primary/40' : 'bg-slate-50 text-slate-300 group-hover:bg-primary/5 group-hover:text-primary shadow-slate-100'}`}>
                           <ChevronDown className="transition-transform duration-500" size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-xl tracking-tight leading-none group-hover:text-primary transition-colors">{chapter.chapterTitle}</p>
                          <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                 {chapter.chapterContent.length} Intensive Sessions
                              </span>
                              <div className="w-1 h-1 rounded-full bg-slate-200" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                 {calculateChapterTime(chapter)} Study Time
                              </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {openSections[index] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="px-8 pb-8 pt-0 space-y-2">
                            {chapter.chapterContent.map((lecture, i) => (
                              <div key={i} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group/item">
                                <div className="flex items-center gap-5">
                                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-primary/10 group-hover/item:text-primary transition-all shadow-sm">
                                    <Play size={16} fill="currentColor" />
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-sm font-bold text-slate-800 leading-none group-hover/item:text-slate-900 transition-colors">{lecture.lectureTitle}</span>
                                      <div className="flex items-center gap-3 mt-1.5">
                                         <span className="text-[10px] font-black text-slate-400 tabular-nums uppercase tracking-widest">{lecture.lectureDuration}m Session</span>
                                         {lecture.lectureNoteUrl && (
                                           <a 
                                             href={lecture.lectureNoteUrl} 
                                             target="_blank" 
                                             rel="noopener noreferrer"
                                             onClick={(e) => e.stopPropagation()}
                                             className="flex items-center gap-1.5 px-3 py-1 bg-white text-slate-500 rounded-full border border-slate-100 hover:border-primary/30 hover:text-primary transition-all text-[9px] font-black uppercase tracking-[0.2em] shadow-sm"
                                           >
                                             <FileText size={10} /> Study Guide
                                           </a>
                                         )}
                                      </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  {lecture.isPreviewFree && (
                                    <button 
                                      onClick={() => setPlayerData({ videoId: lecture.lectureUrl.split('/').pop() })}
                                      className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-primary/70 transition-colors"
                                    >
                                      Preview
                                    </button>
                                  )}
                                  <div className="h-6 w-px bg-slate-100 hidden md:block" />
                                  <div className="flex items-center gap-1 text-slate-300">
                                      <ShieldCheck size={14} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Course Description */}
            <div className="space-y-6">
               <h3 className="text-2xl font-bold text-slate-900">Description</h3>
               <div 
                 className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium"
                 dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
               />
            </div>

            {/* Course Reviews Section */}
            <div className="space-y-12 pb-24 border-t border-slate-100 pt-16">
               <div className="flex flex-col gap-12">
                  
                  {isAlreadyEnrolled && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/40 backdrop-blur-3xl p-8 rounded-[48px] border border-white shadow-2xl max-w-2xl ring-1 ring-slate-100"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Contribute to the legacy</p>
                        <div className="space-y-5">
                           <div className="flex gap-3 text-yellow-400 bg-slate-50 w-fit p-3 rounded-2xl border border-slate-100">
                              {[1,2,3,4,5].map(star => (
                                <Star 
                                  key={star} 
                                  size={24} 
                                  onClick={() => setReviewRating(star)}
                                  fill={star <= reviewRating ? "currentColor" : "none"}
                                  className="cursor-pointer transition-all hover:scale-110 active:scale-90"
                                />
                              ))}
                           </div>
                           <textarea 
                             value={reviewComment}
                             onChange={(e) => setReviewComment(e.target.value)}
                             placeholder="How has this course impacted your professional journey?"
                             className="w-full bg-slate-50/50 border border-slate-100 rounded-[32px] p-6 text-sm font-bold text-slate-800 focus:ring-4 ring-primary/5 min-h-[140px] outline-none transition-all placeholder:text-slate-300"
                           />
                           <button 
                             onClick={handleRate}
                             disabled={isSubmittingReview}
                             className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-slate-900 flex items-center justify-center gap-3"
                           >
                              {isSubmittingReview ? (
                                <><Loader2 className="animate-spin" size={16} /> Submitting...</>
                              ) : (
                                "Publish Insight"
                              )}
                           </button>
                        </div>
                    </motion.div>
                  )}
                  {isAlreadyEnrolled ? null : (
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center gap-4 max-w-2xl">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Enrolled Students Only</p>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">Enroll in this course to leave a review.</p>
                      </div>
                    </div>
                  )}

                  <div className="max-w-xl">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Global Learning Insights</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">Verified student feedback from around the world</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {calculateNoOfRatings(courseData) > 0 ? (
                    courseData.courseRatings.map((review, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-sm space-y-6 relative group hover:shadow-2xl hover:border-primary/5 transition-all duration-500"
                      >
                         <div className="flex items-center gap-5">
                            <div className="relative">
                                <img src={review.userImage || assets.user_icon} className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover" alt="" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white border-2 border-white">
                                    <Check size={12} />
                                </div>
                            </div>
                            <div>
                               <p className="font-black text-slate-900 text-lg leading-none tracking-tight">{review.userName || "Verified Learner"}</p>
                               <div className="flex gap-1 mt-2">
                                  {[...Array(5)].map((_, j) => (
                                    <Star key={j} size={12} fill={j < review.rating ? "#0ea5a4" : "none"} className={j < review.rating ? "text-primary" : "text-slate-100"} />
                                  ))}
                               </div>
                            </div>
                            <span className="ml-auto text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                               {calculateDate(review.createdAt)}
                            </span>
                         </div>
                         <div className="relative">
                            <div className="absolute -left-2 top-0 text-slate-100 font-serif text-6xl leading-none select-none">"</div>
                            <p className="text-base font-bold text-slate-600 leading-relaxed italic pl-4 relative z-10">
                               {review.comment || "An exceptional learning experience that bridged the gap between theory and clinical practice."}
                            </p>
                         </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center space-y-6 bg-slate-50/50 rounded-[56px] border border-dashed border-slate-200">
                       <div className="mx-auto w-20 h-20 rounded-full bg-white flex items-center justify-center text-slate-200 shadow-inner">
                          <Users size={32} />
                       </div>
                       <div>
                           <p className="text-slate-900 font-black uppercase tracking-[0.2em] text-xs">Awaiting First Insight</p>
                           <p className="text-slate-400 text-sm font-bold mt-2">Join the cohort and be the first to share your experience!</p>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </motion.div>

          {/* Sticky Sidebar Side */}
          <aside className="hidden lg:block w-full max-w-[440px] sticky top-36">
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
               className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[48px] shadow-[0_40px_80px_-16px_rgba(0,0,0,0.12)] p-8 space-y-8 overflow-hidden relative ring-1 ring-slate-100"
             >
                {/* Visual Glow Accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-100/30 rounded-full -ml-16 -mb-16 blur-2xl" />

                <div className="rounded-[32px] overflow-hidden shadow-2xl border border-white group relative z-10">
                    <div className="relative aspect-video bg-slate-100">
                        {playerData 
                          ? <YouTube videoId={playerData.videoId} opts={{ playerVars: { autoplay: 1 } }} iframeClassName='w-full h-full' />
                          : <img src={courseData.courseThumbnail} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                        }
                    </div>
                </div>

                {/* Price Section */}
                <div className="space-y-8 relative z-10">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-baseline gap-4">
                            <span className="text-6xl font-black text-slate-900 leading-none tracking-tighter">
                                {currency}{discountedPrice}
                            </span>
                            {Number(courseData.discount) > 0 && (
                                <span className="text-slate-300 line-through font-bold text-xl">{currency}{courseData.coursePrice}</span>
                            )}
                        </div>
                        {Number(courseData.discount) > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                                    Special {Math.floor(courseData.discount)}% DISCOUNT
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <button 
                          onClick={() => Number(courseData.coursePrice) === 0 ? enrollFree() : enrollCourse()}
                          disabled={isEnrolling}
                          className="w-full py-6 rounded-[32px] bg-primary text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_20px_40px_-12px_rgba(14,165,164,0.4)] hover:shadow-[0_24px_48px_-12px_rgba(14,165,164,0.6)] hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4 group overflow-hidden relative disabled:opacity-70 disabled:pointer-events-none"
                        >
                          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                          {isAlreadyEnrolled ? (
                            <><BookOpen size={20} /> Resume Academy</>
                          ) : isEnrolling ? (
                            <><Loader2 className="animate-spin" size={20} /> Authorizing...</>
                          ) : (
                            <><ShieldCheck size={20} /> {Number(courseData.coursePrice) === 0 ? 'Claim Free Spot' : 'Enroll Now'}</>
                          )}
                        </button>
                        
                        <div className="flex items-center justify-center gap-3 text-red-500/80 animate-pulse">
                            <Clock size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Priority access expires soon</span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100/50 w-full" />

                    {/* Features List */}
                    <div className="space-y-5">
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                               <Award size={16} />
                           </div>
                           Academic Privileges
                        </p>
                        <div className="grid grid-cols-1 gap-5">
                            {[
                                { 
                                    icon: <FileDown size={18} />, 
                                    text: 'Download Elite Resources', 
                                    isPulse: true,
                                    isLink: !!(courseData.brochureUrl && isAlreadyEnrolled),
                                    url: courseData.brochureUrl 
                                },
                                { icon: <Clock size={18} />, text: `${calculateCourseDuration(courseData)} On-demand Learning` },
                                { icon: <ShieldCheck size={18} />, text: 'Verified Certification' },
                                { icon: <Globe size={18} />, text: 'Lifetime Academic Support' }
                            ].map((feat, i) => (
                                <motion.div 
                                    key={i} 
                                    onClick={feat.isLink ? () => window.open(feat.url, '_blank') : null}
                                    animate={feat.isPulse ? { 
                                        scale: [1, 1.03, 1],
                                        filter: ["drop-shadow(0 0 0px rgba(14,165,164,0))", "drop-shadow(0 0 8px rgba(14,165,164,0.3))", "drop-shadow(0 0 0px rgba(14,165,164,0))"]
                                    } : {}}
                                    transition={feat.isPulse ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                                    className={`flex items-center gap-4 font-bold text-sm transition-all ${feat.isLink ? 'text-primary cursor-pointer hover:translate-x-1' : 'text-slate-500'}`}
                                >
                                    <div className={`p-2 rounded-xl ${feat.isLink || feat.isPulse ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-400'}`}>{feat.icon}</div>
                                    <span className="leading-tight">{feat.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="bg-slate-50/50 p-4 rounded-3xl border border-dashed border-slate-200 text-center">
                            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                                30-Day Professional Excellence Guarantee
                            </p>
                        </div>
                    </div>
                </div>
             </motion.div>
          </aside>
        </div>

        {/* Mobile Sticky Action Bar */}
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[100]">
           <motion.div 
             initial={{ y: 100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="bg-white/60 backdrop-blur-[40px] border border-white/50 rounded-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] p-3 flex items-center justify-between gap-4 ring-1 ring-slate-100"
           >
              <div className="flex flex-col pl-6">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Secure Access</span>
                 <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{currency}{discountedPrice}</span>
                    {Number(courseData.discount) > 0 && (
                      <span className="text-[11px] text-slate-300 line-through font-bold">{currency}{courseData.coursePrice}</span>
                    )}
                 </div>
              </div>
              <button 
                onClick={() => Number(courseData.coursePrice) === 0 ? enrollFree() : enrollCourse()}
                disabled={isEnrolling}
                className="py-5 px-10 bg-slate-900 text-white rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isAlreadyEnrolled ? (
                  <><BookOpen size={16} /> Resume</>
                ) : isEnrolling ? (
                  <><Loader2 className="animate-spin" size={16} /> Wait</>
                ) : (
                  <><ShieldCheck size={16} /> {Number(courseData.coursePrice) === 0 ? 'Free Enroll' : 'Enroll Now'}</>
                )}
              </button>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;