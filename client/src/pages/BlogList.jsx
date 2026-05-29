import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Calendar, User, ArrowRight, Sparkles, Clock, ChevronDown, Settings, Bookmark, Grid } from "lucide-react";
import { getRelativeTime } from "../utils/DateUtils";
import Loading from "../components/ims/student/Loading";
import { motion } from "framer-motion";

const BlogList = () => {
    const { backendUrl, navigate } = useContext(AppContext);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/blogs/`);
            if (data.success) {
                setBlogs(data.blogs);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (backendUrl) fetchBlogs();
    }, [backendUrl]);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Blogger Style Sidebar */}
            <aside className="w-full md:w-64 border-r border-slate-200 bg-white p-6 pt-28 md:pt-32 shrink-0 z-20">
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-10 group cursor-pointer transition-all hover:translate-x-1">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/20">
                            B
                        </div>
                        <span className="text-sm font-black text-slate-800 uppercase tracking-widest group-hover:text-orange-500 transition-colors">
                            Physiocity
                        </span>
                    </div>

                    <button onClick={() => navigate('/create-blog')} className="w-full py-3.5 px-6 border-2 border-slate-100 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 flex items-center gap-3 text-sm font-black uppercase tracking-widest transition-all mb-8 shadow-sm">
                       Create blog
                    </button>

                    <div className="space-y-2">
                        <div className="flex items-center gap-3 py-3 px-4 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer transition-all">
                            <Settings size={20} />
                            <span className="text-sm font-bold tracking-tight">Settings</span>
                        </div>
                        <div onClick={() => navigate('/my-blogs')} className="flex items-center gap-3 py-3 px-4 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer transition-all">
                            <Bookmark size={20} />
                            <span className="text-sm font-bold tracking-tight">Reading List</span>
                        </div>
                    </div>

                    <div className="mt-20 pt-8 border-t border-slate-100">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            <a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">Content Policy</a>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-12 pt-28 md:pt-32">
                <div className="max-w-4xl mx-auto">
                    
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-700 cursor-pointer group">
                            <span className="text-sm font-black uppercase tracking-widest group-hover:text-orange-500 transition-colors text-slate-500">All blogs</span>
                            <ChevronDown size={14} className="text-slate-400" />
                        </div>
                        <button onClick={() => navigate('/my-blogs')} className="text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-[0.2em] transition-colors border-b-2 border-teal-600/20 py-1">My Blogs</button>
                    </div>

                    {/* Notification Banner */}
                    <div className="bg-[#e8f0fe] border border-[#d2e3fc] p-8 rounded-2xl mb-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                        <p className="text-[#1967d2] text-sm font-medium leading-relaxed relative z-10">
                            Add blogs to follow in your reading list <br />
                            <span className="text-slate-500">You are not currently following any blogs. Click <a href="#" className="text-[#1a73e8] font-bold hover:underline">here</a> to enter blogs that you'd like to follow in your reading list. <a href="#" className="text-[#1a73e8] font-bold hover:underline">Learn more</a></span>
                        </p>
                    </div>

                    {/* Blog Feed */}
                    <div className="space-y-6">
                        {blogs.map((blog, idx) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white border border-slate-200 rounded-[32px] overflow-hidden hover:border-orange-500/20 hover:shadow-[0_20px_40px_-12px_rgba(249,115,22,0.1)] transition-all group p-8"
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    {blog.imageUrl && (
                                        <div className="w-full md:w-48 h-32 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 group-hover:ring-4 ring-orange-500/5 transition-all">
                                            <Link to={`/blog/${blog.slug}`}>
                                                <img src={blog.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={blog.title} />
                                            </Link>
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-black text-[#1a73e8] group-hover:text-orange-500 transition-colors leading-tight tracking-tight">
                                                    <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                                                </h3>
                                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest tabular-nums ml-4 shrink-0">
                                                    {getRelativeTime(blog.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3 mb-4">
                                                {blog.excerpt || (blog.content ? blog.content.substring(0, 250).replace(/<[^>]*>/g, '') + '...' : '')}
                                            </p>
                                        </div>
                                        <Link to={`/blog/${blog.slug}`} className="text-teal-600 text-xs font-black uppercase tracking-widest hover:text-teal-700 transition-colors inline-flex items-center gap-2 group/btn">
                                            read more
                                            <div className="w-6 h-[2px] bg-teal-600/20 group-hover/btn:w-10 transition-all duration-300"></div>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {blogs.length === 0 && (
                        <div className="text-center py-24 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                            <Clock className="mx-auto text-slate-200 mb-6" size={48} />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No entries found in your reading list</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BlogList;
