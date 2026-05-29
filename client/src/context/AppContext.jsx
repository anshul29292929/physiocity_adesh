import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || ''
    const backendUrl = rawBackendUrl.endsWith('/api') ? rawBackendUrl.slice(0, -4) : rawBackendUrl
    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    const [showLogin, setShowLogin] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [allCourses, setAllCourses] = useState([])
    const [userData, setUserData] = useState(null)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [enrolledEvents, setEnrolledEvents] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') || '')

    // Admin Auth State
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '')
    const [adminData, setAdminData] = useState(null)
    const [activeModule, setActiveModule] = useState('general')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Fetch All Courses
    const fetchAllCourses = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/course/all');
            if (data.success) {
                setAllCourses(data.courses)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Fetch UserData 
    const fetchUserData = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(backendUrl + '/api/user/data',
                { headers: { token } })

            if (data.success) {
                setUserData(data.user)
                if (data.user.role === 'admin') {
                    setIsAdmin(true)
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error(error.message)
        }
    }

    // Fetch Admin Data
    const fetchAdminData = async () => {
        if (!adminToken) return;
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/data', {
                headers: { admintoken: adminToken }
            });
            if (data.success) {
                setAdminData(data.admin);
            } else {
                toast.error(data.message);
                setAdminToken('');
                localStorage.removeItem('adminToken');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };


    // Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',
                { headers: { token } })

            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Fetch User Enrolled Events
    const fetchUserEnrolledEvents = async () => {
        if (!token || !userData) return;
        try {
            const { data } = await axios.post(backendUrl + '/api/events/my-enrollments',
                { userId: userData.id },
                { headers: { token } })

            if (data.success) {
                setEnrolledEvents(data.enrollments)
            }
        } catch (error) {
            console.error("Error fetching enrolled events:", error);
        }
    }

    // Google Login Function
    const googleAuthLogin = async (googleToken, redirectTo = '/') => {
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/google', { token: googleToken });
            if (data.success) {
                setToken(data.token);
                localStorage.setItem('token', data.token);
                setUserData(data.user);
                toast.success('Logged in successfully!');
                navigate(redirectTo);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Logout Function
    const logout = () => {
        setToken('');
        localStorage.removeItem('token');
        setUserData(null);
        setIsAdmin(false);
        navigate('/');
    }

    // Admin Logout
    const adminLogout = () => {
        setAdminToken('');
        localStorage.removeItem('adminToken');
        setAdminData(null);
        navigate('/admin');
    }

    // getToken helper used by Player.jsx and MyEnrollments.jsx
    const getToken = async () => token;

    // Function to Calculate Course Chapter Time
    const calculateChapterTime = (chapter) => {
        let time = 0
        if (Array.isArray(chapter.chapterContent)) {
            chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        }
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
    }

    // Function to Calculate Course Duration
    const calculateCourseDuration = (course) => {
        let time = 0
        if (Array.isArray(course.courseContent)) {
            course.courseContent.map(
                (chapter) => {
                    if (Array.isArray(chapter.chapterContent)) {
                        chapter.chapterContent.map(
                            (lecture) => time += lecture.lectureDuration
                        )
                    }
                }
            )
        }
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
    }

    const calculateRating = (course) => {
        let ratings = course.courseRatings || [];
        if (typeof ratings === 'string') {
            try { ratings = JSON.parse(ratings); } catch (e) { ratings = []; }
        }
        if (!Array.isArray(ratings) || ratings.length === 0) {
            return 0
        }
        let totalRating = 0
        ratings.forEach(rating => {
            totalRating += rating.rating
        })
        return Math.ceil(totalRating / ratings.length)
    }

    const calculateNoOfRatings = (course) => {
        let ratings = course.courseRatings || [];
        if (typeof ratings === 'string') {
            try { ratings = JSON.parse(ratings); } catch (e) { ratings = []; }
        }
        return Array.isArray(ratings) ? ratings.length : 0;
    }

    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        if (Array.isArray(course.courseContent)) {
            course.courseContent.forEach(chapter => {
                if (Array.isArray(chapter.chapterContent)) {
                    totalLectures += chapter.chapterContent.length;
                }
            });
        }
        return totalLectures;
    }

    const calculateDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
    }

    useEffect(() => {
        fetchAllCourses()
    }, [])

    useEffect(() => {
        if (token) {
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    }, [token])

    useEffect(() => {
        if (userData) {
            fetchUserEnrolledEvents()
        }
    }, [userData])

    useEffect(() => {
        if (adminToken) {
            fetchAdminData()
        }
    }, [adminToken])

    const value = {
        showLogin, setShowLogin,
        backendUrl, currency, navigate,
        userData, setUserData, fetchUserData, token, setToken,
        googleAuthLogin, logout, getToken,
        allCourses, fetchAllCourses,
        enrolledCourses, fetchUserEnrolledCourses,
        enrolledEvents, fetchUserEnrolledEvents,
        calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfRatings, calculateNoOfLectures, calculateDate,
        isAdmin, setIsAdmin,
        adminToken, setAdminToken, adminData, setAdminData, adminLogout,
        activeModule, setActiveModule,
        isSidebarOpen, setIsSidebarOpen
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider
