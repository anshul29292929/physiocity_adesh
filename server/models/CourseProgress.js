import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

export const CourseProgress = sequelize.define('CourseProgress', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    courseId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lectureCompleted: {
        type: DataTypes.JSON,
        defaultValue: []
    }
}, {
    timestamps: false
});
