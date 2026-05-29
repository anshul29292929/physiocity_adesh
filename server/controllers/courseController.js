import { Op } from "sequelize";
import Course from "../models/Course.js"


// Get All Courses
export const getAllCourse = async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: { isPublished: true },
            attributes: { exclude: ['courseContent', 'enrolledStudents'] }
        });

        res.json({ success: true, courses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Course by Id
export const getCourseId = async (req, res) => {
    const { id } = req.params
    try {
        const courseData = await Course.findOne({
            where: {
                [Op.or]: [
                    { id: id },
                    { slug: id }
                ]
            }
        });

        if (!courseData) {
            return res.json({ success: false, message: 'Course not found' });
        }

        // courseContent is already a JSON object in Sequelize if defined as DataTypes.JSON
        // Remove lectureUrl if isPreviewFree is false
        // Ensure courseContent is an array (Sequelize JSON might return as string in some environments)
        if (typeof courseData.courseContent === 'string') {
            courseData.courseContent = JSON.parse(courseData.courseContent);
        }

        if (Array.isArray(courseData.courseContent)) {
            courseData.courseContent.forEach(chapter => {
                if (typeof chapter.chapterContent === 'string') {
                    chapter.chapterContent = JSON.parse(chapter.chapterContent);
                }
                if (Array.isArray(chapter.chapterContent)) {
                    chapter.chapterContent.forEach(lecture => {
                        if (!lecture.isPreviewFree) {
                            lecture.lectureUrl = "";
                        }
                    });
                }
            });
        }

        res.json({ success: true, courseData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}