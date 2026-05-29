import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Calendar, User, ChevronLeft, Share2, Bookmark, Clock, Sparkles, BookmarkCheck } from "lucide-react";
import Loading from "../components/ims/student/Loading";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const BlogDetail = () => {
    const { slug } = useParams();
    const { backendUrl, token } = useContext(AppContext);
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [savingState, setSavingState] = useState(false);

    const fetchBlog = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/blogs/${slug}`);
            if (data.success) {
                setBlog(data.blog);
                // Check reading list status once blog is loaded
                if (token) {
                    try {
                        const res = await axios.get(`${backendUrl}/api/blogs/reading-list/status/${data.blog.id}`, { headers: { token } });
                        if (res.data.success) setSaved(res.data.saved);
                    } catch (_) {}
                }
            }
        } catch (error) {
            console.error("Error fetching blog:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSave = async () => {
        if (!token) { toast.info('Please log in to save blogs'); return; }
        setSavingState(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/blogs/reading-list/toggle/${blog.id}`, {}, { headers: { token } });
            if (data.success) {
                setSaved(data.saved);
                toast.success(data.message);
            }
        } catch (error) {
            toast.error('Failed to update reading list');
        } finally {
            setSavingState(false);
        }
    };

    useEffect(() => {
        if (backendUrl) fetchBlog();
        window.scrollTo(0, 0);
    }, [backendUrl, slug]);

    if (loading) return <Loading />;
    if (!blog) return (
        <div className="pt-40 pb-24 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Article Not Found</h2>
            <Link to="/blogs" className="text-primary font-bold">Return to Insights</Link>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Back link */}
                <Link to="/blogs" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-[10px] uppercase tracking-widest mb-6 transition-colors">
                    <ChevronLeft size={14} /> Back to Journal
                </Link>

                {/* Hero Image */}
                {blog.imageUrl && (
                    <div className="w-full mb-8 rounded-[32px] overflow-hidden border border-slate-100 shadow-sm bg-white flex justify-center">
                        <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            className="max-h-[50vh] w-full object-contain"
                        />
                    </div>
                )}

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT — Main Content */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 sm:p-10"
                        >
                            {/* Category */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest mb-4">
                                <Sparkles size={11} /> {blog.category || "Clinical Insight"}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-slate-900 leading-tight mb-6">
                                {blog.title}
                            </h1>

                            {/* Excerpt */}
                            {blog.excerpt && (
                                <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8 border-l-4 border-primary pl-5 py-1">
                                    {blog.excerpt}
                                </p>
                            )}

                            {/* Main body */}
                            <div className="prose prose-slate prose-base max-w-none
                                prose-headings:font-heading prose-headings:font-bold prose-headings:text-slate-900
                                prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:font-medium
                                prose-strong:text-slate-900 prose-strong:font-black
                                prose-img:rounded-[24px] prose-img:shadow-lg prose-img:my-8
                                prose-blockquote:border-primary prose-blockquote:bg-slate-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-[20px] prose-blockquote:not-italic
                                prose-li:text-slate-600 prose-li:font-medium
                                prose-a:text-primary prose-a:font-bold hover:prose-a:underline">
                                <div dangerouslySetInnerHTML={{ __html: blog.content }}></div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT — Sidebar */}
                    <div className="flex flex-col gap-5">

                        {/* Author + Meta card */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6"
                        >
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">About this article</p>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20 flex-shrink-0">
                                    {blog.author?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Posted by</p>
                                    <p className="font-bold text-slate-900 text-sm">{blog.author}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-3 text-slate-500 text-sm">
                                    <Calendar size={15} className="text-primary flex-shrink-0" />
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Published</p>
                                        <p className="font-semibold text-slate-700 text-sm">{new Date(blog.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 text-sm">
                                    <Clock size={15} className="text-primary flex-shrink-0" />
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Read time</p>
                                        <p className="font-semibold text-slate-700 text-sm">8 min read</p>
                                    </div>
                                </div>
                                {blog.category && (
                                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                                        <Sparkles size={15} className="text-primary flex-shrink-0" />
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                                            <p className="font-semibold text-slate-700 text-sm">{blog.category}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Actions card */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6"
                        >
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Actions</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleToggleSave}
                                    disabled={savingState}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all disabled:opacity-60 ${saved ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-500 hover:bg-primary/10 hover:text-primary border border-slate-100'}`}
                                >
                                    {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                                    {saved ? 'Saved' : 'Save'}
                                </button>
                                <button
                                    onClick={() => { navigator.share?.({ title: blog.title, url: window.location.href }) || navigator.clipboard.writeText(window.location.href); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs bg-slate-50 text-slate-500 hover:bg-primary/10 hover:text-primary border border-slate-100 transition-all"
                                >
                                    <Share2 size={16} /> Share
                                </button>
                            </div>
                        </motion.div>

                        {/* Continue reading CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-primary rounded-[32px] p-6 text-white"
                        >
                            <p className="font-heading font-bold text-lg mb-2">Continue Learning</p>
                            <p className="text-white/70 text-sm mb-4">Explore our curated courses designed by clinical experts.</p>
                            <Link to="/courses" className="inline-flex items-center gap-2 bg-white text-primary font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all">
                                Browse Courses
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
