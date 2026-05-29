import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { Play, Star, CheckCircle2, Users, BookOpen, Video, ArrowRight } from "lucide-react";
import gsap from "gsap";

const Hero = ({ startAnimation = true }) => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    if (!startAnimation) return;
    const ctx = gsap.context(() => {
      // Entrance staggered animation
      gsap.from(".hero-text-item", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });

      gsap.from(".hero-visual-item", {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        delay: 0.4,
        ease: "back.out(1.7)",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const floatingTransition = (duration = 3, delay = 0) => ({
    y: {
      duration,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
      delay,
    },
  });

  return (
    <section 
      ref={heroRef} 
      className="relative min-h-screen bg-[#FDFDFF] overflow-hidden pt-28 pb-12"
    >
      {/* Background Soft Blobs */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-left">
            <h1 className="hero-text-item text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter">
              {"Master Skills That Move You Forward.".split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-[0.2em] whitespace-nowrap">
                  {word.split("").map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      initial={{ opacity: 0 }}
                      animate={startAnimation ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ 
                        duration: 0.1, 
                        delay: (wordIndex * 0.2) + (charIndex * 0.05) + 0.1, 
                        ease: "linear" 
                      }}
                      className={word === "Skills" ? "font-serif italic text-primary underline decoration-primary/20 decoration-8 underline-offset-[10px]" : ""}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>

            <p className="hero-text-item text-xl text-slate-500 mb-10 max-w-xl leading-relaxed font-medium">
              The all-in-one learning ecosystem for modern physiotherapists. 
              Masterclasses and clinical tools designed for busy experts who want 
              to lead the future of rehabilitation.
            </p>

            <div className="hero-text-item flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
               <button 
                  onClick={() => navigate("/courses")}
                  className="bg-gradient-to-r from-primary to-primary/90 text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
               >
                  Start Your Journey
               </button>
               <div className="text-sm text-slate-400 font-medium italic">
                 Full access. No risk. <br className="hidden sm:block" /> Cancel anytime.
               </div>
            </div>

            <div className="hero-text-item flex items-center gap-3 mb-12">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+30}`} alt="user" />
                     </div>
                  ))}
               </div>
               <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-slate-900 font-black text-sm">
                    Trusted by 10,000+ clinicians worldwide!
                    <div className="flex items-center gap-0.5 text-accent">
                       {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Visual - PhysioTutors Style */}
          <div className="relative">
             <div className="relative w-full max-w-[600px] mx-auto aspect-square flex items-center justify-center">
                
                {/* Background Shapes */}
                <div className="absolute w-[80%] h-[80%] bg-primary/10 rounded-full blur-3xl animate-pulse" />

                {/* Main Figure */}
                <div className="hero-visual-item relative z-10 w-[65%] grayscale-[0.3] hover:grayscale-0 transition-all duration-700">
                    <img 
                      src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800" 
                      alt="Physiotherapist"
                      className="w-full h-full object-contain drop-shadow-2xl rounded-3xl"
                    />
                    {/* NO.1 Badge */}
                    <div className="absolute bottom-4 right-0 bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase shadow-xl transform rotate-3">
                       NO.1 PHYSIO ACADEMY
                    </div>
                </div>

                {/* Orbital UI Card 1: Anniversary */}
                <div 
                  className="hero-visual-item absolute -left-12 top-[15%] z-30 bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 max-w-[180px] group cursor-pointer transform -rotate-6 hover:rotate-0 transition-transform duration-500"
                >
                   <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden">
                      <img 
                        src="/celebration.png" 
                        alt="9 Years of Physiocity" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                         <span className="text-[10px] font-black text-primary uppercase tracking-widest">9 Years of Excellence</span>
                      </div>
                   </div>
                </div>

                {/* Orbital UI Card 2: Faculty */}
                <div 
                  className="hero-visual-item absolute -right-16 top-[45%] z-20 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 max-w-[200px] transform rotate-3 hover:rotate-0 transition-transform duration-500"
                >
                   <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                         <Users className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Faculty</span>
                   </div>
                   <div className="flex -space-x-3 mb-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                           <img src={`https://i.pravatar.cc/100?img=${i+40}`} alt="faculty" />
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white text-[10px] font-bold">+20</div>
                   </div>
                   <p className="text-slate-500 text-[9px] font-medium leading-relaxed">
                     Learn from <span className="text-slate-900 font-bold italic">Top 1%</span> of clinical experts.
                   </p>
                </div>

                {/* Orbital UI Card 3: Webinars */}
                <div 
                  className="hero-visual-item absolute top-4 -right-8 z-20 bg-white p-3 rounded-xl shadow-xl border border-slate-100 max-w-[150px] transform -rotate-3 hover:rotate-0 transition-transform duration-500"
                >
                   <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 rounded-lg bg-red-500 flex items-center justify-center">
                         <Video className="w-3 h-3 text-white" />
                       </div>
                       <span className="text-[10px] font-bold text-slate-900">Live Webinars</span>
                   </div>
                   <div className="w-full h-16 bg-slate-100 rounded-lg overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200" alt="web" className="w-full h-full object-cover" />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-20 border-t border-slate-100 pt-16 h-full flex items-center w-full">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full">
              <StatItem value={10000} label="Trusted Clinicians" suffix="+" />
              <StatItem value={500} label="Online Courses" suffix="+" />
              <StatItem value={50} label="Expert Instructors" suffix="+" />
              <StatItem value={100} label="Live Sessions" suffix="+" />
           </div>
        </div>
      </div>
    </section>
  );
};

const StatItem = ({ value, label, suffix = "" }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  React.useEffect(() => {
    if (isInView) {
      animate(count, value, { duration: 2, ease: "easeOut" });
    }
  }, [isInView, count, value]);

  return (
    <div ref={ref} className="flex flex-col">
       <div className="flex items-center text-4xl font-black text-slate-900 mb-1">
          <motion.span>{rounded}</motion.span>
          <span>{suffix}</span>
       </div>
       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-nowrap">{label}</span>
    </div>
  );
};

export default Hero;
