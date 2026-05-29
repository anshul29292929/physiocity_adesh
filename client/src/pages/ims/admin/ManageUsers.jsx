import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import { Search, Edit2, ShieldCheck, Mail, BookOpen, Clock, X, CheckCircle, Plus, Activity, ExternalLink, Calendar, Target, Award } from "lucide-react";
import { getRelativeTime } from "../../../utils/DateUtils";
import Loading from "../../../components/ims/student/Loading";

const ManageUsers = () => {
  const { backendUrl, adminToken } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [canAccessBlog, setCanAccessBlog] = useState(true);
  const [canAccessQuiz, setCanAccessQuiz] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityData, setActivityData] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const authHeader = { headers: { admintoken: adminToken } };

  const fetchData = async () => {
    try {
      const [userRes, courseRes] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/users`, authHeader),
        axios.get(`${backendUrl}/api/admin/courses`, authHeader)
      ]);

      if (userRes.data.success) setUsers(userRes.data.users);
      if (courseRes.data.success) setAllCourses(courseRes.data.courses);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) fetchData();
  }, [adminToken]);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setSelectedCourses(user.enrolledCourses || []);
    setIsBlocked(user.isBlocked || false);
    setCanAccessBlog(user.canAccessBlog !== false);
    setCanAccessQuiz(user.canAccessQuiz !== false);
    setShowModal(true);
  };

  const handleViewActivity = async (user) => {
    setSelectedUser(user);
    setShowActivityModal(true);
    setLoadingActivity(true);
    setActivityData(null);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/users/${user.id}/activity`, authHeader);
      if (data.success) {
        setActivityData(data);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to load user activity");
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleToggleCourse = (courseIdStr) => {
    setSelectedCourses(prev =>
      prev.includes(courseIdStr)
        ? prev.filter(id => id !== courseIdStr)
        : [...prev, courseIdStr]
    );
  };

  const handleSaveAccess = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/admin/users/${selectedUser.id}/access`,
        { 
          enrolledCourses: selectedCourses,
          isBlocked,
          canAccessBlog,
          canAccessQuiz
        },
        authHeader
      );
      if (data.success) {
        toast.success("Access updated successfully!");
        setUsers(users.map(u => u.id === selectedUser.id ? { 
          ...u, 
          enrolledCourses: data.enrolledCourses,
          isBlocked: data.isBlocked,
          canAccessBlog: data.canAccessBlog,
          canAccessQuiz: data.canAccessQuiz
        } : u));
        setShowModal(false);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to update enrollments");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
          <p className="text-gray-500 mt-1">Search students and manage their course access manually.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Level / Stats</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Access</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-12"><Loading /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 font-medium">No users found matching "{search}"</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={user.imageUrl} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                        {user.role === 'admin' && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 border-2 border-white">
                            <ShieldCheck size={12} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                          {user.name}
                          {user.isBlocked && <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider">Blocked</span>}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-700">{user.performanceLevel}</p>
                    <p className="text-xs text-gray-500 font-medium">{Math.round(user.accuracy)}% Accuracy</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400" />
                      {new Date(user.createdAt).toLocaleDateString('en-GB')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                         <BookOpen size={12} /> {(user.enrolledCourses || []).length} Courses
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleViewActivity(user)}
                          className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5">
                          <Activity size={14} /> Activity
                        </button>
                        <button onClick={() => handleOpenEdit(user)}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5">
                          <Edit2 size={14} /> Access
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Enrollments Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Manage Course Access</h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Modifying enrollments for <span className="text-blue-600 font-bold">{selectedUser?.name}</span></p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Course List Scrollable */}
              <div className="p-8 overflow-y-auto flex-1">
                {/* Platform Access Controls */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Platform Access</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">Blog Access</span>
                        <span className="text-xs text-gray-500 font-medium mt-0.5">Allow reading articles</span>
                      </div>
                      <input type="checkbox" checked={canAccessBlog} onChange={(e) => setCanAccessBlog(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">Quiz Access</span>
                        <span className="text-xs text-gray-500 font-medium mt-0.5">Allow taking quizzes</span>
                      </div>
                      <input type="checkbox" checked={canAccessQuiz} onChange={(e) => setCanAccessQuiz(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-red-100 bg-red-50/30 rounded-2xl cursor-pointer hover:bg-red-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-red-700">Block User</span>
                        <span className="text-xs text-red-500 font-medium mt-0.5">Suspend all access</span>
                      </div>
                      <input type="checkbox" checked={isBlocked} onChange={(e) => setIsBlocked(e.target.checked)} className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500" />
                    </label>
                  </div>
                </div>

                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Courses</h3>
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">{allCourses.length} Total</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allCourses.map(course => {
                    // Normalize to string for comparison since enrolledCourses are strings
                    const courseIdStr = String(course._id); // Assuming MongoDB string ID or stringified SQL ID
                    const isEnrolled = selectedCourses.includes(courseIdStr);

                    return (
                      <div 
                        key={courseIdStr}
                        onClick={() => handleToggleCourse(courseIdStr)}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3 group ${
                          isEnrolled ? "border-blue-600 bg-blue-50/30" : "border-gray-100 bg-white hover:border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <img src={course.courseThumbnail} className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-gray-50 shrink-0" alt="" />
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                            isEnrolled ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-transparent group-hover:border-blue-300"
                          }`}>
                            <CheckCircle size={14} className={isEnrolled ? "opacity-100" : "opacity-0 group-hover:opacity-10 opacity-transition"} strokeWidth={3} />
                          </div>
                        </div>
                        <div>
                          <p className={`text-sm font-bold line-clamp-2 leading-tight ${isEnrolled ? "text-blue-900" : "text-gray-700"}`}>
                            {course.courseTitle}
                          </p>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2 block">
                            {course.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {allCourses.length === 0 && (
                  <p className="text-center py-10 text-gray-400 font-medium">No courses available on the platform.</p>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between rounded-b-3xl shrink-0">
                <span className="text-sm font-bold text-gray-500">
                  <span className="text-blue-600">{selectedCourses.length}</span> Course(s) Selected
                </span>
                <div className="flex items-center gap-3">
                  <button disabled={isSubmitting} onClick={() => setShowModal(false)}
                    className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button disabled={isSubmitting} onClick={handleSaveAccess}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <img src={selectedUser?.imageUrl} alt="" className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedUser?.name}</h2>
                  <p className="text-sm font-medium text-gray-500 mt-0.5">{selectedUser?.email}</p>
                </div>
              </div>
              <button onClick={() => setShowActivityModal(false)} className="p-2 hover:bg-gray-200 rounded-xl text-gray-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content body */}
            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30">
              {loadingActivity ? (
                <div className="py-20 flex justify-center"><Loading /></div>
              ) : activityData ? (
                <div className="flex flex-col gap-8">
                  {/* KPI Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-1.5"><Activity size={12}/> Quizzes Taken</span>
                      <span className="text-2xl font-black text-gray-900">{activityData.stats.totalAttempts}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5"><Target size={12}/> Avg Score</span>
                      <span className="text-2xl font-black text-gray-900">{activityData.stats.avgScore}%</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1.5"><BookOpen size={12}/> Courses</span>
                      <span className="text-2xl font-black text-gray-900">{activityData.courses.length}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5"><Clock size={12}/> Time Spent</span>
                      <span className="text-2xl font-black text-gray-900">{Math.round(activityData.stats.totalTimeSpent / 60)}m</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Recent Quizzes */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
                        <Activity size={16} className="text-indigo-500" /> Recent Quiz Attempts
                      </h3>
                      <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
                        {activityData.recentQuizzes.length === 0 ? (
                          <p className="text-xs text-gray-400 font-medium py-4 text-center">No quiz attempts recorded yet.</p>
                        ) : activityData.recentQuizzes.map((q, idx) => (
                          <div key={idx} className="flex flex-col p-4 border border-gray-100 bg-gray-50/50 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-bold text-gray-800 line-clamp-1 flex-1 pr-2">{q.quizTitle}</p>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${q.isPractice ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {q.isPractice ? 'Practice' : 'Official'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                <span>{q.score} Marks</span>
                                <span className="flex items-center gap-1"><Clock size={10}/> {q.timeTaken}s</span>
                              </div>
                              <a href={`/admin/quiz/${q.type}/submissions`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors">
                                View <ExternalLink size={12}/>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enrolled Courses */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
                        <BookOpen size={16} className="text-blue-500" /> Course Enrollments
                      </h3>
                      <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
                        {activityData.courses.length === 0 ? (
                          <p className="text-xs text-gray-400 font-medium py-4 text-center">No enrolled courses.</p>
                        ) : activityData.courses.map(course => (
                          <div key={course._id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-2xl hover:border-blue-200 transition-colors bg-white">
                            <img src={course.courseThumbnail} className="w-12 h-12 object-cover rounded-xl bg-gray-50 border border-gray-100" alt=""/>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">{course.courseTitle}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{course.category}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center py-10 text-red-500 font-medium">Failed to load data.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
