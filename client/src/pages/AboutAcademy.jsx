import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Instagram, GraduationCap, Award, Globe } from 'lucide-react';

const AboutAcademy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-primary font-bold text-xs uppercase tracking-widest mb-6">
             <GraduationCap className="w-4 h-4" />
             The Academy
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
            Elevating <span className="font-serif italic text-primary">Physiotherapy</span> Standards
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            Physiocity Academy is India’s premier destination for clinical excellence and professional growth in physical therapy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
            <p>
              Founded with the vision to bridge the gap between academic learning and clinical mastery, Physiocity Academy has evolved into a global community of skilled clinicians.
            </p>
            <p>
              We believe that every patient deserves evidence-based care delivered with precision. Our academy provides the tools, mentorship, and certifications necessary to achieve that standard.
            </p>
          </div>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
             <h3 className="text-slate-900 font-bold mb-4 uppercase tracking-widest text-sm">Follow Our Journey</h3>
             <p className="text-sm text-slate-500 mb-6 font-medium">Get daily clinical insights and academy updates on our official Instagram.</p>
             <a 
               href="https://www.instagram.com/physiocity/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 bg-gradient-to-tr from-primary to-teal-400 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all"
             >
               <Instagram size={18} /> @physiocity
             </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
           <div className="p-6">
              <Award className="text-primary mb-4" size={32} />
              <h4 className="font-bold text-slate-900 mb-2">Clinical Excellence</h4>
              <p className="text-sm text-slate-500 font-medium">Bespoke curriculum designed by industry-leading clinicians.</p>
           </div>
           <div className="p-6">
              <Globe className="text-primary mb-4" size={32} />
              <h4 className="font-bold text-slate-900 mb-2">Global Impact</h4>
              <p className="text-sm text-slate-500 font-medium">Alumni practicing across 12 countries worldwide.</p>
           </div>
           <div className="p-6">
              <GraduationCap className="text-primary mb-4" size={32} />
              <h4 className="font-bold text-slate-900 mb-2">Modern Pedagogy</h4>
              <p className="text-sm text-slate-500 font-medium">Hybrid learning models combining theory and practice.</p>
           </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutAcademy;
