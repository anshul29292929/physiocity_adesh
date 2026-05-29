import React from "react";
import { 
  Download, 
  BookOpen, 
  FileText, 
  Video, 
  ArrowRight,
  Sparkles,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const resources = [
  {
    title: "Clinical Guidelines 2024",
    description: "Comprehensive protocols for evidence-based musculoskeletal rehab.",
    type: "PDF Guide",
    icon: <FileText className="w-8 h-8" />,
    color: "bg-blue-500",
  },
  {
    title: "Neuro-Rehab Techniques",
    description: "Step-by-step video masterclass on advanced neuroplasticity.",
    type: "Video Series",
    icon: <Video className="w-8 h-8" />,
    color: "bg-primary",
  },
  {
    title: "Assessment Templates",
    description: "Standardized clinical assessment forms for your daily practice.",
    type: "Templates",
    icon: <BookOpen className="w-8 h-8" />,
    color: "bg-orange-500",
  },
];

const Resources = () => {
  return (
    <section id="resources" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -ml-64 -mb-64" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-md border border-slate-200 text-primary font-bold text-xs uppercase tracking-widest mb-4">
               <Download className="w-4 h-4" />
               Free Resources
            </div>
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-slate-900 mb-6 tracking-tight">
              Knowledge <span className="text-primary italic">Vault</span>
            </h2>
            <p className="text-slate-500 text-lg font-medium">
              Access our curated library of clinical guides, assessment tools, 
              and evidence-based research updates.
            </p>
          </div>
          <Link
            to="/courses"
            className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm hover:translate-x-2 transition-transform"
          >
            Browse Full Library <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="group relative bg-white p-10 rounded-[48px] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${resource.color} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.08] transition-opacity`} />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl ${resource.color} text-white flex items-center justify-center mb-10 shadow-lg shadow-black/10 transform group-hover:rotate-6 group-hover:scale-110 transition-transform`}>
                  {resource.icon}
                </div>
                
                <span className="text-primary font-bold text-[10px] uppercase tracking-widest block mb-4">
                  {resource.type}
                </span>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium">
                  {resource.description}
                </p>
                
                <button className="flex items-center gap-2 text-slate-900 font-bold text-[10px] uppercase tracking-widest hover:text-primary transition-colors hover:translate-x-1 transition-transform">
                  Download Now <Download className="w-4 h-4 text-primary" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Success Banner */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mt-20 p-10 bg-white rounded-[40px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm"
        >
           <div className="flex items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <Award size={32} />
              </div>
              <div>
                 <h4 className="text-xl font-bold text-slate-900 mb-1">Elite Certification Prep</h4>
                 <p className="text-slate-500 text-sm font-medium">Join 5000+ physios in our specialized exam prep courses.</p>
              </div>
           </div>
           <Link to="/courses" className="btn-primary py-4 px-10 whitespace-nowrap shadow-xl shadow-primary/20">
              Join Elite Track
           </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Resources;
