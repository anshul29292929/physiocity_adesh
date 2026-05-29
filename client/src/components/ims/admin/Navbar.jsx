import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../../context/AppContext';
import { Menu } from 'lucide-react';

const Navbar = ({ bgColor }) => {

  const { adminToken, adminData, adminLogout, setActiveModule, setIsSidebarOpen } = useContext(AppContext)

  return adminToken && adminData && (
    <div className={`flex items-center justify-between px-4 sm:px-10 lg:px-12 border-b border-slate-100 py-4 ${bgColor}`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
        >
          <Menu size={24} />
        </button>
        <Link to="/admin" onClick={() => setActiveModule('general')} className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden border border-slate-100 transform group-hover:rotate-6 transition-transform">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-heading font-bold text-slate-900 tracking-tight flex items-baseline leading-none">
            Physio<span className="text-blue-600 font-bold">city</span>
          </span>
        </Link>
      </div>

      {/* Center Navigation Links */}
      <div className="hidden lg:flex items-center gap-8">
        <NavLink to="/admin/manage-faculty" label="Manage Faculty" module="user" />
        <NavLink to="/admin/manage-users" label="Manage Users" module="user" />
        <NavLink to="/admin/quizzes" label="Manage Quizzes" module="quiz" />
        <NavLink to="/admin/my-courses" label="Manage Courses" module="course" />
        <NavLink to="/admin/blog-management" label="Blogs" module="blog" />
        <NavLink to="/admin/events" label="Manage Events" module="events" />
        <NavLink to="/admin/certificates" label="Certificate" module="certificate" />
      </div>
      <div className="flex items-center gap-5 text-gray-500 relative">
        <p>Hi! {adminData.email.split('@')[0]}</p>
        <div className='flex items-center gap-3'>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden border border-slate-100 p-0.5">
            <img src="/logo.jpg" alt="Admin Badge" className="w-full h-full object-cover rounded-full" />
          </div>
          <button onClick={adminLogout} className='bg-red-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-all'>Logout</button>
        </div>
      </div>
    </div>
  );
};

const NavLink = ({ to, label, module }) => {
  const { setActiveModule } = useContext(AppContext);
  return (
    <Link 
      to={to} 
      onClick={() => setActiveModule(module)}
      className="text-[11px] uppercase tracking-widest font-bold text-slate-500 hover:text-blue-600 transition-all"
    >
      {label}
    </Link>
  );
};

export default Navbar;