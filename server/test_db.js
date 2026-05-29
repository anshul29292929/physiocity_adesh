import { sequelize } from './configs/db.js';

(async () => {
    try {
        console.log("Testing hardest questions query...");
        const [hardestRows] = await sequelize.query(`
            SELECT 
                ua.questionId,
                q.text,
                q.difficulty,
                COUNT(ua.id) as total,
                SUM(CASE WHEN ua.isCorrect = 1 THEN 1 ELSE 0 END) as correct,
                ROUND(SUM(CASE WHEN ua.isCorrect = 1 THEN 1 ELSE 0 END) / COUNT(ua.id) * 100) as accuracy
            FROM UserAnswers ua
            JOIN Questions q ON q.id = ua.questionId
            GROUP BY ua.questionId, q.text, q.difficulty
            HAVING COUNT(ua.id) >= 3
            ORDER BY accuracy ASC
            LIMIT 6
        `);
        console.log("Success:", hardestRows.length, "rows.");

        console.log("Testing top students query...");
        const [topRows] = await sequelize.query(`
            SELECT 
                qa.userId,
                u.name, u.email, u.imageUrl,
                ROUND(AVG(qa.score), 1) as avgScore,
                COUNT(qa.id) as attempts
            FROM QuizAttempts qa
            JOIN user u ON u.id = qa.userId
            WHERE qa.isPractice = 0
            GROUP BY qa.userId, u.name, u.email, u.imageUrl
            ORDER BY avgScore DESC
            LIMIT 5
        `);
        console.log("Success:", topRows.length, "rows.");

    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        process.exit();
    }
})();
