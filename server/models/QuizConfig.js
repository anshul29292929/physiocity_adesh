import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

const QuizConfig = sequelize.define('QuizConfig', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    questionCount: {
        type: DataTypes.INTEGER,
        defaultValue: 15
    },
    difficultyDistribution: {
        type: DataTypes.JSON, // { easy: 40, medium: 40, hard: 20 }
        defaultValue: { easy: 40, medium: 40, hard: 20 }
    },
    enableTimer: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    dailyQuizEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    dailyQuizTime: {
        type: DataTypes.STRING, // "09:00"
        defaultValue: "09:00"
    },
    dailyQuestionCount: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    }
}, {
    tableName: 'QuizConfigs',
    timestamps: true
});

export default QuizConfig;
