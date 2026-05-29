import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

const BlogReadingList = sequelize.define('BlogReadingList', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    blogId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'BlogReadingList',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['userId', 'blogId'] }
    ]
});

export default BlogReadingList;
