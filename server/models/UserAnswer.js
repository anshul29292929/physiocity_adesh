import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

const UserAnswer = sequelize.define('UserAnswer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attemptId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    selectedOption: {
        type: DataTypes.INTEGER,
        allowNull: true // null if skipped or short_answer
    },
    shortAnswer: {
        type: DataTypes.STRING,
        allowNull: true // null if mcq
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    mistakeType: {
        type: DataTypes.ENUM('conceptual', 'memory', 'careless', 'none'),
        defaultValue: 'none'
    },
    timeTaken: {
        type: DataTypes.INTEGER, // in seconds
        defaultValue: 0
    }
}, {
    tableName: 'UserAnswers',
    timestamps: true
});

export default UserAnswer;
