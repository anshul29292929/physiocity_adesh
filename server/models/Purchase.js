import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

export const Purchase = sequelize.define('Purchase', {
    courseId: {
        type: DataTypes.INTEGER, // If Course uses auto-increment ID
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending'
    },
    razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});