import { sequelize } from './configs/db.js';
import Question from './models/Question.js';

async function check() {
    try {
        const questions = await Question.findAll({
            where: { quizId: 2 }
        });
        console.log("Questions for Quiz 2:");
        if (questions.length === 0) {
            console.log("No questions found for quizId 2.");
        }
        questions.forEach(q => {
            console.log(`ID: ${q.id}, Text: ${q.text}, Image: ${q.image}`);
        });
        process.exit(0);
    } catch (err) {
        console.error("Check Error:", err.message);
        process.exit(1);
    }
}

check();
//updated