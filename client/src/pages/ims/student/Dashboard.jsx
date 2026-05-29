import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import { QuizContext } from '../../../context/QuizContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Zap, Target, BookOpen, Clock, 
    ChevronRight, BarChart3, RotateCcw, 
    BookMarked, Award, CheckCircle2,
    FileText, Clock as PendingIcon, CheckCircle, Play, PenSquare,
    Calendar, MapPin, ExternalLink, Video, Mail
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
    const { userData, setUserData, navigate, backendUrl, token, enrolledEvents, fetchUserEnrolledEvents } = useContext(AppContext);
    const { startQuiz, quizzes, fetchQuizzes } = useContext(QuizContext);
    const [stats, setStats] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [myBlogs, setMyBlogs] = useState([]);
    const [readingList, setReadingList] = useState([]);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isUpdatingBio, setIsUpdatingBio] = useState(false);
    const [bio, setBio] = useState('');
    const [activeTab, setActiveTab] = useState('learning'); // learning, sessions, performance

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/quiz/stats/${userData.id}`, { headers: { token } });
            if (data.success) setStats(data.stats);
        } catch (error) { console.error(error); }
    };

    const fetchEnrolledCourses = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`, { headers: { token } });
            if (data.success) setEnrolledCourses(data.enrolledCourses || []);
        } catch (e) { /* silent */ }
    };

    const fetchMyBlogs = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/blogs/my-blogs`, { headers: { token } });
            if (data.success) setMyBlogs(data.blogs || []);
        } catch (e) { /* silent */ }
    };

    const fetchReadingList = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/blogs/reading-list`, { headers: { token } });
            if (data.success) setReadingList(data.blogs || []);
        } catch (e) { /* silent */ }
    };

    useEffect(() => {
        if (userData) {
            fetchStats();
            fetchEnrolledCourses();
            fetchMyBlogs();
            fetchReadingList();
            fetchQuizzes();
            fetchUserEnrolledEvents();
            setBio(userData.bio || '');
        }
    }, [userData]);

    const handleUpdateBio = async () => {
        try {
            setIsUpdatingBio(true);
            const { data } = await axios.patch(`${backendUrl}/api/user/update-bio`, { bio }, { headers: { token } });
            if (data.success) {
                toast.success(data.message);
                setUserData({ ...userData, bio: bio });
                setIsEditingBio(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsUpdatingBio(false);
        }
    };

    const handleStartQuiz = (type) => {
        startQuiz(type);
        navigate('/quiz');
    };

    return (
        <div className="md:px-36 px-8 pt-32 pb-16 min-h-screen bg-slate-50/50">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Welcome back, <span className="text-primary">{userData?.name.split(' ')[0]}</span>!
                        </h1>
                        <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" />
                            {userData?.email}
                        </p>
                        <div className="mt-4 max-w-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Your Bio</p>
                                <button onClick={() => setIsEditingBio(!isEditingBio)} className="text-primary hover:text-primary/80 transition-colors">
                                    <PenSquare size={12} />
                                </button>
                            </div>
                            {isEditingBio ? (
                                <div className="flex flex-col gap-2">
                                    <textarea 
                                        value={bio} 
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        rows="3"
                                        placeholder="Tell us about yourself..."
                                    />
                                    <div className="flex gap-2">
                                        <button disabled={isUpdatingBio} onClick={handleUpdateBio} className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2">
                                            {isUpdatingBio ? (
                                                <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                                            ) : 'Save Bio'}
                                        </button>
                                        <button onClick={() => { setIsEditingBio(false); setBio(userData.bio || ''); }} className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg disabled:opacity-50">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm font-medium italic line-clamp-3">
                                    {userData?.bio || "No bio added yet. Click the edit icon to share your journey!"}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100 flex items-center gap-2">
                            <Zap size={20} className="text-orange-500 fill-orange-500" />
                            <span className="font-bold text-orange-700">{userData?.dailyStreak || 0} Day Streak</span>
                        </div>
                        <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex items-center gap-2 text-primary font-bold">
                            <Award size={20} />
                            <span>Level: {userData?.performanceLevel || 'Beginner'}</span>
                        </div>
                    </div>
                </div>

                {/* Glass Tab Navigator */}
                <div className="flex items-center gap-6 p-2 bg-white/50 backdrop-blur-xl border border-white rounded-3xl self-start sticky top-24 z-20 shadow-sm">
                    <TabButton
                        active={activeTab === 'learning'}
                        icon={<BookOpen size={18} />}
                        label="My Learning"
                        onClick={() => setActiveTab('learning')}
                    />
                    <TabButton
                        active={activeTab === 'sessions'}
                        icon={<Calendar size={18} />}
                        label="My Sessions"
                        onClick={() => setActiveTab('sessions')}
                    />
                    <TabButton
                        active={activeTab === 'reading-list'}
                        icon={<BookMarked size={18} />}
                        label="Saved Articles"
                        onClick={() => setActiveTab('reading-list')}
                    />
                    <TabButton
                        active={activeTab === 'performance'}
                        icon={<BarChart3 size={18} />}
                        label="Performance"
                        onClick={() => setActiveTab('performance')}
                    />
                </div>

                {/* ─── Tab Content ─── */}
                <div className="min-h-[400px]">
                    {activeTab === 'learning' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <BookOpen size={14} className="text-blue-500" /> My Enrolled Courses
                                </h2>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{enrolledCourses.length} Enrolled</span>
                            </div>

                            {enrolledCourses.length === 0 ? (
                                <EmptyState
                                    icon={<BookOpen size={48} />}
                                    text="You haven't enrolled in any courses yet."
                                    actionLabel="Browse Courses"
                                    onAction={() => navigate('/courses')}
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {enrolledCourses.map((course, i) => (
                                        <CourseCard key={course.id || i} course={course} navigate={navigate} i={i} />
                                    ))}
                                </div>
                            )}

                            {/* My Blogs Section - Moved under Learning */}
                            <div className="mt-10 flex flex-col gap-6">
                                <div className="flex items-center justify-between px-2 border-t border-slate-100 pt-10">
                                    <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <FileText size={14} className="text-orange-500" /> My Contributions
                                    </h2>
                                    <button onClick={() => navigate('/create-blog')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                                        <PenSquare size={11} /> Write New
                                    </button>
                                </div>
                                {myBlogs.length === 0 ? (
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center py-10">
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest text-[10px]">No articles written yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {myBlogs.slice(0, 4).map((blog, i) => (
                                            <BlogListItem key={blog.id} blog={blog} navigate={navigate} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'sessions' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Calendar size={14} className="text-primary" /> My Enrolled Events
                                </h2>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{enrolledEvents.length} Sessions</span>
                            </div>

                            {enrolledEvents.length === 0 ? (
                                <EmptyState
                                    icon={<Calendar size={48} />}
                                    text="No session enrollments found."
                                    actionLabel="Explore Events"
                                    onAction={() => navigate('/events')}
                                    color="bg-primary"
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {enrolledEvents.map((enrollment, i) => (
                                        <EventCard key={enrollment.id} enrollment={enrollment} navigate={navigate} i={i} backendUrl={backendUrl} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'reading-list' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <BookMarked size={14} className="text-primary" /> Reading List
                                </h2>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{readingList.length} Saved</span>
                            </div>

                            {readingList.length === 0 ? (
                                <EmptyState
                                    icon={<BookMarked size={48} />}
                                    text="You haven't saved any articles yet."
                                    actionLabel="Browse Blogs"
                                    onAction={() => navigate('/blogs')}
                                    color="bg-primary"
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {readingList.map((blog, i) => (
                                        <BlogListItem key={blog.id} blog={blog} navigate={navigate} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'performance' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            <div className="lg:col-span-2 flex flex-col gap-8">
                                {/* Action Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ActionCard
                                        title="Daily Mixed Quiz"
                                        sub="Keep your streak alive"
                                        icon={<Target className="text-primary" />}
                                        onClick={() => handleStartQuiz('mixed')}
                                        accent="bg-primary"
                                    />
                                    <ActionCard
                                        title="Retry Mistakes"
                                        sub="Master difficult topics"
                                        icon={<RotateCcw className="text-red-500" />}
                                        onClick={() => handleStartQuiz('mistake')}
                                        accent="bg-red-500"
                                    />
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                                    <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Clock size={20} />
                                            </div>
                                            Quiz History
                                        </div>
                                        <Link to="/quiz" className="text-[10px] font-black text-primary uppercase tracking-widest">More</Link>
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {stats?.recentAttempts?.map((attempt, i) => (
                                            <AttemptItem key={i} attempt={attempt} navigate={navigate} />
                                        ))}
                                        {(!stats?.recentAttempts || stats.recentAttempts.length === 0) && (
                                            <div className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No activity recorded</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Mini Stats */}
                            <div className="flex flex-col gap-6">
                                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col gap-8">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-36 h-36 rounded-full border-[8px] border-primary/5 relative">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl font-black text-slate-900">{(stats?.accuracy || 0).toFixed(0)}%</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Accuracy</span>
                                            </div>
                                            <div className="absolute -bottom-3 bg-slate-900 text-white text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-xl">
                                                Active Learner
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <StatItem label="Questions" value={stats?.totalQuestions || 0} sub="Solved" color="bg-blue-500" />
                                        <StatItem label="Precision" value={stats?.totalCorrect || 0} sub="Correct" color="bg-green-500" />
                                        <StatItem label="Speed" value={`${stats?.avgTime || 0}s`} sub="v/s Avg" color="bg-amber-500" />
                                    </div>

                                    <div className="pt-6 border-t border-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Learning Milestones</p>
                                        <div className="space-y-5">
                                             <Milestone icon={<CheckCircle2 size={16} className={stats?.totalCorrect >= 100 ? "text-green-500" : "text-slate-300"} />} label="Centurion Archer (100+ Correct)" completed={stats?.totalCorrect >= 100} />
                                             <Milestone icon={<Zap size={16} className={userData?.dailyStreak >= 7 ? "text-orange-500" : "text-slate-300"} />} label="Consistent Finisher (7d Streak)" completed={userData?.dailyStreak >= 7} />
                                             <Milestone icon={<Target size={16} className={(stats?.accuracy) >= 90 ? "text-indigo-500" : "text-slate-300"} />} label="Precision Master (90%+ Acc)" completed={(stats?.accuracy) >= 90} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub Components ---

const TabButton = ({ active, icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${active ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/40 translate-y-[-2px]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const CourseCard = ({ course, navigate, i }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
        onClick={() => navigate(`/course/${course.slug || course.id}`)}
        className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden group"
    >
        <div className="relative h-44 overflow-hidden">
            <img src={course.courseThumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                <div className="w-full py-2 bg-white/10 backdrop-blur-md rounded-xl text-center text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                    Open Player
                </div>
            </div>
        </div>
        <div className="p-6">
            <h3 className="font-heading font-black text-slate-900 text-lg line-clamp-2 mb-4 group-hover:text-primary transition-colors">{course.courseTitle}</h3>
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{course.category || 'Specialization'}</span>
                <div className="flex items-center gap-2 text-primary">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Play size={14} className="fill-primary" />
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

const EventCard = ({ enrollment, navigate, i, backendUrl }) => {
    const { Event: event } = enrollment;
    if (!event) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/events/${event.id}`)}
            className="group relative bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden flex flex-col"
        >
            <div className="relative h-44 overflow-hidden">
                <img 
                    src={event.image ? (event.image.startsWith('http') ? event.image : `${backendUrl}${event.image}`) : "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600"} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex flex-col items-center min-w-[50px] shadow-sm border border-white/20">
                    <span className="text-slate-900 font-black text-sm leading-none">{new Date(event.startDate || event.date).getDate()}</span>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{new Date(event.startDate || event.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="absolute top-4 right-4">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${event.status === 'live' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
                        {event.status}
                    </span>
                </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1">
                <h3 className="font-heading font-black text-slate-800 text-lg leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
                
                <div className="mt-auto space-y-3">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                            <Clock size={14} className="text-primary" /> {event.startTime || event.time}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap truncate">
                            <MapPin size={14} /> {event.location}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Video size={14} />
                            </div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Join Session</span>
                        </div>
                        <ExternalLink size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const BlogListItem = ({ blog, navigate }) => (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 flex items-center gap-5 hover:border-primary/20 transition-all">
        {blog.imageUrl && <img src={blog.imageUrl} className="w-16 h-16 rounded-2xl object-cover" />}
        <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-sm line-clamp-1">{blog.title}</p>
            <span className={`text-[9px] font-black uppercase tracking-widest ${blog.status === 'approved' ? 'text-green-500' : 'text-orange-500'}`}>{blog.status}</span>
        </div>
        <button onClick={() => navigate(blog.slug ? `/blog/${blog.slug}` : '/my-blogs')} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-primary transition-colors">
            <ChevronRight size={18} />
        </button>
    </div>
);

const AttemptItem = ({ attempt, navigate }) => (
    <div
        onClick={() => navigate(`/quiz/result/${attempt.id}`)}
        className="flex items-center justify-between p-5 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group bg-white/50"
    >
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-primary text-xs group-hover:bg-primary group-hover:text-white transition-all">
                {attempt.quizTitle[0].toUpperCase()}
            </div>
            <div>
                <p className="font-black text-slate-950 text-sm leading-none group-hover:text-primary transition-colors">{attempt.quizTitle}</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(attempt.createdAt).toLocaleDateString('en-GB')}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{attempt.accuracy.toFixed(0)}% Accuracy</span>
                </div>
            </div>
        </div>
        <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
    </div>
);

const EmptyState = ({ icon, text, actionLabel, onAction, color="bg-primary" }) => (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-16 text-center">
        <div className={`mx-auto w-24 h-24 rounded-full ${color}/5 flex items-center justify-center text-slate-200 mb-8`}>
            {icon}
        </div>
        <p className="text-slate-400 text-sm font-black uppercase tracking-[0.2em] mb-8">{text}</p>
        <button onClick={onAction} className={`px-10 py-5 ${color} text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all active:scale-95`}>
            {actionLabel}
        </button>
    </div>
);

const ActionCard = ({ title, sub, icon, onClick, accent }) => (
    <button 
        onClick={onClick}
        className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all text-left flex flex-col gap-4 relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-1 h-full ${accent} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-400 font-medium">{sub}</p>
        </div>
    </button>
);

const StatItem = ({ label, value, sub, color }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
        <div className="flex items-center gap-3">
            <div className={`w-1.5 h-8 ${color} rounded-full`}></div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-900 leading-none">{sub}</p>
            </div>
        </div>
        <span className="text-xl font-black text-slate-900">{value}</span>
    </div>
);

const Milestone = ({ icon, label, completed }) => (
    <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? 'bg-green-50' : 'bg-slate-50'}`}>
            {icon}
        </div>
        <span className={`text-xs font-bold ${completed ? 'text-slate-900' : 'text-slate-300'}`}>{label}</span>
    </div>
);

export default StudentDashboard;
