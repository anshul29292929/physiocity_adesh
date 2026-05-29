import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { assets } from '../../../assets/assets';
import { AppContext } from '../../../context/AppContext';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../../components/ims/student/Loading';

const StudentsEnrolled = () => {

  const { id } = useParams()
  const { backendUrl, adminToken, calculateDate } = useContext(AppContext)

  const [enrolledStudents, setEnrolledStudents] = useState(null)

  const fetchEnrolledStudents = async () => {
    try {
      const endpoint = id 
        ? `${backendUrl}/api/admin/course-enrolled-students/${id}`
        : `${backendUrl}/api/admin/enrolled-students`;
        
      const { data } = await axios.get(endpoint, { headers: { admintoken: adminToken } })

      if (data.success) {
        if (id) {
          // If specific course, the API returns { success: true, students: [...] }
          // We need to map it to the same format as the general list for the table 
          setEnrolledStudents(data.students.map(s => ({ ...s, student: s, isSpecific: true })))
        } else {
          setEnrolledStudents(data.enrolledStudents.reverse())
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (adminToken) {
      fetchEnrolledStudents()
    }
  }, [adminToken])

  return enrolledStudents ? (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20 ">
        <table className="table-fixed md:table-auto w-full overflow-hidden pb-4">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
              <th className="px-4 py-3 font-semibold">Student Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              {!id && <th className="px-4 py-3 font-semibold">Course Title</th>}
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-500">
            {enrolledStudents.map((item, index) => (
              <tr key={index} className="border-b border-gray-500/20">
                <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                  <img
                    src={item.student.imageUrl || assets.user_icon}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className='flex flex-col'>
                    <span className="truncate font-medium text-slate-900">{item.student.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{item.student.email}</td>
                {!id && <td className="px-4 py-3 truncate">{item.courseTitle}</td>}
                <td className="px-4 py-3 hidden sm:table-cell">
                  {calculateDate(item.purchaseDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : <Loading />
};

export default StudentsEnrolled;