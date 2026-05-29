import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { 
  Plus, Edit2, Trash2, Eye,
  CheckCircle, Clock, Check
} from "lucide-react";
import { AppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import ConfirmationModal from "../../../components/ims/admin/ConfirmationModal";

const BlogManagement = () => {
  const { backendUrl, adminToken, navigate } = useContext(AppContext);
  const [blogs, setBlogs]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const authHeader = { headers: { admintoken: adminToken } };

  const fetchBlogs = async () => {
    if (!adminToken) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/blogs/admin/all`, authHeader);
      setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
    } catch {
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (backendUrl) fetchBlogs(); }, [backendUrl, adminToken]);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`${backendUrl}/api/blogs/admin/approve/${id}`, {}, authHeader);
      toast.success("Article approved!");
      fetchBlogs();
    } catch { toast.error("Approval failed."); }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    if (!deletingId || isDeleting) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${backendUrl}/api/blogs/admin/${deletingId}`, authHeader);
      toast.success("Article deleted.");
      fetchBlogs();
      setShowConfirmModal(false);
    } catch { 
      toast.error("Delete failed."); 
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const openEdit = (blog) => {
    navigate(`/admin/edit-blog/${blog.id}`);
  };

  const openCreate = () => {
    navigate('/admin/create-blog');
  };

  const filteredBlogs = activeTab === "pending" ? blogs.filter(b => b.status === "pending") : blogs;

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Blog Management</h1>
          <p className="text-gray-500 mt-1">Review, approve and manage community articles.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-100">
          <Plus size={20} strokeWidth={3} /> Create Article
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {["all", "pending"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow" : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300"}`}>
            {tab} {tab === "pending" && blogs.filter(b => b.status === "pending").length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {blogs.filter(b => b.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading articles...</td></tr>
              ) : filteredBlogs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No articles found.</td></tr>
              ) : filteredBlogs.map(blog => (
                <tr key={blog.id} className="hover:bg-gray-50 transition-all group">
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      {blog.imageUrl && (
                        <img src={blog.imageUrl} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" alt="" />
                      )}
                      <span className="font-semibold text-gray-800 line-clamp-1">{blog.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{blog.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-600">{blog.author}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      blog.status === "approved" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-500"}`}>
                      {blog.status === "approved" ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {blog.status === "pending" && (
                        <button onClick={() => handleApprove(blog.id)} title="Approve"
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                          <Check size={16} strokeWidth={3} />
                        </button>
                      )}
                      {blog.slug && (
                        <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" title="View as user"
                          className="p-2 border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-300 rounded-lg transition-all">
                          <Eye size={16} />
                        </a>
                      )}
                      <button onClick={() => openEdit(blog)} title="Edit"
                        className="p-2 border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => confirmDelete(blog.id)} title="Delete"
                        className="p-2 border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => !isDeleting && setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Delete Article?"
        message="Are you sure you want to permanently delete this article? This action cannot be reversed."
        isSubmitting={isDeleting}
      />
    </div>
  );
};

export default BlogManagement;
