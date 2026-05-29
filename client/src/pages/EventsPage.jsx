import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Video, Users, Timer, Sparkles, Filter, Search } from "lucide-react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const EventCard = ({ event, delayIndex }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delayIndex * 0.1 }}
      className="group relative bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 overflow-hidden flex flex-col"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-400/20 rounded-[34px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

      <div className="relative h-40 overflow-hidden shrink-0">
        <img 
          src={event.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold text-slate-900 uppercase tracking-wider border border-white/20">
            {event.type}
          </span>
          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border border-white/20 ${event.priceType === 'free' ? 'bg-green-500/90 text-white' : 'bg-primary/90 text-white'}`}>
            {event.priceType === 'free' ? 'Free' : `₹${event.price}`}
          </span>
        </div>

        <div className="absolute bottom-3 left-4 py-2 px-3.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white">
            <Calendar size={12} className="text-primary" />
            <span className="text-[10px] font-black tracking-wider uppercase">
              {event.startDate ? (
                <>
                  {new Date(event.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                  {event.endDate && event.endDate !== event.startDate && ` - ${new Date(event.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}`}
                </>
              ) : new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1.5 text-white">
            <Timer size={12} className="text-primary" />
            <span className="text-[10px] font-black tracking-wider uppercase">
              {event.startTime ? `${event.startTime}` : event.time}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-heading font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {event.title}
        </h3>
        
        <div className="flex flex-col gap-2 mb-6 text-slate-500 text-[11px] font-medium">
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-primary/60 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Video size={12} className="text-primary/60 flex-shrink-0" />
            {event.type} Interactive Session
          </div>
        </div>

        <Link 
          to={`/events/${event.id}`}
          className="w-full mt-auto bg-slate-900 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary transition-all group/btn shadow-lg shadow-slate-200"
        >
          Enroll Now <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

const EventsPage = () => {
  const { backendUrl } = useContext(AppContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/events/all");
      if (data.success) {
        setEvents(data.events);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const matchesSearch = (event) => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    event.location.toLowerCase().includes(searchQuery.toLowerCase());

  const liveEvents = events.filter((e) => e.status.toLowerCase() === 'live' && matchesSearch(e));
  const upcomingEvents = events.filter((e) => e.status.toLowerCase() === 'upcoming' && matchesSearch(e));
  const pastEvents = events.filter((e) => e.status.toLowerCase() === 'past' && matchesSearch(e));

  const renderSection = (title, icon, eventsList, emptyMessage) => {
    if (eventsList.length === 0 && searchQuery) return null;

    return (
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
            {icon}
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">{title}</h2>
          <span className="px-3 py-1 bg-white text-slate-500 rounded-full text-xs font-bold ml-2 shadow-sm border border-slate-100">
            {eventsList.length}
          </span>
        </div>

        {eventsList.length > 0 ? (
          <div className="w-full sm:px-0">
            <Swiper
              modules={[Pagination]}
              spaceBetween={24}
              slidesPerView={1.1} // Show partial next card on mobile
              breakpoints={{
                640: { slidesPerView: 1.5, spaceBetween: 24 },
                768: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 32 },
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              className="pb-16"
            >
              {eventsList.map((event, idx) => (
                <SwiperSlide key={event.id} className="h-auto pb-4">
                  <EventCard event={event} delayIndex={idx} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="py-12 px-6 bg-white rounded-[32px] border border-slate-100 text-center flex flex-col items-center justify-center border-dashed">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Calendar size={24} />
             </div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{emptyMessage}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles size={14} /> Discover Learning
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-heading font-bold text-slate-900 mb-6 tracking-tight"
          >
            Knowledge Beyond <span className="text-primary italic">Boundaries</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg"
          >
            Join our expert-led workshops, webinars, and masterclasses to stay ahead 
            in the world of physiotherapy and clinical excellence.
          </motion.p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div className="w-full md:w-96 relative group mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search events or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Events Layout */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[400px] bg-slate-100 animate-pulse rounded-[32px]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {renderSection("Live Events", <Video size={20} className="text-red-500" />, liveEvents, "No live events currently running")}
            {renderSection("Upcoming Events", <Calendar size={20} className="text-primary" />, upcomingEvents, "No upcoming events scheduled")}
            {renderSection("Past Events", <Timer size={20} className="text-slate-400" />, pastEvents, "No past events available")}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
