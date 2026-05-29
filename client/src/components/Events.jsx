import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Video, Users, Timer, Plus, Sparkles, Clock } from "lucide-react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const { backendUrl } = useContext(AppContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/events/all`);
        if (data.success) {
          // Filter for Live or Upcoming sessions
          const filtered = data.events
            .filter(e => e.status === 'live' || e.status === 'upcoming')
            .slice(0, 3);
          setEvents(filtered);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [backendUrl]);

  if (loading) return null;
  if (events.length === 0) return null;
  return (
    <section id="events" className="py-32 bg-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,164,0.02),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 leading-tight">
              Join Our Next <br />
              <span className="text-primary underline decoration-primary/10">Live Sessions</span>
            </h2>
            <p className="text-slate-500 mt-6 text-lg">
              Don't miss out on our upcoming hands-on workshops and masterclasses 
              designed to elevate your clinical skills.
            </p>
          </div>
          <button 
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm hover:translate-x-2 transition-transform"
          >
             Explore Calendar <ArrowRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {events.map((event, idx) => (
            <motion.div
              key={idx}
              onClick={() => navigate(`/events/${event.id}`)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -12 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-12px_rgba(14,165,164,0.15)] transition-all duration-500 overflow-hidden cursor-pointer"
            >
              {/* Premium Image Container with Glass Overlay */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={event.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600"} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Floating Badges */}
                <div className="absolute top-5 left-5 flex gap-2 z-10">
                  <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] border border-white/20 shadow-xl">
                    {event.type}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl border border-white/10 ${event.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-white'}`}>
                    {event.status}
                  </span>
                </div>

                {/* Date Floating Card */}
                <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between z-10">
                   <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/20">
                      <div className="flex flex-col items-center border-r border-white/20 pr-4">
                        <span className="text-primary font-black text-xl leading-none">
                          {event.startDate ? new Date(event.startDate).getDate() : new Date(event.date).getDate()}
                        </span>
                        <span className="text-[9px] text-white/70 font-black uppercase mt-0.5 tracking-tighter">
                          {event.startDate ? new Date(event.startDate).toLocaleString('default', { month: 'short' }) : new Date(event.date).toLocaleString('default', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-[10px] text-white font-black uppercase tracking-[0.1em]">
                           {event.startTime || event.time}
                        </span>
                      </div>
                   </div>

                   {/* Reveal on hover button */}
                   <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                         <ArrowRight size={18} />
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-xl md:text-2xl font-heading font-black text-slate-900 leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
                  {event.title}
                </h3>
                
                <div className="flex items-center gap-3 text-slate-500 text-[11px] font-black uppercase tracking-[0.1em] mb-6">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                     <MapPin size={16} />
                  </div>
                  {event.location}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Access Pass</span>
                    <span className="text-2xl font-heading font-black text-slate-900 tracking-tight">
                      {event.priceType === 'free' ? 'FREE' : `₹${event.price}`}
                    </span>
                  </div>
                  <div className="text-primary font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    View Details <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;
