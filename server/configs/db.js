import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Simple Sequelize Instance with a small pool for shared hosting
export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, 
        pool: {
            max: 5,           // Small pool to avoid "max_connections_per_hour"
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("--- DATABASE CONNECTION SUCCESSFUL ---");
    } catch (error) {
        console.error('--- DATABASE CONNECTION ERROR ---');
        console.error(error.message);
        // Simple retry after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;
