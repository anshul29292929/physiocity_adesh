import express from 'express';
import { 
    getAdminQuestions, 
    updateQuestion, 
    deleteQuestion, 
    bulkUploadQuestions,
    getQuizConfigs,
    updateQuizConfigs,
    getAdminQuizStats,
    getUserDetailedPerformance,
    createQuiz,
    getAllQuizzes,
    getQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizSubmissions
} from '../controllers/adminQuizController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js';

const adminQuizRouter = express.Router();

adminQuizRouter.use(protectAdmin);

adminQuizRouter.get('/questions', getAdminQuestions);
adminQuizRouter.put('/question/:id', upload.single('image'), updateQuestion);
adminQuizRouter.delete('/question/:id', deleteQuestion);
adminQuizRouter.post('/questions/bulk', bulkUploadQuestions);

adminQuizRouter.get('/config', getQuizConfigs);
adminQuizRouter.put('/config', updateQuizConfigs);

adminQuizRouter.get('/stats', getAdminQuizStats);
adminQuizRouter.get('/user-performance/:userId', getUserDetailedPerformance);

// Quiz Management (Entities)
adminQuizRouter.post('/quizzes', createQuiz);
adminQuizRouter.get('/quiz/:id', getQuiz);
adminQuizRouter.get('/quizzes', getAllQuizzes);
adminQuizRouter.put('/quiz/:id', updateQuiz);
adminQuizRouter.delete('/quiz/:id', deleteQuiz);
adminQuizRouter.get('/quiz/:id/submissions', getQuizSubmissions);

export default adminQuizRouter;
