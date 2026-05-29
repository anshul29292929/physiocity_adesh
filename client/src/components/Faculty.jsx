import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { Linkedin, Mail, Search, Award, Hospital } from "lucide-react";

const Faculty = () => {
  const { backendUrl } = useContext(AppContext);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/verified-faculty`);
        if (data.success) {
          setMentors(data.faculty);
        }
      } catch (error) {
        console.error("Error fetching faculty:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [backendUrl]);

  if (loading) return null; // Or a skeleton
  if (mentors.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-4">
              <Award className="w-4 h-4" />
              Elite Faculty
            </div>
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-slate-900 mb-6 tracking-tight">
              Learn from the <span className="text-primary italic">Best</span>
            </h2>
            <p className="text-slate-500 text-lg font-medium">
              Our mentors are renowned clinical directors and specialists from 
              top-tier healthcare institutions globally.
            </p>
          </div>
        </div>

        <Swiper
          modules={[Autoplay, Pagination, EffectCoverflow]}
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 50,
            modifier: 1.5,
            slideShadows: false,
          }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="faculty-swiper pb-20"
        >
          {mentors.map((mentor, idx) => (
            <SwiperSlide key={idx} className="max-w-[280px] md:max-w-[320px] lg:max-w-[340px]">
              <div className="bg-slate-50 rounded-[32px] p-5 md:p-6 lg:p-8 border border-slate-100 group hover:bg-white hover:shadow-2xl hover:border-primary/20 transition-all duration-700 flex flex-col">
                <div className="relative mb-5 rounded-[24px] overflow-hidden aspect-square shadow-lg border-4 border-white">
                  <img
                    src={mentor.image.startsWith('http') ? mentor.image : `${backendUrl}${mentor.image}`}
                    alt={mentor.name}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex justify-center gap-3">
                    <button className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl">
                      <Linkedin size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl">
                      <Mail size={18} />
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-3 md:mb-3">
                    {mentor.speciality}
                  </span>
                  <h3 className="text-2xl md:text-2xl lg:text-3xl font-heading font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                    {mentor.name}
                  </h3>
                  <div className="flex flex-col gap-1 md:gap-1 lg:gap-2">
                     <p className="text-slate-500 font-bold text-[10px] md:text-[11px] lg:text-xs uppercase tracking-widest">
                       {mentor.role}
                     </p>
                     <p className="text-slate-400 font-medium text-xs md:text-xs lg:text-sm flex items-center justify-center gap-2">
                        <Hospital size={12} className="text-primary/50" />
                        {mentor.organization || mentor.org}
                     </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      <style>{`
        .faculty-swiper .swiper-pagination-bullet-active {
          background: #0EAF9F !important;
          width: 24px !important;
          border-radius: 4px !important;
        }
      `}</style>
    </section>
  );
};

export default Faculty;
