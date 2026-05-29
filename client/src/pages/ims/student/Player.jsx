import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../context/AppContext'
import YouTube from 'react-youtube';
import { assets } from '../../../assets/assets';
import { useParams } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';
import axios from 'axios';
import { toast } from 'react-toastify';
import Rating from '../../../components/ims/student/Rating';
import Loading from '../../../components/ims/student/Loading';
import { 
  Play, 
  ChevronDown, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Star, 
  ChevronRight,
  ArrowLeft,
  Layout,
  Layers,
  Award,
  CircleCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Player = () => {

  const { enrolledCourses, backendUrl, getToken, calculateChapterTime, userData, fetchUserEnrolledCourses, navigate, calculateNoOfLectures } = useContext(AppContext)

  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [userRatingInput, setUserRatingInput] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getCourseData = () => {
    const course = enrolledCourses.find((c) => String(c.id) === String(courseId))
    if (course) {
        setCourseData(course)
        let ratings = course.courseRatings;
        if (typeof ratings === 'string') {
            try { ratings = JSON.parse(ratings); } catch(e) { ratings = []; }
        }
        if (!Array.isArray(ratings)) ratings = [];

        const userRating = ratings.find((item) => item.userId === userData?.id)
        if (userRating) {
            setInitialRating(userRating.rating)
            setUserRatingInput(userRating.rating)
        }
        
        let content = course.courseContent;
        if (typeof content === 'string') {
            try { content = JSON.parse(content); } catch(e) { content = []; }
        }
        if (!Array.isArray(content)) content = [];
        
        const parsedCourse = { ...course, courseContent: content };
        setCourseData(parsedCourse);

        // Auto select first lecture if none selected
        if (!playerData && content.length > 0 && content[0].chapterContent && content[0].chapterContent.length > 0) {
            const firstChapter = content[0];
            const firstLecture = firstChapter.chapterContent[0];
            setPlayerData({ ...firstLecture, chapterIndex: 0, lectureIndex: 0, chapterTitle: firstChapter.chapterTitle });
            setOpenSections({ 0: true });
        }
    }
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const markLectureAsCompleted = async (lectureId) => {
    if (!lectureId) return;
    try {
      const token = await getToken()
      const { data } = await axios.post(backendUrl + '/api/user/update-course-progress',
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        getCourseProgress()
        return true;
      } else {
        toast.error(data.message)
        return false;
      }
    } catch (error) {
      toast.error(error.message)
      return false;
    }
  }

  const handleLectureEnd = async () => {
    // 1. Mark current as completed if not already
    if (playerData && !progressData?.lectureCompleted.includes(playerData.lectureId)) {
        await markLectureAsCompleted(playerData.lectureId);
    }

    // 2. Find next lecture
    const chapters = courseData.courseContent;
    let foundCurrent = false;
    let nextPlayerData = null;

    for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
        const chapter = chapters[cIdx];
        for (let lIdx = 0; lIdx < chapter.chapterContent.length; lIdx++) {
            const lecture = chapter.chapterContent[lIdx];
            
            if (foundCurrent) {
                nextPlayerData = { 
                    ...lecture, 
                    chapterIndex: cIdx, 
                    lectureIndex: lIdx, 
                    chapterTitle: chapter.chapterTitle 
                };
                break;
            }

            if (lecture.lectureId === playerData.lectureId) {
                foundCurrent = true;
            }
        }
        if (nextPlayerData) break;
    }

    if (nextPlayerData) {
        setPlayerData(nextPlayerData);
        // Ensure the section is open
        setOpenSections(prev => ({ ...prev, [nextPlayerData.chapterIndex]: true }));
        toast.success(`${playerData.lectureTitle} completed! Moving to next lecture...`);
    } else {
        toast.success(`Final lecture completed! You've finished the course content.`);
    }
  };

  const getCourseProgress = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.post(backendUrl + '/api/user/get-course-progress',
        { courseId: String(courseId) },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setProgressData(data.progressData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRate = async (rating) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(backendUrl + '/api/user/add-rating',
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchUserEnrolledCourses()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData()
    }
  }, [enrolledCourses, courseId])

  useEffect(() => {
    if (courseId) {
        getCourseProgress()
    }
  }, [courseId])

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVideoSource = (url) => {
    if (!url) return 'none';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('drive.google.com')) return 'google-drive';
    if (url.startsWith('/uploads/') || (backendUrl && url.includes('/uploads/'))) return 'local';
    return 'direct';
  };

  const renderVideoPlayer = () => {
    if (!playerData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
               <img src={courseData.courseThumbnail} className="w-full h-full object-cover opacity-50 blur-sm" alt="" />
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-6">
                   <div className="w-24 h-24 rounded-full bg-primary/20 backdrop-blur-xl border border-white/20 flex items-center justify-center animate-pulse">
                       <Play size={32} fill="white" />
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter">Ready to Start?</h3>
               </div>
            </div>
        );
    }

    const source = getVideoSource(playerData.lectureUrl);
    
    if (source === 'youtube') {
        const videoId = getYouTubeId(playerData.lectureUrl);
        if (!videoId) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white p-8 text-center">
                    <p className="font-bold">Invalid YouTube URL. Please contact support.</p>
                </div>
            );
        }
        return (
            <div className="relative w-full h-full group/player">
                <YouTube 
                    videoId={videoId} 
                    opts={{ 
                        playerVars: { 
                            autoplay: 1, 
                            rel: 0,
                            modestbranding: 1,
                            showinfo: 0,
                            iv_load_policy: 3,
                            controls: 1,
                            disablekb: 0
                        },
                        width: '100%',
                        height: '100%'
                    }} 
                    onEnd={handleLectureEnd}
                    iframeClassName='w-full h-full'
                    className='w-full h-full'
                />
                {/* Transparent Shield to prevent clicking title/share on YouTube */}
                <div className="absolute top-0 left-0 w-full h-[60px] z-20 cursor-default" onClick={(e) => e.stopPropagation()} />
            </div>
        );
    }

    if (source === 'google-drive') {
        // Convert view link to preview link for iframe
        let embedUrl = playerData.lectureUrl;
        if (embedUrl.includes('/view')) {
            embedUrl = embedUrl.replace('/view', '/preview');
        } else if (!embedUrl.includes('/preview')) {
            // Try to extract ID and build preview link
            const driveIdMatch = embedUrl.match(/\/d\/(.+?)\/|id=(.+?)(&|$)/);
            const driveId = driveIdMatch ? (driveIdMatch[1] || driveIdMatch[2]) : null;
            if (driveId) embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        }
        
        return (
            <iframe 
                src={embedUrl} 
                className="w-full h-full border-none" 
                allow="autoplay; encrypted-media" 
                allowFullScreen
            ></iframe>
        );
    }

    if (source === 'local' || source === 'direct') {
        const finalUrl = playerData.lectureUrl.startsWith('/') ? backendUrl + playerData.lectureUrl : playerData.lectureUrl;
        return (
            <video 
                src={finalUrl} 
                controls 
                autoPlay 
                onEnded={handleLectureEnd}
                className="w-full h-full bg-black object-contain"
                controlsList="nodownload"
            >
                Your browser does not support the video tag.
            </video>
        );
    }

    return null;
  };

  if (!courseData) return <Loading />;

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col md:flex-row pt-20">
      
      {/* Sidebar Panel - Desktop (Right) / Mobile (Bottom) */}
      <div className={`w-full md:w-[400px] lg:w-[450px] bg-white border-l border-slate-100 flex flex-col md:h-[calc(100vh-80px)] h-auto md:order-last overflow-hidden`}>
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">Course Content</h2>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
               {progressData?.lectureCompleted ? progressData.lectureCompleted.length : 0} of {calculateNoOfLectures(courseData)} lectures completed
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
             <Layers size={18} />
          </div>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {courseData.courseContent.map((chapter, index) => (
            <div key={index} className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm bg-white">
              <button
                onClick={() => toggleSection(index)}
                className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${openSections[index] ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${openSections[index] ? 'bg-primary text-white scale-110' : 'bg-slate-100 text-slate-400'}`}>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${openSections[index] ? 'rotate-180' : ''}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{chapter.chapterTitle}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{chapter.chapterContent.length} lessons</p>
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {openSections[index] && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-1 bg-slate-50/30">
                      {chapter.chapterContent.map((lecture, i) => {
                        const isCompleted = progressData?.lectureCompleted.includes(lecture.lectureId);
                        const isActive = playerData?.lectureId === lecture.lectureId;
                        
                        return (
                          <div 
                            key={i} 
                            onClick={() => setPlayerData({ ...lecture, chapterIndex: index, lectureIndex: i, chapterTitle: chapter.chapterTitle })}
                            className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${isActive ? 'bg-white shadow-md border border-slate-100' : 'hover:bg-white/50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-100 text-green-500' : isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-300'}`}>
                                {isCompleted ? <CircleCheck size={14} /> : <Play size={12} fill={isActive ? "currentColor" : "none"} />}
                              </div>
                              <span className={`text-xs font-bold transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>
                                {lecture.lectureTitle}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                               {humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['m'] })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Main Player Content Area (Left) */}
      <div data-lenis-prevent className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar md:pb-20">
        <div className="p-4 md:p-8 lg:p-12 space-y-8">
           
           {/* Navigation Breadcrumb */}
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span onClick={() => navigate('/my-enrollments')} className="hover:text-primary cursor-pointer flex items-center gap-1">
                <ArrowLeft size={10} /> My Learning
              </span>
              <ChevronRight size={10} />
              <span className="truncate max-w-[150px]">{courseData.courseTitle}</span>
              {playerData && (
                <>
                  <ChevronRight size={10} />
                  <span className="text-slate-900 truncate max-w-[150px]">{playerData.lectureTitle}</span>
                </>
              )}
           </div>

           {/* Video Player Section */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-[48px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-white relative group"
           >
            <div className="aspect-video relative z-10">
               {renderVideoPlayer()}
            </div>
           </motion.div>

           {/* Lecture Info & Actions */}
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <span className="bg-primary/5 text-primary px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/10">
                       Chapter {playerData ? playerData.chapterIndex + 1 : 1} • Lesson {playerData ? playerData.lectureIndex + 1 : 1}
                    </span>
                    {progressData?.lectureCompleted.includes(playerData?.lectureId) && (
                        <span className="bg-green-50 text-green-600 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-100">
                           <CheckCircle size={10} /> Completed
                        </span>
                    )}
                 </div>
                 <h1 className="text-3xl font-black text-slate-900 leading-tight">
                    {playerData ? playerData.lectureTitle : "Select a lesson to begin"}
                 </h1>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                 <button 
                   onClick={() => markLectureAsCompleted(playerData?.lectureId)}
                   disabled={!playerData}
                   className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${progressData?.lectureCompleted.includes(playerData?.lectureId) ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-900 text-white shadow-xl hover:-translate-y-1'}`}
                 >
                   {progressData?.lectureCompleted.includes(playerData?.lectureId) ? 'Mark as Incomplete' : 'Complete & Continue'}
                 </button>
              </div>
           </div>

           <div className="h-px bg-slate-100 w-full" />

           {/* Bottom Details Section */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                   <Clock size={20} className="text-primary" /> Learning Support
                </h3>
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        Need help with this lesson? Our expert faculty is available to answer your clinical queries in the discussion forum.
                    </p>
                    <button className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2">
                        View Discussions <ChevronRight size={12} />
                    </button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                   <Star size={20} className="text-yellow-400" /> Share your feedback
                </h3>
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
                    <p className="text-sm font-bold text-slate-700">How would you rate this course?</p>
                    <div className="scale-125">
                      <Rating initialRating={initialRating} onRate={setUserRatingInput} />
                    </div>
                    {userRatingInput > 0 && (
                        <button 
                            onClick={() => handleRate(userRatingInput)}
                            className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20 mt-2"
                        >
                            Submit Rating
                        </button>
                    )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default Player