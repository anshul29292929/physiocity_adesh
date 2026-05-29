import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, MapPin, Plus, Edit, Trash2, Users, ExternalLink, Image as ImageIcon, XCircle, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../../../components/ims/admin/ConfirmationModal';

const AdminEvents = () => {
  const { backendUrl, adminToken } = useContext(AppContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    googleMeetLink: '',
    googleMapsLink: '',
    location: '',
    type: 'online',
    priceType: 'free',
    price: 0,
    whatsappGroupLink: '',
    status: 'upcoming',
    featured: false
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/events/all');
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate || event.date,
      endDate: event.endDate || '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      googleMeetLink: event.googleMeetLink || '',
      googleMapsLink: event.googleMapsLink || '',
      location: event.location,
      type: event.type,
      priceType: event.priceType,
      price: event.price,
      whatsappGroupLink: event.whatsappGroupLink || '',
      status: event.status,
      featured: event.featured
    });
    setCurrentEventId(event.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    if (!deletingId || isDeleting) return;
    setIsDeleting(true);
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/delete-event/${deletingId}`, {
        headers: { admintoken: adminToken }
      });
      if (data.success) {
        toast.success(data.message);
        fetchEvents();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    dataToSend.append('eventData', JSON.stringify(formData));
    if (imageFile) {
      dataToSend.append('eventImage', imageFile);
    }

    try {
      let response;
      if (isEditing) {
        response = await axios.put(`${backendUrl}/api/admin/update-event/${currentEventId}`, dataToSend, {
          headers: { admintoken: adminToken }
        });
      } else {
        response = await axios.post(`${backendUrl}/api/admin/add-event`, dataToSend, {
          headers: { admintoken: adminToken }
        });
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setShowModal(false);
        resetForm();
        fetchEvents();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      googleMeetLink: '',
      googleMapsLink: '',
      location: '',
      type: 'online',
      priceType: 'free',
      price: 0,
      whatsappGroupLink: '',
      status: 'upcoming',
      featured: false
    });
    setImageFile(null);
    setIsEditing(false);
    setCurrentEventId(null);
  };

  return (
    <div data-lenis-prevent className="p-8 pb-32 h-full overflow-y-auto bg-slate-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 mb-2">Event Management</h1>
          <p className="text-slate-500 text-sm">Create and organize your workshops, webinars, and live sessions.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={20} /> Create New Event
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">Loading events...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
              <div className="relative h-48">
                <img 
                  src={event.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600"} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleEdit(event)} className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-slate-900 hover:bg-primary hover:text-white transition-all">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => confirmDelete(event.id)} className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-4 left-6">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${event.status === 'live' ? 'bg-red-500 text-white' : 'bg-white/20 text-white backdrop-blur-md border border-white/20'}`}>
                    {event.status}
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{event.title}</h3>
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Calendar size={14} className="text-slate-300" /> 
                    {event.startDate ? (
                      <>
                        {new Date(event.startDate).toLocaleDateString('en-GB')}
                        {event.endDate && event.endDate !== event.startDate && ` - ${new Date(event.endDate).toLocaleDateString('en-GB')}`}
                      </>
                    ) : new Date(event.date).toLocaleDateString('en-GB')}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <MapPin size={14} className="text-primary" /> {event.location}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <Link 
                    to={`/admin/event-enrollments/${event.id}`}
                    className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
                  >
                    View Enrollments <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div data-lenis-prevent className="fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 md:p-10 pointer-events-auto">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl relative h-fit m-auto">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-primary/5">
              <h2 className="text-2xl font-bold text-slate-900">{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <XCircle size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Event Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm"
                    placeholder="e.g. Advanced Manual Therapy Workshop"
                  />
                </div>

                <div className="col-span-full">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
                  <textarea 
                    rows="4"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm resize-none"
                    placeholder="Detail what this event is about..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">End Date (Optional)</label>
                  <input 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Start Time</label>
                  <input 
                    type="time" 
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">End Time</label>
                  <input 
                    type="time" 
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Event Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent outline-none text-sm"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Location Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm"
                    placeholder="e.g. Mumbai / Zoom"
                  />
                </div>

                {formData.type === 'online' ? (
                  <div className="col-span-full">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block text-primary">Google Meet Link</label>
                    <input 
                      type="text" 
                      value={formData.googleMeetLink}
                      onChange={(e) => setFormData({...formData, googleMeetLink: e.target.value})}
                      className="w-full px-6 py-4 bg-primary/5 rounded-2xl border-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                ) : (
                  <div className="col-span-full">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block text-primary">Google Maps Location Link</label>
                    <input 
                      type="text" 
                      value={formData.googleMapsLink}
                      onChange={(e) => setFormData({...formData, googleMapsLink: e.target.value})}
                      className="w-full px-6 py-4 bg-primary/5 rounded-2xl border-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm"
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Price Type</label>
                  <select 
                    value={formData.priceType}
                    onChange={(e) => setFormData({...formData, priceType: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent outline-none text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Price (₹)</label>
                  <input 
                    type="number" 
                    disabled={formData.priceType === 'free'}
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm disabled:opacity-50"
                  />
                </div>

                <div className="col-span-full">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">WhatsApp Group Link</label>
                  <input 
                    type="text" 
                    value={formData.whatsappGroupLink}
                    onChange={(e) => setFormData({...formData, whatsappGroupLink: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm"
                    placeholder="https://chat.whatsapp.com/..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-transparent outline-none text-sm"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="past">Past</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Event Image</label>
                  <label className="flex items-center gap-4 cursor-pointer">
                    <div className="w-full flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-100/50 transition-all">
                      <ImageIcon className="text-slate-400" size={20} />
                      <span className="text-sm text-slate-500">{imageFile ? imageFile.name : 'Upload Event Banner'}</span>
                    </div>
                    <input type="file" hidden accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  {isEditing ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => !isDeleting && setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Delete Event?"
        message="Are you sure you want to delete this event? This will remove all associated data and cannot be undone."
        isSubmitting={isDeleting}
      />
    </div>
  );
};

export default AdminEvents;
