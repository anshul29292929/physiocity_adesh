import React from 'react';
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Heart
} from "lucide-react";
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-36 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Logo & Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100 transform group-hover:rotate-6 transition-transform">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-heading font-bold text-slate-900 tracking-tight">
              Physio<span className="text-blue-600">city</span>
            </span>
          </Link>
          <div className="hidden md:block h-6 w-px bg-slate-200"></div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Copyright 2026 © Physiocity Academy. Worldwide Excellence.
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <Linkedin size={18} />
          </a>
          <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <Instagram size={18} />
          </a>
          <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <Twitter size={18} />
          </a>
        </div>

        {/* Made with context */}
        <p className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest md:hidden lg:flex">
          Built with <Heart size={14} className="text-blue-600 fill-blue-600" /> for the Medical Community
        </p>
      </div>
    </footer>
  );
};

export default Footer;