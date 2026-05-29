import { pool } from '../configs/db.js';

/**
 * Executes a raw SQL query with automatic retry logic for ECONNRESET errors.
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @param {number} retries - Number of retries (default: 1)
 */
export const runQueryWithRetry = async (sql, params = [], retries = 1) => {
    try {
        const [rows] = await pool.query(sql, params);
        return rows;
    } catch (error) {
        if (retries > 0 && (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST')) {
            console.warn(`Database connection lost. Retrying query... (${retries} retries left)`);
            return runQueryWithRetry(sql, params, retries - 1);
        }

        console.error('--- QUERY FAILURE ---');
        console.error('SQL:', sql);
        console.error('Error:', error.message);
        throw error;
    }
};

/**
 * Example Usage:
 * const users = await runQueryWithRetry("SELECT * FROM Users WHERE role = ?", ['student']);
 */
