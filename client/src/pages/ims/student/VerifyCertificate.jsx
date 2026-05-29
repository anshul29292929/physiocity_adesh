import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, Calendar, Mail, User, ShieldCheck } from 'lucide-react';
import { AppContext } from '../../../context/AppContext';

const VerifyCertificate = () => {
    const { id } = useParams();
    const { backendUrl } = useContext(AppContext);
    const [certData, setCertData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCert = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/admin/verify-certificate/${id}`);
                if (data.success) {
                    setCertData(data.certificate);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError('Failed to fetch certificate details');
            } finally {
                setLoading(false);
            }
        };
        fetchCert();
    }, [id, backendUrl]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                <p className="text-slate-500 font-medium animate-pulse">Verifying Credentials...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 font-sans">
            <div className="bg-white p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-xl w-full text-center border border-red-100">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="text-red-500" size={48} />
                </div>
                <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Authenticity Warning</h1>
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-8">
                    <p className="text-red-700 font-bold text-lg mb-1">UNVERIFIED DOCUMENT</p>
                    <p className="text-red-600/80 text-sm">This certificate ID does not exist in our secure registry.</p>
                </div>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    This document was <strong>not issued</strong> by Physiocity Academy. If you believe this is an error or if you wish to report a fraudulent certificate, please contact our support team immediately.
                </p>
                <div className="flex flex-col gap-3">
                    <a href="/" className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg">
                        Back to Official Site
                    </a>
                    <button className="text-red-500 font-bold py-2 text-sm hover:underline">
                        Report Fraudulent Document
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] py-20 px-4 font-sans selection:bg-blue-100">
            <div className="max-w-5xl mx-auto">
                {/* Header Branding */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-3">
                        <img src="/logo.jpg" alt="Logo" className="h-12 w-auto rounded-lg shadow-sm" />
                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
                        <span className="text-xl font-black text-slate-800 tracking-tighter hidden sm:block">PHYSIOCITY <span className="text-blue-600">ACADEMY </span>VERIFICATION</span>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden border border-white relative">
                    {/* Status Banner */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck size={200} />
                        </div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-white/30">
                                    <CheckCircle size={14} /> Official E-Certificate
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Verified Authentic</h1>
                                <p className="text-emerald-50 text-lg font-medium opacity-90">Issued on {new Date(certData.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] flex items-center gap-5">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-emerald-600" size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/60 leading-none mb-1">Security Seal</p>
                                    <p className="text-2xl font-black text-white leading-tight">ACTIVE</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-16">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
                            {/* Left: Certificate Image */}
                            <div className="lg:col-span-3 space-y-8">
                                <div className="group relative rounded-[32px] overflow-hidden shadow-2xl border-8 border-slate-50 transition-transform duration-500 hover:scale-[1.02]">
                                    <img src={certData.imageUrl} alt="Verified Certificate" className="w-full h-auto" />
                                    <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                
                                <div className="flex flex-wrap items-center justify-center gap-4">
                                    <a 
                                        href={certData.imageUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                    >
                                        Download Resolution
                                    </a>
                                </div>
                            </div>

                            {/* Right: Verification Details */}
                            <div className="lg:col-span-2 space-y-12">
                                <section>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Recipient Data</h3>
                                    
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-6 group">
                                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                                <p className="text-xl font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">{certData.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 group">
                                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                                <Mail size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verified Email</p>
                                                <p className="text-xl font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors break-all">{certData.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 group">
                                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                                                <p className="text-xl font-extrabold text-slate-800 group-hover:text-amber-600 transition-colors">
                                                    {new Date(certData.issueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="pt-8 border-t border-slate-100">
                                    <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                                        <h4 className="flex items-center gap-2 font-black text-slate-800 mb-2">
                                            <ShieldCheck size={18} className="text-blue-600" /> Integrity Statement
                                        </h4>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                            Physiocity Academy warrants that this digital record represents a valid completion of the academy's certification program. Unauthorized use of this record or identity is strictly prohibited.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="text-center sm:text-left">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] mb-2">Immutable ID</p>
                                    <p className="font-mono text-[10px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full inline-block">
                                        {certData.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyCertificate;
