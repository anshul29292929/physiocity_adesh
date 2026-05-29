import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

const QuizAttempt = sequelize.define('QuizAttempt', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING, // Matches User.js id type
        allowNull: false
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    accuracy: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    mistakeCounts: {
        type: DataTypes.JSON, // { conceptual: 0, memory: 0, careless: 0 }
        defaultValue: { conceptual: 0, memory: 0, careless: 0 },
        get() {
            const rawValue = this.getDataValue('mistakeCounts');
            if (typeof rawValue === 'string') {
                try { return JSON.parse(rawValue); } catch (e) { return { conceptual: 0, memory: 0, careless: 0 }; }
            }
            return rawValue || { conceptual: 0, memory: 0, careless: 0 };
        }
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'mixed'
    },
    startedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    timeTaken: {
        type: DataTypes.INTEGER, // total duration in seconds
        defaultValue: 0
    },
    isPractice: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'QuizAttempts',
    timestamps: true
});

export default QuizAttempt;
