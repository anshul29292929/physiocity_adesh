import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Check, X, Trash2, UserCog, Briefcase, GraduationCap, Award, Hospital, Mail, Phone, AlertTriangle, FileText } from 'lucide-react';
import ConfirmationModal from '../../../components/ims/admin/ConfirmationModal';

const ManageFaculty = () => {
  const { backendUrl, adminToken } = useContext(AppContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, verified

  // Fetch all applications
  const fetchApplications = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/faculty-applications', {
        headers: { admintoken: adminToken }
      });
      if (data.success) {
        setApplications(data.applications);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchApplications();
    }
  }, [adminToken]);

  // Actions
  const approveFaculty = async (id) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/admin/verify-faculty/' + id, {}, {
        headers: { admintoken: adminToken }
      });
      if (data.success) {
        toast.success(data.message);
        fetchApplications();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const deleteFaculty = async () => {
    if (!deletingId || isDeleting) return;
    setIsDeleting(true);
    try {
      const { data } = await axios.delete(backendUrl + '/api/admin/delete-faculty/' + deletingId, {
        headers: { admintoken: adminToken }
      });
      if (data.success) {
        toast.success(data.message);
        fetchApplications();
        setShowConfirmModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-8"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-[16px] flex items-center justify-center">
          <UserCog size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Manage Faculty</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Review & Verify Educators</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1 rounded-2xl w-fit border border-slate-200 shadow-sm mb-8">
        {['all', 'pending', 'verified'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab} {tab !== 'all' && `(${applications.filter(a => a.status === tab).length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredApplications.length === 0 ? (
           <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center">
             <Briefcase className="w-16 h-16 text-slate-200 mb-4" />
             <h3 className="text-xl font-bold text-slate-700">No applications found</h3>
             <p className="text-slate-400 mt-2 font-medium">When educators apply, they will appear here for your review.</p>
           </div>
        ) : (
          filteredApplications.map(app => (
            <div key={app.id} className="bg-white rounded-[24px] lg:rounded-[32px] p-3 sm:p-5 border border-slate-100 shadow-sm flex flex-row gap-4 lg:gap-6 hover:shadow-md transition-shadow">
              {/* Compact Image Section */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-32 overflow-hidden rounded-[16px] lg:rounded-[24px] bg-slate-100 flex-shrink-0 relative group">
                <img src={app.image} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Faculty" />
                <div className="absolute top-2 left-2">
                  {app.status === 'verified' ? (
                    <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg"><Check size={10} /></div>
                  ) : (
                    <div className="bg-amber-500 text-white p-1 rounded-full shadow-lg"><AlertTriangle size={10} /></div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-xl font-black text-slate-800 tracking-tight">{app.name}</h2>
                      <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase ${app.status === 'verified' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-primary font-bold text-[10px] uppercase tracking-[0.15em]">{app.role}</p>
                  </div>

                  <div className="flex gap-1.5 sm:gap-2">
                    {app.cv && (
                      <a href={app.cv} target="_blank" rel="noopener noreferrer" className="p-2 sm:p-2.5 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all rounded-xl shadow-sm" title="View CV">
                        <FileText size={14} className="sm:w-4 sm:h-4" />
                      </a>
                    )}
                    {app.status === 'pending' && (
                      <button onClick={() => approveFaculty(app.id)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-[0.1em] text-[8px] sm:text-[10px] flex items-center gap-1 sm:gap-2 shadow-md hover:-translate-y-0.5 transition-all">
                        <Check size={12} className="sm:w-3.5 sm:h-3.5" /> Verify
                      </button>
                    )}
                    <button onClick={() => confirmDelete(app.id)} className="p-2 sm:p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl shadow-sm">
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Compact Info Grid - Hidden on smallest mobile, shown from sm up */}
                <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: <Hospital size={10} />, label: "Org", value: app.org },
                    { icon: <Award size={10} />, label: "Speciality", value: app.speciality },
                    { icon: <Mail size={10} />, label: "Email", value: app.email },
                    { icon: <Phone size={10} />, label: "Mobile", value: app.mobileNumber },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">{item.icon} {item.label}</div>
                      <p className="font-bold text-slate-700 text-[10px] truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Bio Snippet - Compacted */}
                {app.bio && (
                  <div className="mt-3">
                    <p className="text-[10px] font-medium text-slate-500 line-clamp-1 italic text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-400">
                      "{app.bio}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => !isDeleting && setShowConfirmModal(false)}
        onConfirm={deleteFaculty}
        title="Delete Faculty Record?"
        message="Are you sure you want to permanently remove this faculty member? This will delete all associated data."
        isSubmitting={isDeleting}
      />
    </div>
  );
}

export default ManageFaculty;
