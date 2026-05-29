import React, { useContext, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../../../components/ims/admin/SideBar'
import Navbar from '../../../components/ims/admin/Navbar'
import Footer from '../../../components/ims/admin/Footer'
import { AppContext } from '../../../context/AppContext'
import AdminLogin from './Login'

const Admin = () => {

    const { adminToken } = useContext(AppContext)

    useEffect(() => {
        document.title = "Physiocity Admin"
    }, [])

    return adminToken ? (
        <div className="text-default min-h-screen bg-white">
            <Navbar />
            <div className='flex'>
                <SideBar />
                <div className='flex-1'>
                    <Outlet />
                </div>
            </div>
            <Footer />
        </div>
    ) : <AdminLogin />
}

export default Admin