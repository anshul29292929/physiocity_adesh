import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, User, LogOut } from "lucide-react";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { userData, logout, isAdmin, navigate } = useContext(AppContext);
  const location = useLocation();

  const navLinks = [
    { name: "hOmE", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "Quiz", href: "/quiz" },
    { name: "Events", href: "/events" },
    { name: "Faculty", href: "/faculty" },
    { name: "Blogs", href: "/blogs" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
       window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const getPortalLink = () => {
    if (!userData) return "/login";
    return isAdmin ? "/admin" : "/dashboard";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-4 bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border-b border-slate-100"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group flex-shrink-0">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-slate-100 transform group-hover:rotate-6 transition-transform">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-heading font-bold text-slate-900 tracking-tight flex items-baseline leading-none">
            Physio<span className="text-primary font-bold">city</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center justify-end flex-1 gap-8 lg:gap-10 px-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`group relative text-[11px] uppercase tracking-[0.2em] font-bold transition-colors ${
                isActive(link.href) ? "text-primary" : "text-slate-500 hover:text-primary"
              }`}
            >
              {link.name}
              <motion.span 
                initial={false}
                animate={{ width: isActive(link.href) ? "100%" : "0%" }}
                className="absolute -bottom-2 left-0 h-0.5 bg-primary rounded-full transition-all group-hover:w-full" 
              />
            </Link>
          ))}
          
          <div className="flex items-center gap-4">
             <Link id="nav-portal-btn" to={getPortalLink()} className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest bg-slate-50 hover:bg-slate-100 px-8 py-3.5 rounded-2xl border border-slate-100 transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm">
               {userData ? (
                 <span className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                       <User size={12} className="text-primary" />
                    </div>
                    {userData.role === 'admin' ? 'Admin Hub' : 'Student Dashboard'}
                 </span>
               ) : "Login"}
               <ChevronRight size={14} className="text-primary" />
             </Link>

             {userData && (
                <button onClick={logout} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all" title="Logout">
                   <LogOut size={16} />
                </button>
             )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-slate-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-xl font-bold transition-colors ${
                    isActive(link.href) ? "text-primary" : "text-slate-900"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-4">
                 <Link
                   to={getPortalLink()}
                   className="btn-primary text-center py-5 uppercase text-xs tracking-widest"
                   onClick={() => setIsOpen(false)}
                 >
                   {userData ? (userData.role === 'admin' ? 'Admin Hub' : 'Student Dashboard') : 'Login'}
                 </Link>
                 {userData && (
                    <button onClick={logout} className="py-5 bg-red-50 text-red-500 rounded-[20px] font-bold text-xs uppercase tracking-[0.2em]">
                       Logout
                    </button>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
