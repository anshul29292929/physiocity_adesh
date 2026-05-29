import React, { useContext } from 'react';
import { assets } from '../../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../../../context/AppContext';
import { GoogleLogin } from '@react-oauth/google';

const Navbar = () => {

  const location = useLocation();
  const { navigate, isAdmin, userData, googleAuthLogin, logout } = useContext(AppContext);

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${location.pathname.includes('/course-list') ? 'bg-white' : 'bg-cyan-100/70'}`}>
      <img onClick={() => navigate('/')} src="/logo.jpg" alt="Logo" className="w-28 lg:w-32 cursor-pointer rounded-lg" />
      <div className="md:flex hidden items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">
          {userData &&
            <>
              {isAdmin && <button onClick={() => navigate('/admin')} >Admin Dashboard</button>}
              <Link to='/my-enrollments' >My Enrollments</Link>
            </>
          }
        </div>
        {userData ?
          <div className='flex items-center gap-3'>
            <img src={userData.imageUrl} alt="User" className='w-10 h-10 rounded-full' />
            <button onClick={logout} className='bg-blue-600 text-white px-5 py-2 rounded-full'>Logout</button>
          </div>
          :
          <GoogleLogin
            onSuccess={credentialResponse => {
              googleAuthLogin(credentialResponse.credential);
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />
        }
      </div>
      {/* Mobile Menu */}
      <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
        <div className='flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
          {userData &&
            <>
              {isAdmin && <button onClick={() => navigate('/admin')} >Admin Dashboard</button>}
              <Link to='/my-enrollments' >My Enrollments</Link>
            </>
          }
        </div>
        {userData ?
          <div className='flex items-center gap-3'>
            <img src={userData.imageUrl} alt="User" className='w-8 h-8 rounded-full' />
            <button onClick={logout} className='bg-blue-600 text-white px-4 py-1 rounded-full text-xs'>Logout</button>
          </div>
          :
          <GoogleLogin
            onSuccess={credentialResponse => {
              googleAuthLogin(credentialResponse.credential);
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />
        }
      </div>
    </div>
  );
};

export default Navbar;