import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

const Blog = () => {
    const { backendUrl } = useContext(AppContext);
    const [blogs, setBlogs] = useState([]);

    const fetchBlogs = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/blogs/all`);
            if (data.success) {
                setBlogs(data.blogs.slice(0, 3)); // Only show latest 3
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        }
    };

    useEffect(() => {
        if (backendUrl) fetchBlogs();
    }, [backendUrl]);

    if (blogs.length === 0) return null;

    return (
        <section id="blogs" className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                            <Sparkles className="w-4 h-4" />
                            Medical Insights
                        </div>
                        <h2 className="text-4xl md:text-6xl font-heading font-bold text-slate-900 tracking-tight">
                            Elite <span className="text-primary italic">Clinical</span> Reads
                        </h2>
                    </motion.div>
                    <Link to="/blogs" className="group flex items-center gap-3 text-slate-900 font-bold text-xs uppercase tracking-widest px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all">
                        Explore All Insights <ArrowUpRight className="text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {blogs.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                        >
                            <Link to={`/blog/${item.slug}`} className="group block relative overflow-hidden bg-slate-50 rounded-[48px] border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-primary/20 transition-all duration-700">

                                <div className="aspect-[16/11] overflow-hidden">
                                    <img src={item.imageUrl || "https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=800"} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                </div>
                                <div className="p-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">{item.category || "Clinical"}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center gap-3 pt-6 border-t border-slate-200/60">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{item.author?.[0]}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">By {item.author}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Blog;
