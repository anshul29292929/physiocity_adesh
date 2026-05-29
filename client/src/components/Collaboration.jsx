import React from "react";
import { 
  Building2, 
  Handshake, 
  Briefcase,
  Users,
  Award,
  Globe,
  Stethoscope,
  HeartPulse,
  Activity,
  ShieldCheck,
  Zap,
  Target
} from "lucide-react";
import { motion } from "framer-motion";

const partnersRow1 = [
  { name: "Global Health Alliance", icon: Building2 },
  { name: "Sports Rehabilitation Unit", icon: Activity },
  { name: "National Physio Council", icon: Award },
  { name: "Elite Athletics Lab", icon: HeartPulse },
  { name: "Clinical Excellence Hub", icon: Stethoscope },
  { name: "Modern Rehab Center", icon: Briefcase },
];

const partnersRow2 = [
  { name: "International Physio Lab", icon: Globe },
  { name: "SafeCare Network", icon: ShieldCheck },
  { name: "Tech Physio Systems", icon: Zap },
  { name: "Precision Recovery", icon: Target },
  { name: "Future Health Academics", icon: Users },
  { name: "Wellness Partners", icon: Handshake },
];

const LogoMarquee = ({ partners, reverse = false }) => {
  return (
    <div className="flex overflow-hidden py-4 select-none">
      <motion.div 
        animate={{ x: reverse ? ["-100%", "0%"] : ["0%", "-100%"] }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex flex-nowrap shrink-0 items-center gap-6 px-4"
      >
        {/* Render twice for seamless loop */}
        {[...partners, ...partners].map((partner, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 px-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer min-w-[260px]"
          >
            <div className="text-slate-400 group-hover:text-primary transition-colors duration-300">
              <partner.icon size={24} strokeWidth={1.5} />
            </div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover:text-slate-900 transition-colors duration-300 whitespace-nowrap">
              {partner.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const Collaboration = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative z-10 text-center mb-20">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-primary font-bold text-xs uppercase tracking-widest mb-6"
          >
            <Handshake className="w-4 h-4" />
            Strategic Network
          </motion.div>
          
          <motion.h2 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight"
          >
            Our Strategic Collaborations
          </motion.h2>

          <motion.p 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium"
          >
            Partnering with world-class healthcare providers to deliver 
            unmatched clinical education.
          </motion.p>
        </div>

        {/* Logo Clouds Marquee */}
        <div className="relative">
           {/* Masking gradients for smooth fade on edges (Light Mode) */}
           <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
           <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />
           
           <div className="space-y-6">
              <LogoMarquee partners={partnersRow1} />
              <LogoMarquee partners={partnersRow2} reverse={true} />
           </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
           <button className="bg-slate-900 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-200">
              Become a Partner
           </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Collaboration;
