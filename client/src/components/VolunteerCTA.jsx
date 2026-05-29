import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';

const VolunteerCTA = () => {
  return (
    <section className="bg-slate-900 py-24 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
          <Heart size={16} className="text-blue-400 fill-blue-400" />
          <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Make an Impact</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight max-w-2xl">
          Ready to join our community of volunteers?
        </h2>
        
        <p className="text-lg text-slate-400 mb-10 max-w-xl">
          Help us build the most accessible and comprehensive physiotherapy platform in the world. Gain experience, network, and grow with us.
        </p>
        
        <Link 
          to="/volunteer" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 group shadow-xl shadow-white/10"
        >
          <span>Become a Volunteer</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

export default VolunteerCTA;
