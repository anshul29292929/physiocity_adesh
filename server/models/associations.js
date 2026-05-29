import User from './User.js';
import Question from './Question.js';
import QuizAttempt from './QuizAttempt.js';
import UserAnswer from './UserAnswer.js';
import Bookmark from './Bookmark.js';
import QuizConfig from './QuizConfig.js';
import Quiz from './Quiz.js';
import Admin from './Admin.js';
import Faculty from './Faculty.js';
import Event from './Event.js';
import EventEnrollment from './EventEnrollment.js';

// User <-> QuizAttempt
User.hasMany(QuizAttempt, { foreignKey: 'userId' });
QuizAttempt.belongsTo(User, { foreignKey: 'userId' });

// QuizAttempt <-> UserAnswer
QuizAttempt.hasMany(UserAnswer, { foreignKey: 'attemptId', onDelete: 'CASCADE', hooks: true });
UserAnswer.belongsTo(QuizAttempt, { foreignKey: 'attemptId' });

// Question <-> UserAnswer
Question.hasMany(UserAnswer, { foreignKey: 'questionId' });
UserAnswer.belongsTo(Question, { foreignKey: 'questionId' });

// User <-> Bookmark
User.hasMany(Bookmark, { foreignKey: 'userId' });
Bookmark.belongsTo(User, { foreignKey: 'userId' });

// Question <-> Bookmark
Question.hasMany(Bookmark, { foreignKey: 'questionId' });
Bookmark.belongsTo(Question, { foreignKey: 'questionId' });

// Admin <-> Quiz
Admin.hasMany(Quiz, { foreignKey: 'createdBy' });
Quiz.belongsTo(Admin, { foreignKey: 'createdBy' });

// Quiz <-> Question
Quiz.hasMany(Question, { foreignKey: 'quizId', onDelete: 'CASCADE', hooks: true });
Question.belongsTo(Quiz, { foreignKey: 'quizId' });

// Event <-> EventEnrollment
Event.hasMany(EventEnrollment, { foreignKey: 'eventId', onDelete: 'CASCADE', hooks: true });
EventEnrollment.belongsTo(Event, { foreignKey: 'eventId' });

// User <-> EventEnrollment
User.hasMany(EventEnrollment, { foreignKey: 'userId' });
EventEnrollment.belongsTo(User, { foreignKey: 'userId' });

export { User, Question, QuizAttempt, UserAnswer, Bookmark, QuizConfig, Quiz, Admin, Faculty, Event, EventEnrollment };
