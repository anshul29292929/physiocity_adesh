import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../context/AppContext'
import axios from 'axios'
import { Line } from 'rc-progress';
import { toast } from 'react-toastify'

const MyEnrollments = () => {

    const { userData, enrolledCourses, fetchUserEnrolledCourses, navigate, backendUrl, getToken, calculateCourseDuration, calculateNoOfLectures } = useContext(AppContext)

    const [progressArray, setProgressData] = useState([])

    const getCourseProgress = async () => {
        try {
            const token = await getToken();

            // Use Promise.all to handle multiple async operations
            const tempProgressArray = await Promise.all(
                enrolledCourses.map(async (course) => {
                    const { data } = await axios.post(
                        `${backendUrl}/api/user/get-course-progress`,
                        { courseId: course.id },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    // Calculate total lectures
                    let totalLectures = calculateNoOfLectures(course);

                    const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0;
                    return { totalLectures, lectureCompleted };
                })
            );

            setProgressData(tempProgressArray);
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (userData) {
            fetchUserEnrolledCourses()
        }
    }, [userData])

    useEffect(() => {

        if (enrolledCourses.length > 0) {
            getCourseProgress()
        }

    }, [enrolledCourses])

    return (
        <>

            <div className='md:px-36 px-8 pt-32 pb-16 min-h-screen'>

                <h1 className='text-3xl font-heading font-bold text-slate-900'>My Enrollments</h1>

                <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10 rounded-2xl shadow-sm bg-white text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-sm">
                        <tr>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs truncate">Course</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs truncate max-sm:hidden">Duration</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs truncate max-sm:hidden">Progress</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs truncate max-sm:hidden">Enrolled On</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs truncate text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {enrolledCourses.map((course, index) => (
                            <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                <td className="md:px-6 pl-4 md:pl-6 py-4 flex items-center space-x-4">
                                    <img src={course.courseThumbnail} alt="" className="w-16 sm:w-24 md:w-32 rounded-xl object-cover shadow-sm" />
                                    <div className='flex-1 min-w-0'>
                                        <p className='mb-2 font-bold text-slate-800 max-sm:text-sm line-clamp-2'>{course.courseTitle}</p>
                                        <div className="flex items-center gap-3">
                                           <div className="flex-1 max-w-[200px]">
                                              <Line className='bg-slate-100 rounded-full' strokeColor="#2563eb" trailColor="#f1f5f9" strokeWidth={4} percent={progressArray[index] ? (progressArray[index].lectureCompleted * 100) / progressArray[index].totalLectures : 0} />
                                           </div>
                                           <span className="text-xs font-bold text-slate-400">
                                              {Math.round(progressArray[index] ? (progressArray[index].lectureCompleted * 100) / progressArray[index].totalLectures : 0)}%
                                           </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-600 max-sm:hidden">{calculateCourseDuration(course)}</td>
                                <td className="px-6 py-4 font-medium text-slate-600 max-sm:hidden">
                                     {progressArray[index] && `${progressArray[index].lectureCompleted} / ${progressArray[index].totalLectures}`}
                                     <span className='text-xs ml-1 text-slate-400 uppercase tracking-wider'>Lectures</span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-600 max-sm:hidden whitespace-nowrap">
                                    {course.purchaseDate ? new Date(course.purchaseDate).toLocaleDateString('en-GB') : 'N/A'}
                                </td>
                                <td className="px-6 py-4 max-sm:text-right text-right">
                                    <button onClick={() => navigate('/player/' + course.id)} className='px-6 py-2.5 bg-primary hover:bg-primary/90 transition-colors rounded-xl font-bold max-sm:text-xs text-white shadow-lg shadow-primary/20'>
                                        {progressArray[index] && progressArray[index].lectureCompleted / progressArray[index].totalLectures === 1 ? 'Completed' : 'Continue'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

        </>
    )
}

export default MyEnrollments