import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, User, Mail, Calendar, Download, 
  Search, Filter, Users as UsersIcon, Trash2,
  AlertTriangle, X, Check
} from 'lucide-react';
import ConfirmationModal from '../../../components/ims/admin/ConfirmationModal';
import * as XLSX from 'xlsx';

const EventEnrollments = () => {
  const { id } = useParams();
  const { backendUrl, adminToken } = useContext(AppContext);
  const [enrollments, setEnrollments] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [enrollRes, eventRes] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/event-enrollments/${id}`, { headers: { admintoken: adminToken } }),
        axios.get(`${backendUrl}/api/events/${id}`)
      ]);

      if (enrollRes.data.success) setEnrollments(enrollRes.data.enrollments);
      if (eventRes.data.success) setEvent(eventRes.data.event);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const handleDeleteEnrollment = async () => {
    if (!deletingId || isDeleting) return;
    setIsDeleting(true);
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/delete-enrollment/${deletingId}`, {
        headers: { admintoken: adminToken }
      });
      if (data.success) {
        toast.success(data.message);
        setEnrollments(prev => prev.filter(e => e.id !== deletingId));
        setShowConfirmModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const exportToExcel = () => {
    const data = filteredEnrollments.map((e, index) => ({
      'S.No': index + 1,
      'Name': e.name,
      'Email': e.email,
      'Enrollment Date': new Date(e.createdAt).toLocaleDateString('en-GB'),
      'Type': e.userId ? 'Registered User' : 'Guest'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enrollments");
    XLSX.writeFile(wb, `${event?.title || 'Event'}_Enrollments.xlsx`);
  };

  if (loading) return <div className="p-8">Loading enrollments...</div>;

  return (
    <div data-lenis-prevent className="p-8 pb-32 h-full overflow-y-auto bg-slate-50/50">
      <Link to="/admin/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm uppercase tracking-widest mb-8 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to events
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 mb-2">Candidates Enrolled</h1>
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span className="flex items-center gap-1.5 font-medium"><Calendar size={14} className="text-primary" /> {event?.title}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5 font-medium"><UsersIcon size={14} className="text-primary" /> {enrollments.length} Total</span>
          </div>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <Download size={18} /> Export List
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl text-sm transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollment Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEnrollments.map((enrollee) => (
                <tr key={enrollee.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {enrollee.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{enrollee.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Mail size={14} className="text-slate-300" /> {enrollee.email}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-medium">
                    {new Date(enrollee.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${enrollee.userId ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
                      {enrollee.userId ? 'Registered User' : 'Guest'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => confirmDelete(enrollee.id)}
                      className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Remove Candidate"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEnrollments.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-slate-400 italic">
                    No candidates found matches your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => !isDeleting && setShowConfirmModal(false)}
        onConfirm={handleDeleteEnrollment}
        title="Remove Candidate?"
        message="Are you sure you want to permanently remove this candidate from this event's enrollment list? This action cannot be undone."
        isSubmitting={isDeleting}
      />
    </div>
  );
};

export default EventEnrollments;
