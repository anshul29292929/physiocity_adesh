import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import { Send, Image as ImageIcon, FileText, ChevronLeft, Sparkles, Edit3, Settings, Eye, Tag, Hash, Layout, Globe, AlertCircle, Save } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateBlog = () => {
  const { id } = useParams();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isEditMode = !!id;
  const { backendUrl, token, adminToken, navigate, userData } = useContext(AppContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("content"); // content, seo
  const [tagInput, setTagInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "Clinical Insight",
    imageUrl: "",
    author: userData?.name || "Student",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    tags: [],
    isDraft: false,
    status: isAdmin ? "approved" : "pending"
  });

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchBlog = async () => {
        try {
          const url = isAdmin 
            ? `${backendUrl}/api/blogs/admin/all` 
            : `${backendUrl}/api/blogs/my-blogs`;
          const headers = isAdmin ? { admintoken: adminToken } : { token };
          
          const { data } = await axios.get(url, { headers });
          const editBlog = data.blogs.find(b => String(b.id) === String(id));
          if (editBlog) {
            setFormData({
              title: editBlog.title || "",
              content: editBlog.content || "",
              excerpt: editBlog.excerpt || "",
              category: editBlog.category || "Clinical Insight",
              imageUrl: editBlog.imageUrl || "",
              author: editBlog.author || (isAdmin ? "Admin" : userData?.name),
              metaTitle: editBlog.metaTitle || "",
              metaDescription: editBlog.metaDescription || "",
              metaKeywords: editBlog.metaKeywords || "",
              tags: Array.isArray(editBlog.tags) ? editBlog.tags : (typeof editBlog.tags === 'string' ? JSON.parse(editBlog.tags) : []),
              isDraft: editBlog.isDraft || false,
              status: editBlog.status || (isAdmin ? "approved" : "pending")
            });
            if (editBlog.imageUrl) setPreview(editBlog.imageUrl);
          } else {
            toast.error("Blog not found or unauthorized");
            navigate("/my-blogs");
          }
        } catch (err) {
          toast.error("Failed to load blog details");
        } finally {
          setLoading(false);
        }
      };
      if (token) fetchBlog();
    }
  }, [id, token, isEditMode, backendUrl, navigate, userData]);

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (!formData.tags.includes(newTag)) {
        setFormData({ ...formData, tags: [...formData.tags, newTag] });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e, forcedDraft = false) => {
    if (e) e.preventDefault();
    if (!token) return toast.error("Please login to submit a blog");
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'isDraft') {
          submitData.append(key, forcedDraft ? true : formData[key]);
        } else if (key !== 'imageUrl') {
          submitData.append(key, formData[key]);
        }
      });
      
      if (image) {
        submitData.append('image', image);
      }

      const url = isAdmin
        ? (isEditMode ? `${backendUrl}/api/blogs/admin/${id}` : `${backendUrl}/api/blogs/admin`)
        : (isEditMode ? `${backendUrl}/api/blogs/update/${id}` : `${backendUrl}/api/blogs/create`);

      const method = isAdmin
        ? (isEditMode ? 'patch' : 'post')
        : (isEditMode ? 'put' : 'post');

      const headers = isAdmin
        ? { admintoken: adminToken, 'Content-Type': 'multipart/form-data' }
        : { token, 'Content-Type': 'multipart/form-data' };

      const { data } = await axios[method](url, submitData, { headers });

      if (data.success) {
        toast.success(forcedDraft ? "Draft saved successfully!" : (isEditMode ? "Blog updated successfully!" : "Blog submitted for approval!"));
        navigate("/my-blogs");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-40 text-center font-bold text-slate-400 tracking-widest uppercase text-xs">Loading Editor Environment...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto">
        {/* Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group w-fit"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit Editor</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Save size={14} /> {isSubmitting ? "..." : "Save Draft"}
            </button>
            <button 
              onClick={(e) => handleSubmit(e, false)}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <Send size={14} /> {isSubmitting ? "Processing..." : (isEditMode ? "Update Post" : "Publish Post")}
            </button>
          </div>
        </div>

        {/* Main Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Post Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 md:p-10 space-y-8">
                {/* Title Area */}
                <input 
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-4xl font-black text-slate-900 placeholder:text-slate-200 border-none outline-none bg-transparent"
                  placeholder="Enter Post Title..."
                />

                <div className="flex items-center gap-6 border-b border-slate-100 pb-2">
                   <button 
                    onClick={() => setActiveTab("content")}
                    className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'content' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     Post Content
                     {activeTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-full" />}
                   </button>
                   <button 
                    onClick={() => setActiveTab("seo")}
                    className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'seo' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     SEO Settings
                     {activeTab === 'seo' && <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-full" />}
                   </button>
                </div>

                {activeTab === 'content' ? (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="quill-premium min-h-[500px]">
                      <ReactQuill 
                        theme="snow"
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        modules={modules}
                        placeholder="Start writing your masterpiece..."
                      />
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t border-slate-50">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={12} /> Post Excerpt
                      </label>
                      <textarea 
                        rows={3}
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        className="w-full p-6 bg-slate-50 rounded-2xl border border-slate-100 focus:border-slate-300 outline-none font-medium text-slate-600 placeholder:text-slate-300 resize-none leading-relaxed transition-all"
                        placeholder="Provide a short summary for the blog feed..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-50/50 rounded-[24px] p-8 border border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Globe size={14} className="text-blue-500" /> Google Search Preview
                      </h4>
                      <div className="space-y-1">
                        <p className="text-[#1a0dab] text-xl font-medium line-clamp-1">
                          {formData.metaTitle || formData.title || "Your Page Title Appears Here"}
                        </p>
                        <p className="text-[#006621] text-sm mb-1 truncate">physiocity.com › blog › post</p>
                        <p className="text-[#545454] text-sm line-clamp-2">
                          {formData.metaDescription || formData.excerpt || "Enter a meta description to see how your post will look in search results..."}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SEO Title</label>
                          <span className={`text-[10px] font-bold ${formData.metaTitle.length > 60 ? 'text-amber-500' : 'text-slate-400'}`}>{formData.metaTitle.length} / 60</span>
                        </div>
                        <input 
                          type="text"
                          value={formData.metaTitle}
                          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-slate-400 outline-none font-bold text-slate-700 transition-all shadow-sm"
                          placeholder="Meta title for search engines..."
                        />
                      </div>

                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta Description</label>
                          <span className={`text-[10px] font-bold ${formData.metaDescription.length > 160 ? 'text-amber-500' : 'text-slate-400'}`}>{formData.metaDescription.length} / 160</span>
                        </div>
                        <textarea 
                          rows={4}
                          value={formData.metaDescription}
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                          className="w-full p-6 bg-white border border-slate-200 rounded-2xl focus:border-slate-400 outline-none font-medium text-slate-600 resize-none transition-all shadow-sm"
                          placeholder="Meta description for search engines..."
                        />
                        <p className="text-[10px] text-slate-400 flex items-center gap-1.5 ml-1"><AlertCircle size={10}/> Keep it under 160 chars for best display on mobile.</p>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta Keywords</label>
                        <input 
                          type="text"
                          value={formData.metaKeywords}
                          onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-slate-400 outline-none font-bold text-slate-700 transition-all shadow-sm"
                          placeholder="e.g. Health, Wellness, Physiotherapy (comma separated)"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Settings */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Featured Image Card */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} /> Featured Image
              </h3>
              
              <div className={`relative group w-full aspect-video rounded-[24px] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden ${preview ? 'border-slate-100' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'}`}>
                {preview ? (
                  <>
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                      <label htmlFor="blogImage" className="px-5 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:scale-105 transition-all">Replace</label>
                      <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="px-5 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">Remove</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-slate-500 transition-colors">
                      <ImageIcon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-slate-500">Pick Cover Image</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">High Resolution Recommended</p>
                    </div>
                    <input 
                      type="file" 
                      id="blogImage"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImage(file);
                          setPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Category & Tags Card */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layout size={14} /> Taxonomy
                </h3>
                <div className="relative group">
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full pl-6 pr-10 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-slate-300 outline-none font-bold text-slate-700 appearance-none transition-all"
                  >
                    <option>Clinical Insight</option>
                    <option>Case Study</option>
                    <option>Research Update</option>
                    <option>Academy News</option>
                    <option>Student Spotlights</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronLeft size={16} className="-rotate-90" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={14} /> SEO Tags
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group border border-slate-200">
                      <Hash size={10} /> {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <ChevronLeft size={12} className="rotate-45" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative group">
                   <Edit3 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                   <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:border-slate-300 outline-none font-bold text-[11px] text-slate-600 transition-all"
                    placeholder="Type tag and press enter..."
                   />
                </div>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 shadow-xl shadow-slate-200">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings size={14} /> Publication Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Last Saved:</span>
                  <span className="text-slate-300">Just now</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="text-orange-400 uppercase tracking-widest text-[10px]">{isEditMode ? 'Modified' : 'New Content'}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                   <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Save as Draft</span>
                      <input 
                        type="checkbox" 
                        checked={formData.isDraft} 
                        onChange={(e) => setFormData({ ...formData, isDraft: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 focus:ring-slate-600"
                      />
                   </label>
                   
                   {isAdmin && (
                     <div className="pt-3 border-t border-white/10 space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Publication Status</label>
                       <select 
                         value={formData.status}
                         onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                         className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-slate-500 transition-all"
                       >
                         <option value="pending">Pending Admin</option>
                         <option value="approved">Approved & Live</option>
                       </select>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .quill-premium .ql-toolbar {
          background: #fff;
          border: 1px solid #E2E8F0 !important;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          border-bottom: none !important;
          padding: 1rem !important;
        }
        .quill-premium .ql-container {
          border: 1px solid #E2E8F0 !important;
          border-bottom-left-radius: 20px;
          border-bottom-right-radius: 20px;
          min-height: 450px;
          font-family: inherit;
          background: white;
        }
        .quill-premium .ql-editor {
          padding: 1.5rem !important;
          font-size: 1.1rem;
          color: #1e293b;
        }
        .quill-premium .ql-editor.ql-blank::before {
          color: #cbd5e1;
          font-style: normal;
        }
        .quill-premium .ql-snow .ql-picker.ql-header .ql-picker-label::before,
        .quill-premium .ql-snow .ql-picker.ql-header .ql-picker-item::before {
          font-weight: 800;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
};

export default CreateBlog;
