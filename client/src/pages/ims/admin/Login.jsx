import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../../context/AppContext';
import { toast } from 'react-toastify';
import { assets } from '../../../assets/assets';

const AdminLogin = () => {
  const { backendUrl, setAdminToken } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password });

      if (data.success) {
        setAdminToken(data.token);
        localStorage.setItem('adminToken', data.token);
        toast.success('Logged in successfully!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white'>
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className='max-w-[440px] w-full bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden relative z-10'>
        <div className='p-10 md:p-14'>
          <div className='flex flex-col items-center mb-12'>
            <div className="w-20 h-20 bg-slate-900 rounded-[28px] flex items-center justify-center mb-6 shadow-2xl shadow-slate-200">
               <img src="/logo.jpg" alt="Logo" className="w-12 h-12 " />
            </div>
            <h2 className='text-3xl font-black text-slate-800 tracking-tight'>Admin Core</h2>
            <p className='text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2'>Integrated Management System</p>
          </div>

          <form onSubmit={onSubmitHandler} className='space-y-6'>
            <div className="space-y-2">
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>Administrative ID</label>
              <input
                type='email'
                placeholder='email@physiocity'
                required
                className='w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-slate-700'
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div className="space-y-2">
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>Security Key</label>
              <input
                type='password'
                placeholder='••••••••'
                required
                className='w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-slate-700'
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>
            
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-[0.2em] py-5 rounded-2xl shadow-2xl shadow-slate-200 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3'
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                'Initialize Session'
              )}
            </button>
          </form>

          <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-10">
            Secure Encrypted Access • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
