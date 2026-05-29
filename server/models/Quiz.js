import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    totalQuestions: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    timeLimit: {
        type: DataTypes.INTEGER, // In seconds
        allowNull: true
    },
    isDailyQuiz: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'General'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'quizzes',
    timestamps: true
});

export default Quiz;
