import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Preloader = ({ onComplete }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Circle properties
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6"
    >
      <div className="relative flex flex-col items-center">
        {/* Revolving Circle Container */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-12">
            {/* SVG Progress Circle (Rotated to start from bottom) */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full rotate-90 drop-shadow-md">
                {/* Background Track (Slightly Darker) */}
                <circle 
                  cx="100" cy="100" r={radius} 
                  stroke="#e2e8f0" /* slate-200 */
                  fill="none"
                  strokeWidth="8"
                />
                {/* Animated Progress Stroke (Vibrant Primary) */}
                <motion.circle 
                  cx="100" cy="100" r={radius}
                  stroke="#0ea5a4" /* Physiocity Teal */
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </svg>

            {/* Logo with Pulse & Float */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: 1,
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut",
                opacity: { duration: 1 }
              }}
              className="z-10"
            >
              <img src="/logo.png" alt="Physiocity Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" />
            </motion.div>

            {/* Floating Percentage inside or near circle */}
            <div className="absolute -bottom-4 bg-white px-4 py-1 rounded-full shadow-lg border border-slate-100 z-20">
               <span className="text-primary font-black text-xl tabular-nums">{percent}%</span>
            </div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-900 font-black text-2xl md:text-3xl tracking-tighter mb-2"
            >
              Physio<span className="text-primary italic">city</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]"
            >
              Academy of Rehabilitation Sciences
            </motion.p>
        </div>
      </div>

      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-30">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px]" />
      </div>
    </motion.div>
  );
};

export default Preloader;
