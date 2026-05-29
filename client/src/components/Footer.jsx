import React from "react";
import { Link } from "react-router-dom";
import { 
  Rocket, 
  Facebook,
  Instagram, 
  Linkedin, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Heart,
  ShieldCheck
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white pt-24 pb-12 text-slate-600 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-100 transform group-hover:rotate-6 transition-transform">
               <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
              Physio<span className="text-primary">city</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed mb-8 font-medium">
            India's most premium physiotherapy academy, dedicated to empowering 
            professionals through clinical excellence and innovative education.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm">
              <Linkedin size={18} />
            </a>
            <a href="https://www.instagram.com/physiocity/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm">
              <Instagram size={18} />
            </a>
            <a href="https://www.facebook.com/Physiocity1" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm">
              <Facebook size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm">
              <Twitter size={18} />
            </a>
          </div>
        </div>

        <div>
           <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-8">Explore</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/courses" className="hover:text-primary transition-colors">Elite Courses</Link></li>
              <li><Link to="/faculty" className="hover:text-primary transition-colors">Our Faculty</Link></li>
              <li><Link to="/blogs" className="hover:text-primary transition-colors">Medical Blogs</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Live Events</Link></li>
            </ul>
        </div>

        <div>
           <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-8">Academy</h4>
            <ul className="space-y-4 text-sm font-bold">
               <li><Link to="/admin" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <ShieldCheck size={16} /> Admin Portal
               </Link></li>
                <li><Link to="/about-academy" className="hover:text-primary transition-colors">About Academy</Link></li>
                <li><Link to="/volunteer" className="hover:text-primary transition-colors">Join as Volunteer</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
               <li><Link to="/support" className="hover:text-primary transition-colors">Support Hub</Link></li>
            </ul>
        </div>

        <div>
           <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-8">Newsletter</h4>
           <p className="text-xs mb-6 font-medium">Join 5000+ clinicians receiving weekly medical insights.</p>
           <form className="space-y-4">
              <div className="relative group">
                 <input 
                   type="email" 
                   placeholder="Email Address" 
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary transition-all pr-12 shadow-inner"
                 />
                 <button className="absolute right-2 top-2 p-2 rounded-xl bg-primary text-white hover:bg-primary/80 transition-all">
                    <ArrowRight size={18} />
                 </button>
              </div>
           </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
         <p>© 2026 Physiocity Academy. Worldwide Excellence.</p>
         <p className="flex items-center gap-2">
           Built with <Heart size={14} className="text-primary fill-primary" /> for the Medical Community
         </p>
      </div>
    </footer>
  );
};

export default Footer;
