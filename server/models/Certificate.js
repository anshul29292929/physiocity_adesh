import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.js';

const Certificate = sequelize.define('Certificate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING(1000),
        allowNull: false
    },
    templateUrl: {
        type: DataTypes.STRING(1000),
        allowNull: false
    },
    issueDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'certificates',
    timestamps: true
});

export default Certificate;
