import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    googleId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true // Optional if using multiple auth methods
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'student'
    },
    enrolledCourses: {
        type: DataTypes.JSON, 
        defaultValue: []
    },
    accuracy: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    performanceLevel: {
        type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
        defaultValue: 'Beginner'
    },
    dailyStreak: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastQuizDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    canAccessBlog: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    canAccessQuiz: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'user', // Explicitly naming the table 'user'
    timestamps: true
});

export default User;