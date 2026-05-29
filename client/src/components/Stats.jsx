import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import { Users, GraduationCap, Trophy, Globe, Sparkles } from "lucide-react";

const Counter = ({ value, suffix }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      onUpdate: (value) => setDisplayValue(Math.floor(value)),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-5xl font-heading font-bold text-slate-900 tracking-tighter">
        {displayValue}
      </span>
      <span className="text-3xl font-bold text-primary">{suffix}</span>
    </div>
  );
};

const stats = [
  { 
    label: "Active Students", 
    value: 15000, 
    suffix: "+",
    icon: <Users className="w-8 h-8" />, 
    color: "bg-blue-500" 
  },
  { 
    label: "Success Stories", 
    value: 98, 
    suffix: "%",
    icon: <Trophy className="w-8 h-8" />, 
    color: "bg-primary" 
  },
  { 
    label: "Total Courses", 
    value: 120, 
    suffix: "+",
    icon: <GraduationCap className="w-8 h-8" />, 
    color: "bg-orange-500" 
  },
  { 
    label: "Global Reach", 
    value: 24, 
    suffix: " Countries",
    icon: <Globe className="w-8 h-8" />, 
    color: "bg-secondary" 
  },
];

const Stats = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(14,165,164,0.03),transparent_50%)]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(37,99,235,0.03),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="group relative p-8 rounded-[40px] bg-white border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.08] transition-opacity`} />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl ${stat.color} text-white flex items-center justify-center mb-8 shadow-lg shadow-black/10 transform group-hover:rotate-6 group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                
                <div className="flex flex-col">
                  <Counter value={stat.value} suffix={stat.suffix} />
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">{stat.label}</span>
                </div>
                
                <div className="mt-8 flex items-center gap-2 text-primary font-bold text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-all">
                  <Sparkles size={14} />
                  Top Rated Excellence
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
