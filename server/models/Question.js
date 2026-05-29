import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    responseType: {
        type: DataTypes.ENUM('mcq', 'short_answer'),
        defaultValue: 'mcq'
    },
    options: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('options');
            if (typeof rawValue === 'string') {
                try { return JSON.parse(rawValue); } catch (e) { return []; }
            }
            return rawValue || [];
        }
    },
    correctOption: {
        type: DataTypes.INTEGER, // Index 0-3
        allowNull: true // Null for short_answer
    },
    correctAnswer: {
        type: DataTypes.STRING, // For short_answer
        allowNull: true
    },
    explanation: {
        type: DataTypes.JSON, 
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('explanation');
            if (typeof rawValue === 'string') {
                try { return JSON.parse(rawValue); } catch (e) { return {}; }
            }
            return rawValue || {};
        }
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('standard', 'case-based', 'image-based'),
        defaultValue: 'standard'
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    difficulty: {
        type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
        defaultValue: 'Medium'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    mistakeType: {
        type: DataTypes.ENUM('Conceptual', 'Memory', 'Careless'),
        defaultValue: 'Conceptual'
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: [],
        get() {
            const rawValue = this.getDataValue('tags');
            if (typeof rawValue === 'string') {
                try { return JSON.parse(rawValue); } catch (e) { return []; }
            }
            return rawValue || [];
        }
    },
    quizId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    positiveMarks: {
        type: DataTypes.FLOAT,
        defaultValue: 1.0
    },
    negativeMarks: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    }
}, {
    tableName: 'Questions',
    timestamps: true
});

export default Question;
