import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

const Faculty = sequelize.define('Faculty', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    org: {
        type: DataTypes.STRING,
        allowNull: false
    },
    speciality: {
        type: DataTypes.STRING,
        allowNull: false
    },
    experience: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cv: {
        type: DataTypes.STRING,
        allowNull: true
    },
    degrees: {
        type: DataTypes.JSON, // Arrays of strings: ["BPT", "MPT"]
        allowNull: false,
        defaultValue: []
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'verified'),
        defaultValue: 'pending',
        allowNull: false
    }
}, {
    timestamps: true
});

export default Faculty;
