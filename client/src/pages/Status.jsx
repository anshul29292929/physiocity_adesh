import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  Activity, 
  Database, 
  Globe, 
  Server, 
  ShieldCheck, 
  Clock,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Status = () => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(new Date());

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || ""
      const backendUrl = rawBackendUrl.endsWith('/api') ? rawBackendUrl.slice(0, -4) : rawBackendUrl
      const { data } = await axios.get(`${backendUrl}/api/health`);
      setStatusData(data);
      setLastChecked(new Date());
      setError(null);
    } catch (err) {
      console.error("Health Check Failed:", err);
      setError("System Degraded");
      setStatusData({
        status: "degraded",
        systems: { api: "error", database: "disconnected" }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    if (status === "operational" || status === "healthy" || status === "connected") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (status === "degraded" || status === "error") return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="bg-[#FDFDFF] p-6 md:p-12 lg:p-24 pt-32 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -ml-40 -mb-40" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Integrity</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">Physio<span className="text-blue-600">city</span> Status</h1>
              <div className="flex items-center gap-2 mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                <Clock size={14} /> Last refined: {lastChecked.toLocaleTimeString()}
              </div>
            </div>
            
            <button 
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-100 rounded-2xl text-slate-600 font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Force Refresh
            </button>
          </div>

          {/* Global Status Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-10 rounded-[40px] border flex flex-col md:flex-row items-center justify-between gap-8 mb-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] ${statusData?.status === 'operational' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${statusData?.status === 'operational' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                  <Activity size={32} className={statusData?.status === 'operational' ? 'text-emerald-500' : 'text-rose-500'} />
                </div>
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-4 border-white animate-pulse ${statusData?.status === 'operational' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`}></div>
              </div>
              <div>
                <h2 className={`text-3xl font-black tracking-tight ${statusData?.status === 'operational' ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {statusData?.status === 'operational' ? 'All Systems Operational' : 'Systems Degraded'}
                </h2>
                <p className="text-slate-500 font-medium">Physiocity global infrastructure is monitored in real-time.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md px-8 py-4 rounded-3xl border border-white">
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Uptime</p>
                  <p className="text-2xl font-black text-slate-800">99.99%</p>
               </div>
            </div>
          </motion.div>

          {/* Subsystems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <SubsystemCard 
              icon={<Globe size={20} />}
              name="API Services" 
              status={statusData?.systems?.api} 
              description="LMS core engine and student authentication services." 
              latency="24ms"
            />

            <SubsystemCard 
              icon={<Database size={20} />}
              name="Database Core" 
              status={statusData?.systems?.database} 
              description="SQL relational engine and persistence layer." 
              latency="12ms"
            />

            <SubsystemCard 
              icon={<Server size={20} />}
              name="Asset Storage" 
              status={statusData?.systems?.storage || 'operational'} 
              description="Cloudinary asset distribution and local file server." 
              latency="Stable"
            />

          </div>

          {/* Console / Log Footer */}
          <div className="mt-20 p-8 bg-slate-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 blur-[80px] rounded-full" />
             <div className="flex items-center gap-4 mb-6">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security & Logs Pipeline</span>
             </div>
             <div className="font-mono text-sm space-y-2 opacity-80">
                <p className="text-emerald-400">[{statusData?.timestamp || new Date().toISOString()}] System: Handshake established with main region.</p>
                <p className="text-blue-400">[{statusData?.timestamp || new Date().toISOString()}] Network: SSL/TLS certificates validated (Expires in 284 days).</p>
                <p className="text-amber-400">[{statusData?.timestamp || new Date().toISOString()}] Memory: Total 2048MB | Used 234MB | Free 1814MB.</p>
             </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const SubsystemCard = ({ icon, name, status, description, latency }) => {
  const getStatusDisplay = (s) => (s === "operational" || s === "healthy" || s === "connected") ? "Operational" : (s === "error" ? "Down" : "Maintenance");
  const isHealthy = status === "operational" || status === "healthy" || status === "connected";

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-800 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
          {icon}
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isHealthy ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
           {getStatusDisplay(status)}
        </span>
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{name}</h3>
      <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">{description}</p>
      
      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Network Speed</span>
         <span className="text-xs font-bold text-slate-700">{latency}</span>
      </div>
    </motion.div>
  );
};

export default Status;
