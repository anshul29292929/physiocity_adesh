import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path'
import Course from '../models/Course.js';
import Question from '../models/Question.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import Faculty from '../models/Faculty.js'
import { CourseProgress } from '../models/CourseProgress.js';
import EventEnrollment from '../models/EventEnrollment.js';

// Helper to delete local files safely
const deleteLocalFile = (fileUrl) => {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
    try {
        const filename = fileUrl.split('/').pop();
        const folder = fileUrl.split('/')[2]; // e.g. 'videos', 'questions'
        const filePath = path.join('uploads', folder, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted local file: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error deleting file ${fileUrl}:`, err.message);
    }
};

// Helper to get all local videos from courseContent
const getLocalVideosFromContent = (content) => {
    const urls = [];
    if (!content) return urls;
    const chapters = typeof content === 'string' ? JSON.parse(content) : content;
    if (Array.isArray(chapters)) {
        chapters.forEach(chapter => {
            const lectures = typeof chapter.chapterContent === 'string' ? JSON.parse(chapter.chapterContent) : chapter.chapterContent;
            if (Array.isArray(lectures)) {
                lectures.forEach(lecture => {
                    if (lecture.lectureUrl && lecture.lectureUrl.startsWith('/uploads/videos/')) {
                        urls.push(lecture.lectureUrl);
                    }
                });
            }
        });
    }
    return urls;
};

// Admin Login
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        const admin = await Admin.findOne({ where: { email } })

        if (!admin) {
            return res.json({ success: false, message: 'Invalid Credentials' })
        }

        const isMatch = await bcrypt.compare(password, admin.password)

        if (isMatch) {
            const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: 'Invalid Credentials' })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Admin Data
export const getAdminData = async (req, res) => {
    try {
        const adminId = req.auth.adminId
        const admin = await Admin.findByPk(adminId, { attributes: { exclude: ['password'] } })

        if (admin) {
            res.json({ success: true, admin })
        } else {
            res.json({ success: false, message: 'Admin not found' })
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get All Admins
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll({ attributes: { exclude: ['password'] } });
        res.json({ success: true, admins });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Add New Admin
export const addAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.json({ success: false, message: 'Email and password required' });
        if (password.length < 6) return res.json({ success: false, message: 'Password must be at least 6 characters' });

        const exists = await Admin.findOne({ where: { email } });
        if (exists) return res.json({ success: false, message: 'Admin with this email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await Admin.create({ email, password: hashedPassword });
        
        res.json({ success: true, message: 'Admin access granted successfully', admin: { id: newAdmin.id, email: newAdmin.email } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Remove Admin
export const removeAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const requestingAdminId = req.auth.adminId;

        if (String(id) === String(requestingAdminId)) {
            return res.json({ success: false, message: 'You cannot remove your own admin account.' });
        }

        const admin = await Admin.findByPk(id);
        if (!admin) return res.json({ success: false, message: 'Admin not found.' });

        if (admin.email === 'admin@physiocity') {
            return res.json({ success: false, message: 'Super Admin account cannot be removed.' });
        }

        await admin.destroy();
        res.json({ success: true, message: 'Admin access revoked successfully.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Update Admin Profile (email / password)
export const updateAdminProfile = async (req, res) => {
    try {
        const adminId = req.auth.adminId;
        const { currentPassword, newEmail, newPassword } = req.body;

        const admin = await Admin.findByPk(adminId);
        if (!admin) return res.json({ success: false, message: 'Admin not found' });

        // Always verify the current password before any change
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) return res.json({ success: false, message: 'Current password is incorrect' });

        if (newEmail && newEmail !== admin.email) {
            const exists = await Admin.findOne({ where: { email: newEmail } });
            if (exists) return res.json({ success: false, message: 'Email already in use' });
            admin.email = newEmail;
        }

        if (newPassword) {
            if (newPassword.length < 6) return res.json({ success: false, message: 'New password must be at least 6 characters' });
            admin.password = await bcrypt.hash(newPassword, 10);
        }

        await admin.save();
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add New Course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const adminId = req.auth.adminId

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' })
        }

        const parsedCourseData = JSON.parse(courseData)
        parsedCourseData.educator = String(adminId) // Maintain the link to the admin
        // educatorName will be taken from parsedCourseData if provided by frontend

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        parsedCourseData.courseThumbnail = imageUpload.secure_url
        
        // Generate Unique Slug
        let slug = parsedCourseData.courseTitle
            .toLowerCase()
            .trim()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
            
        let finalSlug = slug;
        let count = 1;
        while (await Course.findOne({ where: { slug: finalSlug } })) {
            finalSlug = `${slug}-${count++}`;
        }
        parsedCourseData.slug = finalSlug;
            
        const newCourse = await Course.create(parsedCourseData)

        res.json({ success: true, message: 'Course Added' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Admin Courses
export const getAdminCourses = async (req, res) => {
    try {
        const adminId = req.auth.adminId
        const courses = await Course.findAll() // Temporarily lenient to show all courses

        // Ensure enrolledStudents is parsed
        const parsedCourses = courses.map(course => {
            const courseJson = course.toJSON();
            if (typeof courseJson.enrolledStudents === 'string') {
                try { courseJson.enrolledStudents = JSON.parse(courseJson.enrolledStudents); } catch (e) { courseJson.enrolledStudents = []; }
            }
            return courseJson;
        });

        res.json({ success: true, courses: parsedCourses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Admin Dashboard Data
export const adminDashboardData = async (req, res) => {
    try {
        const adminId = req.auth.adminId;

        const courses = await Course.findAll(); // Temporarily lenient
        const totalCourses = courses.length;
        const courseIds = courses.map(course => course.id);

        // Parse enrolledStudents for each course
        const coursesWithParsedStudents = courses.map(c => {
            const courseJson = c.toJSON();
            if (typeof courseJson.enrolledStudents === 'string') {
                try { courseJson.enrolledStudents = JSON.parse(courseJson.enrolledStudents); } catch (e) { courseJson.enrolledStudents = []; }
            }
            return courseJson;
        });

        const purchases = await Purchase.findAll({
            where: {
                courseId: courseIds,
                status: 'completed'
            }
        });

        const totalCourseEarnings = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.amount), 0);

        // Fetch Event Earnings
        const eventEnrollments = await EventEnrollment.findAll({
            where: { paymentStatus: 'completed' }
        });
        const totalEventEarnings = eventEnrollments.reduce((sum, enroll) => sum + parseFloat(enroll.amount || 0), 0);

        const enrolledStudentsData = [];
        for (const purchase of purchases) {
            const student = await User.findByPk(purchase.userId, { attributes: ['name', 'imageUrl', 'id'] });
            const course = courses.find(c => c.id === purchase.courseId);
            
            if (student && course) {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student: {
                        ...student.toJSON(),
                        purchaseDate: purchase.createdAt
                    }
                });
            }
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings: totalCourseEarnings + totalEventEarnings,
                courseEarnings: totalCourseEarnings,
                eventEarnings: totalEventEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const adminId = req.auth.adminId;

        const courses = await Course.findAll(); // Temporarily lenient
        const courseIds = courses.map(course => course.id);

        const purchases = await Purchase.findAll({
            where: {
                courseId: courseIds,
                status: 'completed'
            }
        });

        const enrichedPurchases = await Promise.all(purchases.map(async (purchase) => {
            const user = await User.findByPk(purchase.userId, { attributes: ['name', 'imageUrl'] });
            const course = await Course.findByPk(purchase.courseId, { attributes: ['courseTitle'] });
            return {
                student: user,
                courseTitle: course ? course.courseTitle : 'Unknown Course',
                purchaseDate: purchase.createdAt
            };
        }));

        res.json({
            success: true,
            enrolledStudents: enrichedPurchases
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Add Question
export const addQuestion = async (req, res) => {
    try {
        const { text, options, correctOption, correctAnswer, responseType, explanation, type, isPaid, quizId, positiveMarks, negativeMarks } = req.body;
        const imageFile = req.file;
        let imageUrl = null;

        if (imageFile) {
            // Save local relative path
            imageUrl = `/uploads/questions/${imageFile.filename}`;
        }

        const resolvedType = responseType || 'mcq';
        
        const question = await Question.create({
            text,
            responseType: resolvedType,
            options: resolvedType === 'mcq' ? (typeof options === 'string' ? JSON.parse(options) : options) : null,
            correctOption: resolvedType === 'mcq' ? (correctOption !== undefined && correctOption !== null ? Number(correctOption) : 0) : null,
            correctAnswer: resolvedType === 'short_answer' ? correctAnswer : null,
            explanation: typeof explanation === 'string' ? JSON.parse(explanation) : (explanation || { correct: "" }),
            type: type || 'standard',
            isPaid: isPaid === 'true' || isPaid === true,
            image: imageUrl,
            quizId: quizId ? parseInt(quizId) : null,
            positiveMarks: positiveMarks !== undefined ? parseFloat(positiveMarks) : 1.0,
            negativeMarks: negativeMarks !== undefined ? parseFloat(negativeMarks) : 0.0
        });

        res.json({ success: true, message: 'Question Added', question });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
// Upload Image (Common for Certificates, etc)
export const uploadImage = async (req, res) => {
    try {
        const imageFile = req.file;
        if (!imageFile) {
            return res.json({ success: false, message: 'Image Not Attached' })
        }
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        res.json({ success: true, imageUrl: imageUpload.secure_url });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Upload Lecture Video (Local Storage)
export const uploadVideo = async (req, res) => {
    try {
        const videoFile = req.file;
        if (!videoFile) {
            return res.json({ success: false, message: 'Video Not Attached' });
        }
        
        const videoUrl = `/uploads/videos/${videoFile.filename}`;
        res.json({ success: true, videoUrl });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Update Course
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseData } = req.body;
        const imageFile = req.file;
        const adminId = req.auth.adminId;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.json({ success: false, message: 'Course Not Found' });
        }

        const parsedCourseData = JSON.parse(courseData);

        // --- FILE SYSTEM CLEANUP ---
        // Find local videos in old content that are not in new content
        const oldVideos = getLocalVideosFromContent(course.courseContent);
        const newVideos = getLocalVideosFromContent(parsedCourseData.courseContent);
        
        const orphanedVideos = oldVideos.filter(v => !newVideos.includes(v));
        orphanedVideos.forEach(v => deleteLocalFile(v));
        // --- END CLEANUP ---

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path);
            parsedCourseData.courseThumbnail = imageUpload.secure_url;
        }

        // Maintain the educator ID
        parsedCourseData.educator = String(adminId);

        await course.update(parsedCourseData);

        res.json({ success: true, message: 'Course Updated' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Course by Id for Admin (Full Data)
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id);

        if (!course) {
            return res.json({ success: false, message: 'Course Not Found' });
        }

        // Ensure courseContent is parsed if it's stored as a string
        if (typeof course.courseContent === 'string') {
            course.courseContent = JSON.parse(course.courseContent);
        }

        res.json({ success: true, course });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Delete Course
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id);
        if (!course) {
            return res.json({ success: false, message: 'Course Not Found' });
        }

        // --- FILE SYSTEM CLEANUP ---
        // Delete all local video files associated with this course
        const localVideos = getLocalVideosFromContent(course.courseContent);
        localVideos.forEach(v => deleteLocalFile(v));
        
        // Delete Thumbnail from Cloudinary if it exists
        if (course.courseThumbnail && course.courseThumbnail.includes('cloudinary')) {
            try {
                const publicId = course.courseThumbnail.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error("Cloudinary delete error:", err.message);
            }
        }
        // --- END CLEANUP ---

        await course.destroy();
        res.json({ success: true, message: 'Course Deleted' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Enrolled Students for a Specific Course
export const getCourseEnrolledStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id);

        if (!course) {
            return res.json({ success: false, message: 'Course Not Found' });
        }

        const purchases = await Purchase.findAll({
            where: { courseId: id, status: 'completed' },
            order: [['createdAt', 'DESC']]
        });

        const studentsWithDates = [];
        for (const purchase of purchases) {
            const student = await User.findByPk(purchase.userId, { 
                attributes: ['id', 'name', 'email', 'imageUrl'] 
            });
            if (student) {
                studentsWithDates.push({
                    ...student.toJSON(),
                    purchaseDate: purchase.createdAt
                });
            }
        }

        res.json({ success: true, students: studentsWithDates });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get All Users (Students)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'imageUrl', 'role', 'enrolledCourses', 'accuracy', 'performanceLevel', 'createdAt', 'isBlocked', 'canAccessBlog', 'canAccessQuiz']
        });
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update User Enrollments (Grant/Revoke Course Access)
export const updateUserAccess = async (req, res) => {
    try {
        const { userId } = req.params;
        const { enrolledCourses, isBlocked, canAccessBlog, canAccessQuiz } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });

        if (enrolledCourses !== undefined) user.enrolledCourses = enrolledCourses;
        if (isBlocked !== undefined) user.isBlocked = isBlocked;
        if (canAccessBlog !== undefined) user.canAccessBlog = canAccessBlog;
        if (canAccessQuiz !== undefined) user.canAccessQuiz = canAccessQuiz;
        
        await user.save();

        res.json({ 
            success: true, 
            message: 'User access updated successfully', 
            enrolledCourses: user.enrolledCourses,
            isBlocked: user.isBlocked,
            canAccessBlog: user.canAccessBlog,
            canAccessQuiz: user.canAccessQuiz
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete a Course Review (Rating/Comment)
export const deleteCourseReview = async (req, res) => {
    try {
        const { courseId, userId } = req.body;
        const course = await Course.findByPk(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course Not Found' });
        }

        let ratings = course.courseRatings || [];
        if (typeof ratings === 'string') {
            try { ratings = JSON.parse(ratings); } catch (e) { ratings = []; }
        }

        const filteredRatings = ratings.filter(r => String(r.userId) !== String(userId));

        if (ratings.length === filteredRatings.length) {
            return res.json({ success: false, message: 'Review Not Found' });
        }

        course.courseRatings = filteredRatings;
        await course.save();

        res.json({ success: true, message: 'Review Deleted' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// ======================== FACULTY MANAGEMENT ========================

// Get all faculty records (Admin)
export const getFacultyApplications = async (req, res) => {
    try {
        const applications = await Faculty.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ success: true, applications });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Public: Get all verified faculty
export const getVerifiedFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findAll({
            where: { status: 'verified' },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, faculty });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Verify a faculty application
export const verifyFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const faculty = await Faculty.findByPk(id);
        
        if (!faculty) return res.json({ success: false, message: 'Faculty Application Not Found' });
        
        faculty.status = 'verified';
        await faculty.save();
        res.json({ success: true, message: 'Faculty Verified Successfully and is now Public' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Delete / Reject a faculty application
export const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const faculty = await Faculty.findByPk(id);
        
        if (!faculty) return res.json({ success: false, message: 'Faculty Record Not Found' });
        
        // Delete the image file if it exists
        if (faculty.image) {
            try {
                // image URL format: http://localhost:5000/uploads/faculty/1742990000.jpg
                const filename = faculty.image.split('/').pop();
                const filePath = path.join('uploads', 'faculty', filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (err) {
                console.error("Error deleting faculty image:", err.message);
            }
        }
        
        // Delete the CV file if it exists
        if (faculty.cv) {
            try {
                const cvFilename = faculty.cv.split('/').pop();
                const cvFilePath = path.join('uploads', 'faculty', cvFilename);
                if (fs.existsSync(cvFilePath)) {
                    fs.unlinkSync(cvFilePath);
                }
            } catch (err) {
                console.error("Error deleting faculty CV:", err.message);
            }
        }

        await faculty.destroy();
        res.json({ success: true, message: 'Faculty Record Removed' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get User Detailed Activity (Quizzes + Courses)
export const getUserActivity = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByPk(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });

        // 1. Fetch Quiz Attempts
        const attempts = await QuizAttempt.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            raw: true
        });

        // 2. Fetch Quiz Meta for Titles
        const quizIds = [...new Set(attempts.map(a => a.type).filter(id => !isNaN(id)))];
        const quizzes = await Quiz.findAll({
            where: { id: quizIds },
            attributes: ['id', 'title'],
            raw: true
        });
        const quizMap = quizzes.reduce((acc, q) => ({ ...acc, [q.id]: q.title }), {});

        // 3. Process Attempts
        let totalScore = 0;
        let totalTime = 0;
        let officialCount = 0;
        const attemptsMerged = attempts.map(a => {
            if (!a.isPractice) {
                totalScore += parseFloat(a.score) || 0;
                officialCount++;
            }
            totalTime += parseInt(a.timeTaken) || 0;

            let title = 'Unknown Quiz';
            if (a.type === 'custom') title = 'Custom Practice Test';
            else if (a.type === 'mistake') title = 'Mistake Retry';
            else if (quizMap[a.type]) title = quizMap[a.type];

            return { ...a, quizTitle: title };
        });

        const avgScore = officialCount > 0 ? (totalScore / officialCount).toFixed(1) : 0;
        const avgTime = attempts.length > 0 ? Math.round(totalTime / attempts.length) : 0;

        // 4. Fetch Enrolled Courses
        let enrolledCoursesIds = user.enrolledCourses || [];
        if (typeof enrolledCoursesIds === 'string') {
            try { enrolledCoursesIds = JSON.parse(enrolledCoursesIds) } catch(e) { enrolledCoursesIds = []; }
        }
        
        const courses = await Course.findAll({
            where: { _id: enrolledCoursesIds },
            attributes: ['_id', 'courseTitle', 'courseThumbnail', 'category'],
            raw: true
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                imageUrl: user.imageUrl,
                createdAt: user.createdAt,
                performanceLevel: user.performanceLevel,
                accuracy: user.accuracy
            },
            stats: {
                totalAttempts: attempts.length,
                officialAttempts: officialCount,
                avgScore,
                avgTime,
                totalTimeSpent: totalTime
            },
            recentQuizzes: attemptsMerged.slice(0, 15), // Last 15 attempts
            courses
        });

    } catch (error) {
        console.error("Activity Fetch Error:", error);
        res.json({ success: false, message: error.message });
    }
};
