import React from "react";
import { Quote, Star, Sparkles, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Dr. Rahul Verma",
    role: "BPT Student",
    text: "The clinical workshops at Physiocity are a game-changer. The depth of manual therapy techniques taught is unmatched.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Dr. Ishani Gupta",
    role: "Junior Resident",
    text: "I was struggling with neuro-rehab protocols until I joined the masterclass. The practical approach makes complex topics easy.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Dr. Sameer Khan",
    role: "Physiotherapy Intern",
    text: "The community at Physiocity is amazing. The clinical resources helped me ace my clinical assessments. Highly grateful!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Dr. Priya Das",
    role: "Clinical Specialist",
    text: "Finally an academy that focuses on 'why' not just 'what'. The mentoring is top-notch and evidence-based.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Dr. Amit Mishra",
    role: "Head Physio",
    text: "Their courses gave me the confidence to handle complex sports injuries. Highly recommended for professionals.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Dr. Kavita Singh",
    role: "Academic Lead",
    text: "The pedagogical approach is refreshing. It bridges the gap between textbooks and real-world clinical practice.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
  }
];

const TestimonialCard = ({ item }) => (
  <div className="flex flex-col w-[350px] md:w-[450px] bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 group shrink-0 mx-3">
    <div className="flex justify-between items-start mb-6">
       <div className="flex gap-1">
          {[...Array(item.rating)].map((_, i) => (
            <Star key={i} size={14} className="fill-primary text-primary" />
          ))}
       </div>
       <Quote className="w-8 h-8 text-slate-100 group-hover:text-primary/10 transition-colors" />
    </div>

    <p className="text-slate-600 font-medium text-lg leading-relaxed mb-8 grow">
      "{item.text}"
    </p>

    <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
      <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm">
        <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div>
        <h4 className="font-black text-slate-900 text-sm tracking-tight">{item.name}</h4>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{item.role}</p>
      </div>
    </div>
  </div>
);

const MarqueeRow = ({ items, reverse = false }) => (
  <div className="flex overflow-hidden py-10 select-none">
    <motion.div 
      animate={{ x: reverse ? ["-100%", "0%"] : ["0%", "-100%"] }}
      transition={{ 
        duration: 40, 
        repeat: Infinity, 
        ease: "linear" 
      }}
      className="flex flex-nowrap shrink-0 items-center"
    >
      {[...items, ...items].map((item, index) => (
        <TestimonialCard key={index} item={item} />
      ))}
    </motion.div>
  </div>
);

const Testimonials = () => {
  return (
    <section className="py-32 bg-[#F8FAFC] relative overflow-hidden grainy-texture">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center mb-12">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-primary font-bold text-xs uppercase tracking-widest mb-6"
        >
          <UserCheck className="w-4 h-4" />
          Testimonials
        </motion.div>
        
        <motion.h2 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight"
        >
          What Our <span className="font-serif italic text-primary">Alumni</span> Say
        </motion.h2>

        <motion.p 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.1 }}
           className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium"
        >
          Join thousands of successful professionals who have transformed 
          their clinical practice with Physiocity.
        </motion.p>
      </div>

      <div className="relative">
        {/* Masking gradients for smooth fade on edges */}
        <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-slate-50 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-slate-50 to-transparent z-20 pointer-events-none" />
        
        <MarqueeRow items={testimonials} />
      </div>

      <div className="mt-12 text-center relative z-10">
         <button className="bg-slate-900 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-200">
            Read More Success Stories
         </button>
      </div>

      {/* Background shapes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px]" />
      </div>
    </section>
  );
};

export default Testimonials;
