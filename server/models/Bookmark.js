import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

const Bookmark = sequelize.define('Bookmark', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Bookmarks',
    timestamps: true
});

export default Bookmark;
