import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../../components/ims/student/Loading';
import { Users, BookOpen, DollarSign, TrendingUp, Clock, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const { backendUrl, adminToken, currency } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/dashboard', {
        headers: { admintoken: adminToken }
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchDashboardData();
    }
  }, [adminToken]);

  return dashboardData ? (
    <div className='p-8 min-h-[calc(100vh-80px)] bg-slate-50'>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Platform Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Here's what's happening on your academy today.</p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Card 1: Students */}
          <div className='bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow'>
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 outline outline-4 outline-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Users size={24} strokeWidth={2.5} />
              </div>
              <p className='text-3xl font-black text-slate-800 tracking-tight'>{dashboardData.enrolledStudentsData.length}</p>
              <p className='text-sm font-bold text-slate-400 uppercase tracking-widest mt-1'>Total Enrollments</p>
            </div>
          </div>

          {/* Card 2: Courses */}
          <div className='bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow'>
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-orange-100 text-orange-500 outline outline-4 outline-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <BookOpen size={24} strokeWidth={2.5} />
              </div>
              <p className='text-3xl font-black text-slate-800 tracking-tight'>{dashboardData.totalCourses}</p>
              <p className='text-sm font-bold text-slate-400 uppercase tracking-widest mt-1'>Active Courses</p>
            </div>
          </div>

          {/* Card 3: Course Revenue */}
          <div className='bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow'>
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 outline outline-4 outline-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <DollarSign size={24} strokeWidth={2.5} />
              </div>
              <p className='text-3xl font-black text-slate-800 tracking-tight'>{currency}{Math.floor(dashboardData.courseEarnings || 0)}</p>
              <p className='text-sm font-bold text-slate-400 uppercase tracking-widest mt-1'>Course Revenue</p>
            </div>
          </div>

          {/* Card 4: Event Revenue */}
          <div className='bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow'>
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 outline outline-4 outline-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <TrendingUp size={24} strokeWidth={2.5} />
              </div>
              <p className='text-3xl font-black text-slate-800 tracking-tight'>{currency}{Math.floor(dashboardData.eventEarnings || 0)}</p>
              <p className='text-sm font-bold text-slate-400 uppercase tracking-widest mt-1'>Event Revenue</p>
            </div>
          </div>
        </div>

        {/* Latest Activity Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" /> Recent Enrollments
              </h2>
            </div>
            
            <div className="overflow-x-auto flex-1 p-2">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest rounded-l-2xl">Student</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest rounded-r-2xl">Course Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dashboardData.enrolledStudentsData.slice(0, 10).map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.student.imageUrl}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <span className="font-bold text-slate-800">{item.student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-inset ring-blue-600/10">
                          {item.courseTitle.length > 35 ? item.courseTitle.substring(0, 35) + '...' : item.courseTitle}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {dashboardData.enrolledStudentsData.length === 0 && (
                    <tr>
                      <td colSpan="2" className="px-6 py-12 text-center text-slate-400 font-medium">No recent enrollments available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl lg:h-[500px] flex flex-col">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full"></div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <Clock size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Platform Activity</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Your academy is growing securely. Keep an eye on student engagement and new course enrollments directly from this dashboard.
              </p>
              
              <div className="mt-auto">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Growth</p>
                  <p className="text-3xl font-black text-white">+12%</p>
                  <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                    <div className="w-[70%] h-full bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  ) : <Loading />;
};

export default Dashboard;