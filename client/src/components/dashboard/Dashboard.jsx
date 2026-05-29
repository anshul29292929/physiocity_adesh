import React from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  FileText, 
  LogOut, 
  Search, 
  Bell, 
  UserCircle 
} from "lucide-react";
import { cn } from "../../lib/utils";

const SidebarItem = ({ icon: Icon, label, active = false }) => (
  <button className={cn(
    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-sm",
    active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-textSecondary hover:bg-slate-100 hover:text-textPrimary"
  )}>
    <Icon size={20} />
    {label}
  </button>
);

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-body">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-2 mb-10 px-2">
           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
           </div>
           <span className="text-xl font-heading font-bold text-textPrimary tracking-tight">Physio<span className="text-primary">city</span></span>
        </div>

        <div className="space-y-2 flex-1">
           <SidebarItem icon={LayoutDashboard} label="My Dashboard" active />
           <SidebarItem icon={BookOpen} label="My Courses" />
           <SidebarItem icon={Calendar} label="Events" />
           <SidebarItem icon={FileText} label="Resources" />
           <SidebarItem icon={UserCircle} label="Profile" />
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
           <SidebarItem icon={LogOut} label="Log Out" />
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex items-center justify-between mb-10">
           <div>
              <h1 className="text-2xl font-bold text-textPrimary font-heading">Welcome back, Dr. Rohan</h1>
              <p className="text-sm text-textSecondary mt-1">Check your latest course progress and upcoming events.</p>
           </div>
           <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl bg-white border border-slate-200 text-textSecondary hover:bg-slate-50 relative">
                 <Bell size={20} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden shadow-sm">
                 <img src="https://i.pravatar.cc/150?u=rohan" alt="User" />
              </div>
           </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Courses in Progress</p>
              <div className="flex items-end gap-3">
                 <h2 className="text-3xl font-bold text-textPrimary">03</h2>
              </div>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Upcoming Events</p>
              <div className="flex items-end gap-3">
                 <h2 className="text-3xl font-bold text-textPrimary">02</h2>
              </div>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Certificates Earned</p>
              <div className="flex items-end gap-3">
                 <h2 className="text-3xl font-bold text-textPrimary">12</h2>
              </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
