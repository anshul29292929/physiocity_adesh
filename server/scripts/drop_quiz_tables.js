import { sequelize } from '../configs/db.js';

const dropTables = async () => {
    try {
        console.log('--- DB AUTHENTICATING ---');
        await sequelize.authenticate();
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        const tables = ['UserAnswers', 'Bookmarks', 'Questions', 'QuizConfigs'];
        for (const table of tables) {
            console.log(`Dropping: ${table}`);
            await sequelize.query(`DROP TABLE IF EXISTS ${table}`);
        }
        
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('--- TABLES DROPPED ---');
        process.exit(0);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
};

dropTables();
