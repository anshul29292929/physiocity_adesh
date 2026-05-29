import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import { Lock, Mail, ShieldCheck, Eye, EyeOff, Save, Users, UserPlus, Trash2 } from "lucide-react";

const AdminSettings = () => {
  const { backendUrl, adminToken, adminData } = useContext(AppContext);
  
  // Profile Update State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newEmail: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Access Management State
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "" });
  const [showNewAdminPwd, setShowNewAdminPwd] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleNewAdminChange = (e) => setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });

  const fetchAdmins = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/admins`, { headers: { admintoken: adminToken } });
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [adminToken]);

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (!form.currentPassword) return toast.error("Current password is required");
    if (form.newPassword && form.newPassword !== form.confirmPassword)
      return toast.error("New passwords do not match");
    if (!form.newEmail && !form.newPassword)
      return toast.error("Enter a new email or new password to update");

    setIsSubmitting(true);
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/admin/update-profile`,
        {
          currentPassword: form.currentPassword,
          newEmail: form.newEmail || undefined,
          newPassword: form.newPassword || undefined,
        },
        { headers: { admintoken: adminToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setForm({ currentPassword: "", newEmail: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Update failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.password) return toast.error("Email and password required.");
    setIsAddingAdmin(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/add-admin`, newAdmin, { headers: { admintoken: adminToken } });
      if (data.success) {
        toast.success(data.message);
        setNewAdmin({ email: "", password: "" });
        fetchAdmins();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to add admin.");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRevokeAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this admin's access? This action cannot be undone.")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/remove-admin/${id}`, { headers: { admintoken: adminToken } });
      if (data.success) {
        toast.success(data.message);
        fetchAdmins();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to revoke admin access.");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 flex flex-col xl:flex-row gap-8 items-start">
      <div className="w-full xl:w-1/2 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Settings</h1>
          <p className="text-gray-500 mt-1">Update your login credentials securely.</p>
        </div>

        {/* Current Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
            <ShieldCheck size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Logged in as</p>
            <p className="font-bold text-gray-800 text-sm">{adminData?.email || "admin@physiocity.com"}</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmitProfile} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Current Password *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  required
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-blue-100 text-gray-800"
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <hr className="border-gray-50" />

            {/* New Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                New Email / Username
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  name="newEmail"
                  value={form.newEmail}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-blue-100 text-gray-800"
                  placeholder="Leave blank to keep current email"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-blue-100 text-gray-800"
                  placeholder="Leave blank to keep current password"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            {form.newPassword && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border outline-none focus:ring-2 focus:ring-blue-100 text-gray-800 ${
                      form.confirmPassword && form.newPassword !== form.confirmPassword
                        ? "border-red-200 focus:ring-red-100"
                        : "border-gray-100"
                    }`}
                    placeholder="Repeat new password"
                  />
                </div>
                {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                  <p className="text-xs text-red-500 font-bold mt-1.5 ml-1">Passwords do not match</p>
                )}
              </div>
            )}

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 shadow-lg shadow-blue-600/20"
            >
              <Save size={18} />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>

      {/* Manage Access Column */}
      <div className="w-full xl:w-1/2 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Access</h1>
          <p className="text-gray-500 mt-1">Add or remove administrative access to this platform.</p>
        </div>

        {/* Add Admin Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-blue-600" /> Grant Access
          </h3>
          <form onSubmit={handleAddAdmin} className="flex flex-col gap-4 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={newAdmin.email}
                  onChange={handleNewAdminChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-800"
                  placeholder="New Admin Email"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNewAdminPwd ? "text" : "password"}
                  name="password"
                  required
                  value={newAdmin.password}
                  onChange={handleNewAdminChange}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-800"
                  placeholder="Initial Password"
                />
                <button type="button" onClick={() => setShowNewAdminPwd(!showNewAdminPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                  {showNewAdminPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button
              disabled={isAddingAdmin}
              type="submit"
              className="py-3 px-6 bg-slate-900 self-end text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md disabled:opacity-50"
            >
              {isAddingAdmin ? "Adding..." : "Add Administrator"}
            </button>
          </form>
        </div>

        {/* Active Admins List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50">
             <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Users size={16} className="text-blue-600" /> Active Administrators
             </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {admins.map((admin) => (
               <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                 <div className="flex flex-col">
                   <span className="font-bold text-sm text-gray-800">{admin.email}</span>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Admin ID: {admin.id}</span>
                 </div>
                 {admin.email === adminData?.email ? (
                   <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-lg">You</span>
                 ) : (
                   <button 
                     onClick={() => handleRevokeAdmin(admin.id)}
                     className="p-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                     title="Revoke Access"
                   >
                     <Trash2 size={16} />
                   </button>
                 )}
               </div>
            ))}
            {admins.length === 0 && (
               <div className="p-8 text-center text-gray-400 text-sm font-bold">No other admins found.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
