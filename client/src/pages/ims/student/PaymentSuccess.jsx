import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/my-enrollments');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[80%] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-[-10%] w-[40%] h-[60%] bg-cyan-100/20 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/60 backdrop-blur-3xl border border-white shadow-[0_40px_80px_-16px_rgba(0,0,0,0.1)] rounded-[48px] p-12 text-center space-y-8 ring-1 ring-slate-100">
          {/* Animated Check */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <CheckCircle size={48} className="text-primary" />
          </motion.div>

          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-black text-slate-900 tracking-tight"
            >
              Payment Successful!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-400 font-bold text-sm"
            >
              You're now enrolled. Your learning journey begins now.
            </motion.p>
          </div>

          {/* Processing bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Loader2 size={14} className="animate-spin text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Redirecting to your courses in {countdown}s
              </span>
            </div>
          </motion.div>

          {/* Manual redirect button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => navigate('/my-enrollments')}
            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-primary transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3"
          >
            Go to My Courses <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
