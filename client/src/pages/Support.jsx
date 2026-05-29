import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Send, HelpCircle } from 'lucide-react';

const Support = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-primary font-bold text-xs uppercase tracking-widest mb-6">
             <HelpCircle className="w-4 h-4" />
             Support Hub
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
            How can we <span className="font-serif italic text-primary">help?</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
            Our clinical and technical support team is here to ensure your learning experience is seamless.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-slate-100 border border-slate-50">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none">
                    <option>Course Access Issue</option>
                    <option>Certificate Query</option>
                    <option>Payment/Billing</option>
                    <option>General Feedback</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
                  <textarea 
                    rows="5" 
                    placeholder="Describe your issue in detail..." 
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                  ></textarea>
                </div>
                <button className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl hover:bg-primary transition-all shadow-lg flex items-center justify-center gap-2">
                  <Send size={16} /> Send Message
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <Mail className="text-primary mb-4" />
              <h4 className="font-bold text-slate-900 mb-1">Email Us</h4>
              <p className="text-sm text-slate-500 font-medium mb-4">Direct clinical & tech support.</p>
              <a href="mailto:support@physiocity.com" className="text-primary text-sm font-black hover:underline">support@physiocity.com</a>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <MessageCircle className="text-primary mb-4" />
              <h4 className="font-bold text-slate-900 mb-1">Live Chat</h4>
              <p className="text-sm text-slate-500 font-medium mb-4">Available Mon-Fri, 9am - 6pm.</p>
              <button className="text-primary text-sm font-black hover:underline">Start Chat Now</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Support;
