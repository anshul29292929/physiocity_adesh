import Course from "../models/Course.js"
import { CourseProgress } from "../models/CourseProgress.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import Faculty from "../models/Faculty.js"
import Razorpay from "razorpay"
import crypto from "crypto"

// Get User Data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId
        const user = await User.findByPk(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Update User Bio
export const updateUserBio = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { bio } = req.body

        const user = await User.findByPk(userId)
        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        user.bio = bio
        await user.save()

        res.json({ success: true, message: 'Bio Updated Successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Purchase Course 
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const { origin } = req.headers
        const userId = req.auth.userId

        const courseData = await Course.findByPk(courseId)
        const userData = await User.findByPk(userId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' })
        }

        const purchaseData = {
            courseId: courseData.id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData)

        // Razorpay Gateway Initialize
        const razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const currency = process.env.CURRENCY || 'INR';

        const options = {
            amount: Math.round(Number(newPurchase.amount) * 100), // amount in the smallest currency unit
            currency,
            receipt: newPurchase.id.toString(),
        };

        const order = await razorpayInstance.orders.create(options);

        newPurchase.razorpayOrderId = order.id;
        await newPurchase.save();

        res.json({ success: true, order, purchaseId: newPurchase.id });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Verify Razorpay Payment
export const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.auth.userId;

        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        const hash = crypto
            .createHmac('sha256', key_secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (hash === razorpay_signature) {
            // Payment verified
            const purchaseData = await Purchase.findOne({ where: { razorpayOrderId: razorpay_order_id } });

            if (!purchaseData || purchaseData.status !== 'pending') {
                return res.json({ success: false, message: "Purchase Not Found or Already Processed" });
            }

            // Update Purchase Status
            purchaseData.status = 'completed';
            await purchaseData.save();

            // Enroll User in Course
            const userData = await User.findByPk(userId);
            const courseData = await Course.findByPk(purchaseData.courseId);

            if (userData && courseData) {
                // Add course to users enrolledCourses list
                let enrolledCourses = userData.enrolledCourses || [];
                if (typeof enrolledCourses === 'string') {
                    try { enrolledCourses = JSON.parse(enrolledCourses); } catch (e) { enrolledCourses = []; }
                }

                if (!enrolledCourses.includes(courseData.id)) {
                    userData.enrolledCourses = [...enrolledCourses, courseData.id];
                    await userData.save();
                }

                // Add user to course enrolledStudents list
                let enrolledStudents = courseData.enrolledStudents || [];
                if (typeof enrolledStudents === 'string') {
                    try { enrolledStudents = JSON.parse(enrolledStudents); } catch (e) { enrolledStudents = []; }
                }

                if (!enrolledStudents.includes(userId)) {
                    courseData.enrolledStudents = [...enrolledStudents, userId];
                    await courseData.save();
                }
            }

            res.json({ success: true, message: "Payment Verified & Enrolled Successfully" });
        } else {
            res.json({ success: false, message: "Payment Verification Failed" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId
        const userData = await User.findByPk(userId)

        if (!userData) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        // Handle JSON parsing if returned as string
        let enrolledCoursesIds = userData.enrolledCourses || [];
        if (typeof enrolledCoursesIds === 'string') {
            try {
                enrolledCoursesIds = JSON.parse(enrolledCoursesIds);
            } catch (e) {
                enrolledCoursesIds = [];
            }
        }

        const enrolledCourses = await Course.findAll({
            where: { id: enrolledCoursesIds }
        })

        const enrolledCoursesWithDates = await Promise.all(enrolledCourses.map(async (course) => {
            const purchase = await Purchase.findOne({
                where: {
                    userId: userId,
                    courseId: course.id,
                    status: 'completed'
                },
                order: [['createdAt', 'DESC']]
            });

            return {
                ...course.toJSON(),
                purchaseDate: purchase ? purchase.createdAt : null
            };
        }));

        res.json({ success: true, enrolledCourses: enrolledCoursesWithDates })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId, lectureId } = req.body

        let progressData = await CourseProgress.findOne({ where: { userId, courseId } })

        if (progressData) {
            const lectures = progressData.lectureCompleted || []
            if (lectures.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' })
            }

            progressData.lectureCompleted = [...lectures, lectureId]
            await progressData.save()

        } else {
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })
        }

        res.json({ success: true, message: 'Progress Updated' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// get User Course Progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId } = req.body

        const progressData = await CourseProgress.findOne({ where: { userId, courseId } })

        if (progressData && typeof progressData.lectureCompleted === 'string') {
            try {
                progressData.lectureCompleted = JSON.parse(progressData.lectureCompleted);
            } catch (e) {
                progressData.lectureCompleted = [];
            }
        }

        res.json({ success: true, progressData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Add User Ratings to Course
export const addUserRating = async (req, res) => {
    const userId = req.auth.userId;
    const { courseId, rating, comment } = req.body;

    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'InValid Details' });
    }

    try {
        const course = await Course.findByPk(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found.' });
        }

        const user = await User.findByPk(userId);
        const enrolledCourses = user.enrolledCourses || []

        if (!user || !enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' });
        }

        let ratings = course.courseRatings || []
        if (typeof ratings === 'string') {
            try { ratings = JSON.parse(ratings); } catch (e) { ratings = []; }
        }
        if (!Array.isArray(ratings)) ratings = [];

        const existingRatingIndex = ratings.findIndex(r => String(r.userId) === String(userId));

        if (existingRatingIndex > -1) {
            ratings[existingRatingIndex].rating = rating;
            if (comment !== undefined) ratings[existingRatingIndex].comment = comment;
            ratings[existingRatingIndex].updatedAt = new Date();
        } else {
            ratings.push({ 
                userId, 
                userName: user.name,
                userImage: user.imageUrl,
                rating, 
                comment: comment || "",
                createdAt: new Date()
            });
        }

        course.courseRatings = ratings
        await course.save();

        return res.json({ success: true, message: 'Rating added' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Enroll in a Free Course (0 price)
export const enrollFreeCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.auth.userId;

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course Not Found' });
        }

        // Check if course is actually free
        if (Number(course.coursePrice) > 0) {
            return res.json({ success: false, message: 'This course is not free.' });
        }

        const user = await User.findByPk(userId);
        let enrolledCourses = user.enrolledCourses || [];
        if (typeof enrolledCourses === 'string') {
            try { enrolledCourses = JSON.parse(enrolledCourses); } catch (e) { enrolledCourses = []; }
        }

        if (enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'Already Enrolled' });
        }

        // Add Course to User
        enrolledCourses.push(courseId);
        user.enrolledCourses = enrolledCourses;
        await user.save();

        // Add User to Course
        let enrolledStudents = course.enrolledStudents || [];
        if (typeof enrolledStudents === 'string') {
            try { enrolledStudents = JSON.parse(enrolledStudents); } catch (e) { enrolledStudents = []; }
        }
        enrolledStudents.push(userId);
        course.enrolledStudents = enrolledStudents;
        await course.save();

        // Create a mock Purchase record for consistency
        await Purchase.create({
            courseId,
            userId,
            amount: 0,
            status: 'completed',
            paymentId: 'FREE_ENROLL_' + Date.now()
        });

        res.json({ success: true, message: 'Enrolled Successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Handle Payment Failure
export const handlePaymentFailure = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body;
        if (!razorpay_order_id) {
            return res.json({ success: false, message: 'Order ID is required' });
        }

        const purchaseData = await Purchase.findOne({ where: { razorpayOrderId: razorpay_order_id } });

        if (purchaseData && purchaseData.status === 'pending') {
            purchaseData.status = 'failed';
            await purchaseData.save();
            return res.json({ success: true, message: 'Payment status updated to failed' });
        }

        res.json({ success: false, message: 'Purchase not found or already processed' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get specific course purchase status for user
export const getCoursePurchaseStatus = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId } = req.params;

        if (!courseId) {
            return res.json({ success: false, message: 'Course ID is required' });
        }

        // Find the most recent purchase attempt for this user and course
        const purchase = await Purchase.findOne({
            where: { userId, courseId },
            order: [['createdAt', 'DESC']]
        });

        if (!purchase) {
            return res.json({ success: true, status: 'none' });
        }

        return res.json({ success: true, status: purchase.status });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Apply for Faculty Position
export const applyFaculty = async (req, res) => {
    try {
        const { name, email, mobileNumber, role, org, speciality, experience, degrees, bio } = req.body;
        
        let imageUrl = '';
        let cvUrl = null;
        const baseUrl = process.env.BACKEND_URL || 'https://physiocity.org';

        if (req.files && req.files['facultyImage'] && req.files['facultyImage'].length > 0) {
            imageUrl = `${baseUrl}/uploads/faculty/${req.files['facultyImage'][0].filename}`;
        } else if (req.file) { // Fallback just in case
            imageUrl = `${baseUrl}/uploads/faculty/${req.file.filename}`;
        } else {
            return res.json({ success: false, message: "Faculty Image is required" });
        }

        if (req.files && req.files['cv'] && req.files['cv'].length > 0) {
            cvUrl = `${baseUrl}/uploads/faculty/${req.files['cv'][0].filename}`;
        }

        // Parse degrees if it's sent as a stringified array from FormData
        let parsedDegrees = [];
        try {
            parsedDegrees = typeof degrees === 'string' ? JSON.parse(degrees) : degrees;
        } catch (e) {
            parsedDegrees = typeof degrees === 'string' ? degrees.split(',').map(d => d.trim()) : [];
        }

        const facultyData = {
            name,
            email,
            mobileNumber,
            role,
            org,
            speciality,
            experience,
            degrees: parsedDegrees,
            bio,
            image: imageUrl,
            cv: cvUrl,
            status: 'pending' // Initially pending
        };

        await Faculty.create(facultyData);

        res.json({ success: true, message: 'Faculty Application Submitted Successfully. Awaiting admin review.' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Verified Faculty for Frontend Display
export const getVerifiedFaculty = async (req, res) => {
    try {
        const facultyList = await Faculty.findAll({
            where: { status: 'verified' },
            order: [['createdAt', 'ASC']]
        });
        
        res.json({ success: true, faculty: facultyList });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
