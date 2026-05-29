import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, Video, Lock, CheckCircle, Search, Filter, ArrowRight, Star } from "lucide-react";
import { cn } from "../lib/utils";

const resources = {
  free: [
    { title: "Manual Therapy Guide PDF", type: "PDF", size: "2.4 MB", instructor: "Dr. Aryan Sharma" },
    { title: "Anatomy Lecture Notes", type: "PDF", size: "1.8 MB", instructor: "Dr. Sneha Kapoor" },
    { title: "Sports Rehab Routine", type: "Video", size: "15 min", instructor: "Dr. Vikram Mehra" },
    { title: "Physiocity Journal Vol. 1", type: "PDF", size: "5.2 MB", instructor: "Academy Team" },
    { title: "Introduction to Cryotherapy", type: "Video", size: "10 min", instructor: "Dr. Aryan Sharma" },
  ],
  paid: [
    { title: "Orthopedics Masterclass", price: "₹2,499", type: "Premium", rating: 4.9, students: "1.2k" },
    { title: "Dry Needling Cert Course", price: "₹5,999", type: "Certification", rating: 4.8, students: "800+" },
    { title: "Neuro-Rehab Advanced Protocol", price: "₹1,999", type: "Premium", rating: 5.0, students: "500+" },
    { title: "Full Library Annual Pass", price: "₹12,999", type: "Full Access", rating: 4.7, students: "2.5k" },
    { title: "Pediatric Rehabilitation", price: "₹2,999", type: "Premium", rating: 4.9, students: "300+" },
  ],
};

const ResourceCard = ({ item, isPaid }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all group flex flex-col"
  >
    <div className={cn(
      "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-colors shadow-sm",
      isPaid ? "bg-primary/10 text-primary group-hover:bg-primary/20" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
    )}>
      {isPaid ? <Lock size={28} /> : (item.type === "Video" ? <Video size={28} /> : <FileText size={28} />)}
    </div>

    <div className="mb-8 flex-1">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{item.type}</span>
        {isPaid && (
          <div className="flex items-center gap-1 text-accent">
            <Star size={12} fill="currentColor" />
            <span className="text-[10px] font-bold">{item.rating}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-heading font-bold text-slate-900 mb-3 leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
      <p className="text-slate-500 text-sm font-medium">
        {isPaid ? `${item.students} Students Enrolled` : `By ${item.instructor} • ${item.size}`}
      </p>
    </div>

    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
      {isPaid ? (
        <>
          <span className="text-2xl font-bold text-slate-900">{item.price}</span>
          <button className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-primary transition-all shadow-xl shadow-slate-100 group-hover:shadow-primary/20">
            <ArrowRight size={20} />
          </button>
        </>
      ) : (
        <>
          <span className="text-xs font-bold text-primary tracking-widest uppercase">Available Now</span>
          <button className="flex items-center gap-2 text-slate-900 font-bold text-sm hover:text-primary transition-colors">
            Download <Download size={18} />
          </button>
        </>
      )}
    </div>
  </motion.div>
);

const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState("free");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="max-w-2xl">
            <span className="bg-primary/5 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/10 mb-6 inline-block">
               Clinical Resource Library
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-slate-900 mb-6 tracking-tight">
               Elevate your <br />
               <span className="text-primary italic">Clinical Skills</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium">
               From foundational guides to advanced certification programs. 
               The only repository you'll ever need.
            </p>
          </div>

          <div className="flex p-1.5 bg-slate-50 rounded-[24px] border border-slate-100 shadow-inner min-w-[320px]">
            <button 
              onClick={() => setActiveTab("free")}
              className={cn(
                "flex-1 py-4 px-6 rounded-[18px] text-sm font-bold transition-all relative overflow-hidden",
                activeTab === "free" ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Free Resources
            </button>
            <button 
              onClick={() => setActiveTab("paid")}
              className={cn(
                "flex-1 py-4 px-6 rounded-[18px] text-sm font-bold transition-all relative overflow-hidden border border-transparent",
                activeTab === "paid" ? "bg-primary text-white shadow-xl shadow-primary/30" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Elite Courses
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="wait">
          {resources[activeTab].map((item) => (
            <ResourceCard key={item.title} item={item} isPaid={activeTab === "paid"} />
          ))}
        </AnimatePresence>
      </div>

      {/* Trust Banner */}
      <div className="max-w-7xl mx-auto px-6 mt-32">
         <div className="bg-slate-50 rounded-[40px] p-12 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="text-center md:text-left relative z-10">
               <h3 className="text-3xl font-heading font-bold text-slate-900 mb-4">Trusted by 10,000+ Students</h3>
               <p className="text-slate-500 font-medium">Join our global community of clinical excellence today.</p>
            </div>
            <div className="flex items-center gap-12 relative z-10">
               <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">4.9/5</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Avg Rating</p>
               </div>
               <div className="w-[1px] h-12 bg-slate-200" />
               <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">98%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Completion Rate</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CoursesPage;
