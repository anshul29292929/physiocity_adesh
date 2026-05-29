import React, { useContext, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AppContext } from '../../../context/AppContext';
import { LayoutDashboard, BookOpen, HelpCircle, Users, FileText, Settings, BarChart3, PlusCircle, Award, MessageSquare, UserCog, X, Calendar, Activity } from 'lucide-react';

const SideBar = () => {
    const { adminToken, activeModule, setActiveModule, isSidebarOpen, setIsSidebarOpen } = useContext(AppContext);
    const location = useLocation();

    // Map URL paths to modules for initial sync and deep linking
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/questions') || path.includes('/quiz') || path.includes('/add-question') || path.includes('/edit-question')) {
            if (activeModule !== 'quiz') setActiveModule('quiz');
        } else if (path.includes('/course') || path.includes('/student-enrolled') || path.includes('/my-courses') || path.includes('/manage-reviews')) {
            if (activeModule !== 'course') setActiveModule('course');
        } else if (path.includes('/blog')) {
            if (activeModule !== 'blog') setActiveModule('blog');
        } else if (path.includes('/students-list') || path.includes('/manage-faculty') || path.includes('/manage-users')) {
            if (activeModule !== 'user') setActiveModule('user');
        } else if (path.includes('/certificates')) {
            if (activeModule !== 'certificate') setActiveModule('certificate');
        } else if (path.includes('/admin/events') || path.includes('/event-enrollments')) {
            if (activeModule !== 'events') setActiveModule('events');
        }
    }, [location.pathname]); // Sync active module on every route change

    const menuStructure = useMemo(() => [
        {
            id: 'general',
            name: 'Global Overview',
            path: '/admin',
            icon: <LayoutDashboard size={20} />
        },
        {
            id: 'course',
            name: 'Manage Courses',
            path: '/admin/my-courses',
            icon: <BookOpen size={20} />,
            children: [
                { name: 'My Courses', path: '/admin/my-courses' },
                { name: 'Add Course', path: '/admin/add-course' },
                { name: 'Enrolled Students', path: '/admin/student-enrolled' },
                { name: 'Manage Reviews', path: '/admin/manage-reviews' },
            ]
        },
        {
            id: 'quiz',
            name: 'Manage Quizzes',
            path: '/admin/quizzes',
            icon: <HelpCircle size={20} />,
            children: [
                { name: 'Manage Quizzes', path: '/admin/quizzes' },
                { name: 'View Submissions', path: '/admin/quiz-submissions' },
                { name: 'Quiz Analytics', path: '/admin/quiz-analytics' },
            ]
        },
        {
            id: 'user',
            name: 'Users & Faculty',
            path: '/admin/manage-users',
            icon: <Users size={20} />,
            children: [
                { name: 'Manage Users', path: '/admin/manage-users' },
                { name: 'Manage Faculty', path: '/admin/manage-faculty' },
            ]
        },
        {
            id: 'blog',
            name: 'Blog Management',
            path: '/admin/blog-management',
            icon: <FileText size={20} />
        },
        {
            id: 'events',
            name: 'Manage Events',
            path: '/admin/events',
            icon: <Calendar size={20} />
        },
        {
            id: 'certificate',
            name: 'Certificates',
            path: '/admin/certificates',
            icon: <Award size={20} />
        }
    ], []);

    return adminToken && (
        <>
            {/* Mobile Backdrop */}
            <div 
                className={`lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <div className={`
                lg:static fixed top-0 bottom-0 left-0 z-[60]
                lg:w-72 w-72 bg-white border-r border-slate-100 py-6 flex flex-col gap-1 shadow-2xl lg:shadow-sm
                transition-transform duration-500 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="px-6 mb-8 flex items-center justify-between lg:block">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Admin Core
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-2">
                    {menuStructure.map((module) => {
                        const isOpen = activeModule === module.id;
                        return (
                            <div key={module.id} className="mb-2">
                                <NavLink
                                    to={module.path}
                                    end={module.path === '/admin'}
                                    onClick={() => {
                                        setActiveModule(module.id);
                                        if (!module.children) setIsSidebarOpen(false);
                                    }}
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group mx-2 ${
                                            isActive || isOpen
                                                ? 'text-blue-600 bg-blue-50/50 font-bold' 
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`
                                    }
                                >
                                    <span className="flex-shrink-0">{module.icon}</span>
                                    <p className='text-sm whitespace-nowrap'>{module.name}</p>
                                </NavLink>

                                {module.children && isOpen && (
                                    <div className="flex flex-col gap-1 mt-1 ml-12 pr-4 border-l-2 border-slate-100 py-2">
                                        {module.children.map(child => (
                                            <NavLink
                                                key={child.name}
                                                to={child.path}
                                                end
                                                onClick={() => setIsSidebarOpen(false)}
                                                className={({ isActive }) =>
                                                    `flex items-center px-4 py-2.5 rounded-xl transition-all text-[13px] font-bold ${
                                                        isActive 
                                                            ? 'text-blue-600 bg-blue-50/50' 
                                                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                                                    }`
                                                }
                                            >
                                                {child.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-auto px-6 py-4 border-t border-slate-50 flex flex-col gap-2">
                    <NavLink
                        to="/status"
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-all"
                    >
                        <Activity size={14} /> System Status
                    </NavLink>
                    <NavLink
                        to="/admin/settings"
                        onClick={() => setIsSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-2 text-xs font-bold transition-all ${
                                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
                            }`
                        }
                    >
                        <UserCog size={14} /> Admin Settings
                    </NavLink>
                </div>
            </div>
        </>
    );
};

export default SideBar;