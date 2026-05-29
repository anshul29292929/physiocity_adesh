import React, { useState, useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, GraduationCap, CheckCircle } from "lucide-react";
import { AppContext } from "../context/AppContext";

const StudentLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirect || '/';
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { googleAuthLogin } = useContext(AppContext);

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      await googleAuthLogin(credentialResponse.credential, redirectTo);
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError("Authentication failed. Check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError("Google Login failed. Check your Console (F12) for 'Origin' errors.");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -ml-40 -mb-40" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white border border-slate-100 p-12 lg:p-16 rounded-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] relative z-10 text-center"
      >
        <div className="mb-12">
          <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner group overflow-hidden">
             <div className="w-full h-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                <GraduationCap className="text-primary w-12 h-12" />
             </div>
          </div>
          <span className="bg-primary/5 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] border border-primary/10 mb-6 inline-block">
             Academy Entrance
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4 tracking-tight">Student <span className="text-primary italic">Portal</span></h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
             Sign in with your institutional email to access your clinical dashboard and share your insights.
          </p>
        </div>

        {error && (
           <div className="mb-10 p-5 bg-red-50 text-red-500 rounded-3xl text-sm font-bold flex items-center gap-3 border border-red-100/50">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
           </div>
        )}

        <div className="flex flex-col gap-6 items-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-8">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
               <p className="text-primary font-bold text-xs uppercase tracking-widest">Verifying Academic Credentials...</p>
            </div>
          ) : (
            <div className="w-full scale-110 md:scale-125 transform-gpu flex justify-center">
              <GoogleLogin
                 onSuccess={handleSuccess}
                 onError={handleError}
                 useOneTap={false}
                 theme="filled_blue"
                 shape="pill"
                 size="large"
                 text="continue_with"
                 width="320px"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 text-slate-400 mt-6">
             <CheckCircle size={14} className="text-primary" />
             <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Secure Academic Authentication</span>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-slate-50">
           <Link 
              to="/"
              className="text-slate-400 hover:text-primary transition-all flex items-center gap-2 mx-auto w-fit text-sm font-bold uppercase tracking-widest group"
           >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
           </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLogin;
