import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Heart, Send, User, Mail, Phone, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

const VolunteerPage = () => {
    const { backendUrl } = useContext(AppContext);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
         window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreed) {
            return toast.warn("Please agree to our community standards before submitting.");
        }
        setIsSubmitting(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/volunteer/submit`, formData);
            if (data.success) {
                toast.success(data.message);
                setFormData({ name: '', email: '', phone: '', message: '' });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit application.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-outfit relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Column: Hero Text */}
                    <div className="flex flex-col gap-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 border border-blue-200 rounded-full w-max backdrop-blur-sm">
                            <Heart size={16} className="text-blue-600 fill-blue-600" />
                            <span className="text-sm font-bold text-blue-800 tracking-wide uppercase">Join Our Mission</span>
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                            Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Volunteer</span> today.
                        </h1>
                        
                        <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-lg">
                            At Physiocity, we are driven by community and passion. Join our team of volunteers and help us shape the future of physiotherapy education. Make a real impact.
                        </p>

                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex items-start gap-4 p-4 bg-white/60 border border-slate-200/60 rounded-2xl backdrop-blur-md shadow-sm">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Premium Experience</h3>
                                    <p className="text-slate-500 text-sm mt-1">Gain firsthand experience in a rapidly growing educational community.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-white/60 border border-slate-200/60 rounded-2xl backdrop-blur-md shadow-sm">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <User className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Networking & Growth</h3>
                                    <p className="text-slate-500 text-sm mt-1">Connect with industry professionals, educators, and thousands of students.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="w-full max-w-lg mx-auto lg:ml-auto">
                        <div className="bg-white/80 backdrop-blur-xl border border-white p-8 sm:p-10 rounded-3xl shadow-2xl shadow-slate-200/50">
                            <div className="mb-8 text-center">
                                <h2 className="text-3xl font-bold text-slate-800">Apply Now</h2>
                                <p className="text-slate-500 mt-2">Fill out your details and we'll be in touch.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input 
                                            type="text" 
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                {/* Email & Phone Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <input 
                                                type="email" 
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Phone size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <input 
                                                type="tel" 
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium"
                                                placeholder="+91 9876543210"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Why do you want to volunteer?</label>
                                    <div className="relative group">
                                        <div className="absolute top-4 left-0 pl-4 flex pointer-events-none">
                                            <MessageSquare size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <textarea 
                                            name="message"
                                            required
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 font-medium resize-none"
                                            placeholder="Tell us about yourself and why you're a great fit..."
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Terms & Conditions - Humanized */}
                                <div className="p-5 bg-slate-50/80 border border-slate-200/50 rounded-2xl">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3">Our Volunteer Promise</h4>
                                    <ul className="space-y-2.5 text-xs text-slate-500 font-medium leading-relaxed">
                                        <li className="flex gap-2">
                                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                            <span><strong>Be Kind:</strong> We're a community of healers; treat everyone with genuine respect.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                            <span><strong>Privacy First:</strong> Please keep our students' data and internal records safe and private.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                            <span><strong>Show Up:</strong> If you commit to a project, our team really relies on you.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                            <span><strong>Your Data:</strong> We only use your info to stay in touch about volunteering. No spam.</span>
                                        </li>
                                    </ul>

                                    <div className="mt-5 flex items-start gap-3 cursor-pointer group" onClick={() => setAgreed(!agreed)}>
                                        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${agreed ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                                            {agreed && <ArrowRight size={14} className="text-white rotate-[-45deg]" />}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 leading-tight select-none">
                                            I've read the promise and I'm ready to contribute to Physiocity's mission.
                                        </span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={`w-full mt-2 py-4 px-6 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 disabled:cursor-not-allowed group ${agreed ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Submitting Application...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Submit Application</span>
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                
                                <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                                    By submitting, you agree to being contacted by our team.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerPage;
