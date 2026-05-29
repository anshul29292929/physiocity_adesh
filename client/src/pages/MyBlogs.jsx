import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Clock, CheckCircle, AlertCircle, ChevronLeft, Calendar, FileText, Trash2, Edit2 } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import Loading from "../components/ims/student/Loading";
import { motion } from "framer-motion";
import { getRelativeTime } from "../utils/DateUtils";
import ConfirmationModal from "../components/ims/admin/ConfirmationModal";

const MyBlogs = () => {
  const { backendUrl, token, navigate } = useContext(AppContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyBlogs = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/blogs/my-blogs`, {
        headers: { token }
      });
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (error) {
      toast.error("Failed to fetch your blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
  }, [token]);

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    if (!deletingId || isDeleting) return;
    setIsDeleting(true);
    try {
       await axios.delete(`${backendUrl}/api/blogs/${deletingId}`, { headers: { token } });
       toast.success("Blog deleted!");
       fetchMyBlogs();
       setShowConfirmModal(false);
    } catch {
       toast.error("Delete failed. You might not have permission.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };


  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50 pt-36 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
                <button 
                onClick={() => navigate("/blogs")}
                className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-4 group"
                >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-black uppercase tracking-widest">Gallery View</span>
                </button>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Your Contributions</h1>
            </div>
            <Link to="/create-blog" className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
               Write New Article
            </Link>
        </div>

        <div className="space-y-6">
          {blogs.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                <FileText className="mx-auto text-slate-100 mb-6" size={64} />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">You haven't shared any insights yet.</p>
                <Link to="/create-blog" className="text-primary font-bold hover:underline mt-4 inline-block">Start writing now</Link>
            </div>
          ) : (
            blogs.map((blog, idx) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-200 rounded-[32px] overflow-hidden p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-8">
                    {blog.imageUrl && (
                        <div className="w-full md:w-48 h-32 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                            <img src={blog.imageUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight">
                                    {blog.title}
                                </h3>
                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                    {blog.status === 'approved' ? (
                                        <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-100">
                                            <CheckCircle size={10} /> Live
                                        </span>
                                    ) : (
                                        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-orange-100">
                                            <Clock size={10} /> Pending Approval
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-4">
                                {blog.excerpt}
                            </p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Calendar size={12} /> {getRelativeTime(blog.createdAt)}</span>
                                <span className="text-slate-200">•</span>
                                <span>{blog.category}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link to={`/blog/${blog.slug}`} className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="View Blog">
                                    <FileText size={18} />
                                </Link>
                                <Link to={`/edit-blog/${blog.id}`} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Edit Blog">
                                    <Edit2 size={18} />
                                </Link>
                                <button onClick={() => confirmDelete(blog.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete Blog">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => !isDeleting && setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Delete Blog?"
        message="Are you sure you want to delete this blog post? It will be removed from the platform permanently."
        isSubmitting={isDeleting}
      />
    </div>
  );
};

export default MyBlogs;
