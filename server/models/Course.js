import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

const Course = sequelize.define('Course', {
    courseTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    courseDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    courseThumbnail: {
        type: DataTypes.STRING
    },
    coursePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    discount: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    courseContent: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    educator: {
        type: DataTypes.STRING,
        allowNull: false
    },
    educatorName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    courseRatings: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    enrolledStudents: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    brochureUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'Courses',
    timestamps: true
});

export default Course;