import express from 'express'
import { addUserRating, enrollFreeCourse, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourses, verifyRazorpay, updateUserBio, handlePaymentFailure, getCoursePurchaseStatus, applyFaculty, getVerifiedFaculty } from '../controllers/userController.js';
import userAuth from '../middlewares/userAuth.js';
import upload from '../configs/multer.js';

const userRouter = express.Router()

// Get user Data
userRouter.get('/data', userAuth, getUserData)
userRouter.post('/purchase', userAuth, purchaseCourse)
userRouter.post('/verify-razorpay', userAuth, verifyRazorpay)
userRouter.post('/payment-failed', userAuth, handlePaymentFailure)
userRouter.get('/purchase-status/:courseId', userAuth, getCoursePurchaseStatus)
userRouter.get('/enrolled-courses', userAuth, userEnrolledCourses)
userRouter.post('/update-course-progress', userAuth, updateUserCourseProgress)
userRouter.post('/get-course-progress', userAuth, getUserCourseProgress)
userRouter.post('/add-rating', userAuth, addUserRating)
userRouter.post('/enroll-free', userAuth, enrollFreeCourse)
userRouter.patch('/update-bio', userAuth, updateUserBio)

// Faculty Routes
userRouter.get('/faculty', getVerifiedFaculty)
userRouter.post('/apply-faculty', upload.fields([{ name: 'facultyImage', maxCount: 1 }, { name: 'cv', maxCount: 1 }]), applyFaculty)

export default userRouter;