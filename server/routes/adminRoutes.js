import express from 'express'
import { addCourse, addQuestion, adminDashboardData, deleteCourse, deleteCourseReview, getAdminCourses, getAdminData, getCourseById, getCourseEnrolledStudents, getEnrolledStudentsData, loginAdmin, updateCourse, updateAdminProfile, uploadImage, uploadVideo, getAllUsers, updateUserAccess, getUserActivity, getFacultyApplications, verifyFaculty, deleteFaculty, getVerifiedFaculty, getAllAdmins, addAdmin, removeAdmin } from '../controllers/adminController.js';
import { adminCreateEvent, adminUpdateEvent, adminDeleteEvent, getEventEnrollments, adminDeleteEnrollment } from '../controllers/eventController.js';
import { sendCertificates, verifyCertificate } from '../controllers/certificateController.js';
import upload from '../configs/multer.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const adminRouter = express.Router()

// Public Login
adminRouter.post('/login', loginAdmin)

// Protected Data
adminRouter.get('/data', protectAdmin, getAdminData)
adminRouter.patch('/update-profile', protectAdmin, updateAdminProfile)

// Access Control
adminRouter.get('/admins', protectAdmin, getAllAdmins)
adminRouter.post('/add-admin', protectAdmin, addAdmin)
adminRouter.delete('/remove-admin/:id', protectAdmin, removeAdmin)

// Protected Operations
adminRouter.post('/add-course', upload.single('image'), protectAdmin, addCourse)
adminRouter.get('/courses', protectAdmin, getAdminCourses)
adminRouter.get('/dashboard', protectAdmin, adminDashboardData)
adminRouter.get('/enrolled-students', protectAdmin, getEnrolledStudentsData)
adminRouter.post('/add-question', upload.single('image'), protectAdmin, addQuestion)
adminRouter.post('/send-certificates', protectAdmin, sendCertificates)
adminRouter.post('/upload-image', upload.single('image'), protectAdmin, uploadImage)
adminRouter.post('/upload-video', upload.single('lectureVideo'), protectAdmin, uploadVideo)
adminRouter.put('/update-course/:id', upload.single('image'), protectAdmin, updateCourse)
adminRouter.delete('/delete-course/:id', protectAdmin, deleteCourse)
adminRouter.get('/course-enrolled-students/:id', protectAdmin, getCourseEnrolledStudents)
adminRouter.get('/course/:id', protectAdmin, getCourseById)
adminRouter.post('/delete-review', protectAdmin, deleteCourseReview)
adminRouter.get('/verify-certificate/:id', verifyCertificate)
adminRouter.get('/verified-faculty', getVerifiedFaculty)

// User Management
adminRouter.get('/users', protectAdmin, getAllUsers)
adminRouter.get('/users/:userId/activity', protectAdmin, getUserActivity)
adminRouter.patch('/users/:userId/access', protectAdmin, updateUserAccess)

adminRouter.get('/faculty-applications', protectAdmin, getFacultyApplications)
adminRouter.post('/verify-faculty/:id', protectAdmin, verifyFaculty)
adminRouter.delete('/delete-faculty/:id', protectAdmin, deleteFaculty)

// Event Management
adminRouter.post('/add-event', upload.single('eventImage'), protectAdmin, adminCreateEvent)
adminRouter.put('/update-event/:id', upload.single('eventImage'), protectAdmin, adminUpdateEvent)
adminRouter.delete('/delete-event/:id', protectAdmin, adminDeleteEvent)
adminRouter.get('/event-enrollments/:id', protectAdmin, getEventEnrollments)
adminRouter.delete('/delete-enrollment/:id', protectAdmin, adminDeleteEnrollment)

export default adminRouter;
