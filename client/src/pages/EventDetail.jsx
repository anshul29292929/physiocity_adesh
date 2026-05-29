import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, Video, Users, CheckCircle2, ArrowLeft, Send, MessageCircle, Sparkles, User, Mail, ExternalLink } from "lucide-react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, userData, token } = useContext(AppContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
  });

  const enrollmentFormRef = React.useRef(null);

  const scrollToEnroll = () => {
    enrollmentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    fetchEvent();
    if (userData?.email) {
      checkEnrollment(userData.email);
    }
  }, [id, userData]);

  const checkEnrollment = async (email) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/events/check-enrollment`, {
        eventId: id,
        email
      });
      if (data.success) {
        setIsEnrolled(data.isEnrolled);
      }
    } catch (error) {
      console.error("Check enrollment error:", error);
    }
  };

  const fetchEvent = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/events/${id}`);
      if (data.success) {
        setEvent(data.event);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!event) return;

    if (event.priceType === "paid") {
      try {
        setEnrolling(true);
        // 1. Create Order
        const { data: orderData } = await axios.post(`${backendUrl}/api/events/create-order`, {
          eventId: event.id,
          userId: userData?.id
        });

        if (!orderData.success) throw new Error(orderData.message);

        // 2. Open Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "Physiocity Academy",
          description: `Enrollment for ${event.title}`,
          order_id: orderData.order.id,
          handler: async (response) => {
            try {
              setVerifyingPayment(true);
              const { data: verifyData } = await axios.post(`${backendUrl}/api/events/verify-payment`, {
                ...response,
                eventId: event.id,
                name: formData.name,
                email: formData.email,
                userId: userData?.id,
                amount: event.price
              });

              if (verifyData.success) {
                toast.success("Payment Received! Enrolled successfully.");
                setIsEnrolled(true);
                // Reveal links immediately by re-fetching or state
              } else {
                toast.error(verifyData.message || "Payment Verification Failed");
              }
            } catch (error) {
              toast.error("Internal Error during verification");
            } finally {
              setVerifyingPayment(false);
              setEnrolling(false);
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
          },
          theme: {
            color: "#0ea5a4",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          toast.error("Payment Failed. Please try again.");
          setEnrolling(false);
        });
        rzp.open();

      } catch (error) {
        toast.error(error.message || "Checkout failed");
        setEnrolling(false);
      }
    } else {
      // Free Enrollment
      try {
        setEnrolling(true);
        const { data } = await axios.post(`${backendUrl}/api/events/enroll`, {
          eventId: event.id,
          name: formData.name,
          email: formData.email,
          userId: userData?.id
        });

        if (data.success) {
          toast.success(data.message);
          setIsEnrolled(true);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Error enrolling in event");
      } finally {
        setEnrolling(false);
      }
    }
  };

  if (loading) return <div className="min-h-screen pt-32 text-center">Loading event details...</div>;
  if (!event) return <div className="min-h-screen pt-32 text-center">Event not found.</div>;

  const isPast = event.status === "past";

  return (
    <div className="pt-32 pb-20 bg-slate-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <Link to="/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-xs uppercase tracking-widest mb-6 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden mb-8 relative group"
            >
              {/* Premium Banner Section */}
              <div className="relative bg-slate-900 overflow-hidden group/banner">
                {/* Blur Background Layer */}
                <div className="absolute inset-0 opacity-30 blur-3xl scale-125 transition-transform duration-1000 group-hover/banner:scale-110">
                  <img 
                    src={event.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"} 
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Main Poster Layer */}
                <div className="relative h-[250px] sm:h-[350px] md:h-[480px] w-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <img 
                    src={event.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"} 
                    alt={event.title}
                    className="max-w-full max-h-full object-contain drop-shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
                  />
                  
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-8 left-8 right-8 z-10">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-primary px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                          {event.type}
                        </span>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${event.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20 text-white backdrop-blur-md border border-white/20'}`}>
                          {event.status}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-[1.1] tracking-tight">
                      {event.title}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 pb-12 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary flex-shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Date</p>
                      <p className="text-slate-900 text-sm font-bold">
                        {event.startDate ? (
                          <>
                            {new Date(event.startDate).toLocaleDateString('en-GB')}
                            {event.endDate && event.endDate !== event.startDate && ` - ${new Date(event.endDate).toLocaleDateString('en-GB')}`}
                          </>
                        ) : new Date(event.date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-x border-slate-100 px-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary flex-shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Time</p>
                      <p className="text-slate-900 text-sm font-bold uppercase">
                        {event.startTime ? `${event.startTime} - ${event.endTime}` : event.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary flex-shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Location</p>
                      <p className="text-slate-900 text-sm font-bold">{event.location}</p>
                      {event.googleMapsLink && (
                        <a href={event.googleMapsLink} target="_blank" rel="noreferrer" className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1 mt-1">
                          View on Maps <ExternalLink size={10} />
                        </a>
                      )}
                      {event.type === 'online' && event.googleMeetLink && (
                        <div className="text-[10px] text-primary font-bold mt-1">
                          Link available after enrollment
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary flex-shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Price</p>
                      <p className="text-slate-900 text-sm font-bold">
                        {event.priceType === 'free' ? 'FREE' : `₹${event.price}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <h3 className="text-xl font-heading font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="text-primary" size={20} /> About Event
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Enrollment */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit z-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              ref={enrollmentFormRef}
              className="bg-white rounded-[40px] border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] p-8 overflow-hidden relative group/card"
            >
              {/* Premium Glow Effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover/card:bg-primary/10 transition-colors" />
              
              {!isPast ? (
                <>
                  {!isEnrolled ? (
                    <>
                      <div className="text-center mb-8 bg-slate-50/50 py-10 rounded-[32px] border border-slate-100 relative group/fee">
                        <div className="absolute inset-0 bg-primary/5 rounded-[32px] scale-95 opacity-0 group-hover/fee:scale-100 group-hover/fee:opacity-100 transition-all duration-500" />
                        <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-3 block relative z-10">Fee To Attend</span>
                        <div className="flex items-center justify-center gap-2 relative z-10">
                          <span className="text-5xl font-heading font-black text-slate-900 tracking-tight">
                            {event.priceType === 'free' ? 'FREE' : `₹${event.price}`}
                          </span>
                        </div>
                      </div>

                      {userData?.email ? (
                        <form onSubmit={handleEnroll} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                              <input 
                                type="text" 
                                required
                                placeholder="Your full name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full pl-11 pr-6 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-xl text-sm transition-all outline-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                              <input 
                                type="email" 
                                required
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full pl-11 pr-6 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-xl text-sm transition-all outline-none"
                              />
                            </div>
                          </div>

                          <button 
                            type="submit"
                            disabled={enrolling || verifyingPayment}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:-translate-y-1 hover:shadow-xl transition-all disabled:opacity-50"
                          >
                            {enrolling ? (verifyingPayment ? "Verifying Payment..." : "Enrolling...") : "Complete Enrollment"} <Send size={16} />
                          </button>
                        </form>
                      ) : (
                        <button 
                          onClick={() => navigate('/login', { state: { redirect: location.pathname } })}
                          className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:-translate-y-1 hover:shadow-xl transition-all mt-4"
                        >
                          Login to Enroll
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">You're Enrolled!</h3>
                      <p className="text-slate-500 text-sm mb-8">Access the study group and resources below.</p>
                      {isEnrolled && (
                        <div className="flex flex-col gap-3">
                          {event.whatsappGroupLink && (
                            <a 
                              href={event.whatsappGroupLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-200 hover:-translate-y-1 transition-all"
                            >
                              <MessageCircle size={18} /> Join WhatsApp Group
                            </a>
                          )}
                          {event.type === 'online' && event.googleMeetLink && (
                            <a 
                              href={event.googleMeetLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-200 hover:-translate-y-1 transition-all"
                            >
                              <Video size={18} /> Join Webinar Now
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-10 pt-10 border-t border-slate-50">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">Event Benefits</h4>
                    <ul className="space-y-4">
                      {[
                        "Interactive Q&A session",
                        "Participation Certificate",
                        "Access to recording",
                        "Exclusive study material"
                      ].map((v, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-500 text-sm">
                          <CheckCircle2 size={16} className="text-green-500" /> {v}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!isEnrolled && event.whatsappGroupLink && (
                    <div className="mt-8 pt-8 border-t border-slate-50 opacity-50 grayscale cursor-not-allowed">
                      <div className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-slate-100 text-slate-400 font-bold text-sm">
                        <MessageCircle size={18} /> Group Link (Enroll to Unlock)
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Clock size={32} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Registration Closed</h3>
                   <p className="text-slate-500 text-sm mb-8">This event has already taken place. Stay tuned for future sessions!</p>
                   <Link to="/events" className="text-primary font-bold text-sm uppercase tracking-widest border-b-2 border-primary/20 hover:border-primary transition-all pb-1">Explore Other Events</Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {!isPast && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
        >
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
             {!isEnrolled && (
               <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fee To Join</span>
                 <span className="text-xl font-black text-slate-900 leading-none">
                   {event.priceType === 'free' ? 'FREE' : `₹${event.price}`}
                 </span>
               </div>
             )}
             
             {isEnrolled ? (
               <div className="flex-1 flex gap-3">
                  {event.whatsappGroupLink && (
                    <a 
                      href={event.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 text-white py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  )}
                  {event.type === 'online' && event.googleMeetLink && (
                    <a 
                      href={event.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-100"
                    >
                      <Video size={14} /> Join Webinar
                    </a>
                  )}
               </div>
             ) : (
               <button 
                 onClick={() => {
                   if (!userData?.email) {
                     navigate('/login', { state: { redirect: location.pathname } });
                   } else {
                     setIsEnrollModalOpen(true);
                   }
                 }}
                 className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all"
               >
                 Enroll Now <Sparkles size={14} />
               </button>
             )}
          </div>
        </motion.div>
      )}

      {/* Enrollment Modal for Mobile */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnrollModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 relative z-10 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8 sm:hidden" />
              <div className="text-center mb-8">
                <h2 className="text-3xl font-heading font-black text-slate-900 mb-2">Join Event</h2>
                <p className="text-slate-500 text-sm">Please provide your details to complete registration.</p>
              </div>

              <form 
                onSubmit={(e) => {
                  handleEnroll(e);
                  setIsEnrollModalOpen(false);
                }} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl text-sm transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="email" 
                      required
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  <button 
                    type="submit"
                    disabled={enrolling || verifyingPayment}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-2xl transition-all disabled:opacity-50"
                  >
                    {enrolling ? (verifyingPayment ? "Verifying Payment..." : "Enrolling...") : "Complete Enrollment"} <Send size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEnrollModalOpen(false)}
                    className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetail;
