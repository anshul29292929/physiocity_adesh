import express from 'express';
import { 
    getRandomQuiz, 
    submitQuiz, 
    toggleBookmark, 
    getUserStats, 
    getMistakeQuiz,
    getBookmarks,
    getQuizzes,
    getQuizQuestions,
    getUserAttempts,
    getAttemptDetails
} from '../controllers/quizController.js';
import userAuth from '../middlewares/userAuth.js';

const quizRouter = express.Router();

// Public/Authenticated routes
quizRouter.get('/random', userAuth, getRandomQuiz);
quizRouter.get('/all', userAuth, getQuizzes);
quizRouter.get('/questions/:id', userAuth, getQuizQuestions);
quizRouter.post('/submit', userAuth, submitQuiz);
quizRouter.post('/bookmark', userAuth, toggleBookmark);
quizRouter.get('/bookmarks', userAuth, getBookmarks);
quizRouter.get('/stats/:userId', userAuth, getUserStats);
quizRouter.get('/mistakes/:userId', userAuth, getMistakeQuiz);
quizRouter.get('/attempts', userAuth, getUserAttempts);
quizRouter.get('/attempt/:id', userAuth, getAttemptDetails);

export default quizRouter;
