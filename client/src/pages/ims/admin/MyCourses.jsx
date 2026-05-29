import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../../components/ims/student/Loading';
import { Edit, Trash2, Users, ExternalLink, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../../components/ims/admin/ConfirmationModal';

const MyCourses = () => {

  const { backendUrl, adminToken, currency } = useContext(AppContext)
  const navigate = useNavigate()

  const [courses, setCourses] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAdminCourses = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/courses', { headers: { admintoken: adminToken } })
      data.success && setCourses(data.courses)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const deleteCourse = async () => {
    if (!deletingId || isDeleting) return;
    setIsDeleting(true);
    try {
      const { data } = await axios.delete(backendUrl + `/api/admin/delete-course/${deletingId}`, { headers: { admintoken: adminToken } })
      if (data.success) {
        toast.success(data.message)
        fetchAdminCourses()
        setShowConfirmModal(false);
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  }

  useEffect(() => {
    if (adminToken) {
      fetchAdminCourses()
    }
  }, [adminToken])

  return courses ? (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className='w-full'>
        <h2 className="pb-4 text-lg font-medium">My Courses</h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">All Courses</th>
                <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                <th className="px-4 py-3 font-semibold truncate">Students</th>
                <th className="px-4 py-3 font-semibold truncate">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <img src={course.courseThumbnail} alt="Course Image" className="w-16" />
                    <span className="truncate hidden md:block">{course.courseTitle}</span>
                  </td>
                  <td className="px-4 py-3">{currency} {Math.floor((Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0) * (course.coursePrice - course.discount * course.coursePrice / 100))}</td>
                  <td className="px-4 py-3 text-center">{Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0}</td>
                  <td className="px-4 py-3">
                    <div className='flex items-center gap-3'>
                      <button 
                        onClick={() => navigate(`/admin/edit-course/${course.id}`)}
                        className='p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors'
                        title="Edit Course"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/students-enrolled/${course.id}`)}
                        className='p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors'
                        title="View Students"
                      >
                        <Users size={18} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(course.id)}
                        className='p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors'
                        title="Delete Course"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
    {/* Confirmation Modal */}
    <ConfirmationModal 
      isOpen={showConfirmModal}
      onClose={() => !isDeleting && setShowConfirmModal(false)}
      onConfirm={deleteCourse}
      title="Delete Course?"
      message="Are you sure you want to delete this course? This will remove all associated content and data permanently."
      isSubmitting={isDeleting}
    />
  </div>
  ) : <Loading />
};

export default MyCourses;