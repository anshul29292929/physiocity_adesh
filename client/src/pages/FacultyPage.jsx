import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Mail, ArrowRight, Award, BookOpen, GraduationCap, Sparkles, Hospital, X, Upload, Loader2 } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from "../context/AppContext";

const FacultyPage = () => {
  const { backendUrl } = useContext(AppContext);
  const [facultyList, setFacultyList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "", email: "", mobileNumber: "", role: "", org: "", speciality: "", experience: "", degrees: "", bio: ""
  });
  const [facultyImage, setFacultyImage] = useState(null);
  const [facultyCV, setFacultyCV] = useState(null);
  const scrollRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.children[0]?.offsetWidth || 0;
      const gap = 24; // padding/gap estimated
      if (cardWidth > 0) {
        const newIndex = Math.round(scrollPosition / (cardWidth + gap));
        setActiveIndex(newIndex);
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchVerifiedFaculty();
  }, []);

  const fetchVerifiedFaculty = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/faculty');
      if (data.success) {
        setFacultyList(data.faculty);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!facultyImage) return toast.warn("Please upload a professional photograph.");
    
    setIsSubmitting(true);
    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('email', formData.email);
    formPayload.append('mobileNumber', formData.mobileNumber);
    formPayload.append('role', formData.role);
    formPayload.append('org', formData.org);
    formPayload.append('speciality', formData.speciality);
    formPayload.append('experience', formData.experience);
    formPayload.append('degrees', formData.degrees);
    formPayload.append('bio', formData.bio);
    formPayload.append('facultyImage', facultyImage);
    if (facultyCV) {
       formPayload.append('cv', facultyCV);
    }

    try {
      const { data } = await axios.post(backendUrl + '/api/user/apply-faculty', formPayload);
      if (data.success) {
        toast.success(data.message);
        setIsModalOpen(false);
        setFormData({ name: "", email: "", mobileNumber: "", role: "", org: "", speciality: "", experience: "", degrees: "", bio: "" });
        setFacultyImage(null);
        setFacultyCV(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <span className="bg-primary/5 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] border border-primary/10 mb-6 inline-block">
             World Class Educators
          </span>
          <h1 className="text-5xl md:text-8xl font-heading font-bold text-slate-900 mb-8 tracking-tighter">
            Our <span className="text-primary italic">Expert</span> Faculty
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
            The bridge between theory and practice. Learn from clinical pioneers 
            shaping the future of physical therapy at elite healthcare centers.
          </p>
        </motion.div>
      </div>

      {/* Faculty Grid */}
      <div 
         ref={scrollRef}
         onScroll={handleScroll}
         className="max-w-7xl mx-auto px-6 flex lg:grid lg:grid-cols-2 gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {facultyList.map((member, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: idx * 0.1 }}
            className="snap-center shrink-0 w-[90vw] sm:w-[80vw] md:w-[600px] lg:w-auto group bg-slate-50 rounded-[32px] md:rounded-[40px] p-4 sm:p-6 md:p-8 border border-slate-100 flex flex-row md:flex-row gap-4 sm:gap-6 hover:bg-white hover:shadow-2xl hover:border-primary/20 transition-all duration-700"
          >
            <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-[340px] rounded-[20px] md:rounded-[28px] overflow-hidden border-2 md:border-4 border-white shadow-lg flex-shrink-0 relative">
               <img src={member.image} alt={member.name} className="w-full h-full object-cover object-top grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="flex-1 flex flex-col justify-center py-1 sm:py-2">
               <div>
                 <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg sm:text-2xl lg:text-3xl font-heading font-bold text-slate-900 mb-1 lg:mb-2 leading-tight lg:leading-none group-hover:text-primary transition-colors">{member.name}</h3>
                      <div className="flex flex-col gap-1.5">
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest w-fit">
                            <Sparkles size={12} /> {member.role}
                         </div>
                         <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider ml-1 mt-1">
                            <Hospital size={14} className="text-primary/50" />
                            {member.org}
                         </div>
                      </div>
                    </div>
                  </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center gap-2 text-slate-500 bg-white/50 p-2.5 rounded-2xl border border-white">
                       <Award size={16} className="text-primary" />
                       <span className="text-[9px] font-bold uppercase tracking-wider">{member.speciality}</span>
                    </div>
                     <div className="flex items-center gap-2 text-slate-500 bg-white/50 p-2.5 rounded-2xl border border-white">
                        <GraduationCap size={16} className="text-primary" />
                        <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider">
                           {(() => {
                             if (Array.isArray(member.degrees)) return member.degrees.join(", ");
                             if (typeof member.degrees === 'string') {
                               try {
                                 const parsed = JSON.parse(member.degrees);
                                 if (Array.isArray(parsed)) return parsed.join(", ");
                               } catch (e) { return member.degrees; }
                             }
                             return member.degrees || 'N/A';
                           })()}
                        </span>
                     </div>
                 </div>

                 <p className="text-slate-500 text-[10px] sm:text-sm leading-relaxed mb-3 sm:mb-6 font-medium line-clamp-2 sm:line-clamp-none">
                    {member.bio}
                 </p>
               </div>

               <div className="pt-5 border-t border-slate-200 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                     <BookOpen size={14} className="text-slate-400" />
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.experience} Clinical Work</span>
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Pagination Dots */}
      {facultyList.length > 0 && (
        <div className="flex lg:hidden justify-center items-center gap-2 mt-2 mb-8">
          {facultyList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (scrollRef.current && scrollRef.current.children[idx]) {
                  scrollRef.current.children[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  setActiveIndex(idx);
                }
              }}
              className={`transition-all duration-300 rounded-full h-2.5 ${
                activeIndex === idx 
                  ? "w-8 bg-primary" 
                  : "w-2.5 bg-slate-200 hover:bg-slate-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Join CTA */}
      <div className="max-w-5xl mx-auto px-6 mt-20">
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary rounded-[60px] p-16 text-center relative overflow-hidden shadow-2xl shadow-primary/30 group"
         >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)] animate-pulse" />
            <div className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">Contribute to the Academy?</h2>
               <p className="text-white/80 mb-12 text-xl max-w-2xl mx-auto leading-relaxed">
                  Join our elite circles of clinical educators. We welcome specialists 
                  dedicated to evidence-based healthcare.
               </p>
               <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-primary px-16 py-5 rounded-[24px] font-bold text-xl hover:bg-slate-50 transition-all shadow-2xl shadow-black/10"
               >
                  Submit Faculty Application
               </button>
            </div>
         </motion.div>
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Educator Application</h3>
                  <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Join Physiocity's Academic Board</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar" data-lenis-prevent>
                <form id="facultyForm" onSubmit={submitApplication} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Dr. XYZ" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 ring-primary/20 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Primary Role</label>
                      <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Senior Clinical Expert" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 ring-primary/20 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="dr.xyz@example.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 ring-primary/20 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mobile Number</label>
                      <input required type="text" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} placeholder="+91 9876543210" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 ring-primary/20 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Organization</label>
                      <input required type="text" value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} placeholder="e.g. Apollo Hospitals" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 ring-primary/20 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Speciality</label>
                      <input required type="text" value={formData.speciality} onChange={e => setFormData({...formData, speciality: e.target.value})} placeholder="e.g. Neuroplasticity" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 ring-primary/20 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Years of Experience</label>
                      <input required type="text" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="e.g. 15+ Years" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 ring-primary/20 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Degrees (Comma Separated)</label>
                      <input required type="text" value={formData.degrees} onChange={e => setFormData({...formData, degrees: e.target.value})} placeholder="e.g. BPT, MPT (Neuro)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 ring-primary/20 outline-none font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Professional Bio</label>
                    <textarea required value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Highlight your academic and clinical achievements..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 ring-primary/20 outline-none font-medium min-h-[120px]" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Professional Photograph *</label>
                      <div className="border border-dashed border-slate-200 bg-slate-50 rounded-2xl p-6 text-center h-full flex flex-col justify-center">
                        <input type="file" id="facultyImageUpload" accept="image/*" className="hidden" onChange={e => setFacultyImage(e.target.files[0])} />
                        <label htmlFor="facultyImageUpload" className="cursor-pointer inline-flex flex-col items-center">
                          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Upload size={20} />
                          </div>
                          <span className="font-bold text-slate-700 text-sm max-w-[200px] truncate">{facultyImage ? facultyImage.name : "Select a portrait image"}</span>
                          <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Curriculum Vitae (CV) <span className="text-[10px] text-slate-400 font-normal lowercase tracking-normal">(Optional)</span></label>
                      <div className="border border-dashed border-slate-200 bg-slate-50 rounded-2xl p-6 text-center h-full flex flex-col justify-center">
                        <input type="file" id="facultyCVUpload" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setFacultyCV(e.target.files[0])} />
                        <label htmlFor="facultyCVUpload" className="cursor-pointer inline-flex flex-col items-center">
                          <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-full flex items-center justify-center mb-3">
                            <BookOpen size={20} />
                          </div>
                          <span className="font-bold text-slate-700 text-sm max-w-[200px] truncate">{facultyCV ? facultyCV.name : "Select your CV document"}</span>
                          <span className="text-xs text-slate-400 mt-1">PDF, DOCX up to 10MB</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                <button 
                  form="facultyForm" 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:hover:bg-primary flex items-center justify-center"
                >
                  {isSubmitting ? <><Loader2 className="animate-spin mr-2" size={18} /> Submitting Application...</> : "Submit Application for Review"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacultyPage;
