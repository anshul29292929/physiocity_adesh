import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB, sequelize } from './configs/db.js' // Updated import
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import courseRouter from './routes/courseRoute.js'
import blogRouter from './routes/blogRoutes.js'
import quizRouter from './routes/quizRoutes.js'
import adminQuizRouter from './routes/adminQuizRoutes.js'
import eventRouter from './routes/eventRoutes.js'
import volunteerRouter from './routes/volunteerRoutes.js'
import './models/associations.js' // Initialize associations

import { googleLogin } from './controllers/authController.js'
import userAuth from './middlewares/userAuth.js'

// Initialize Express
const app = express()

// Connect to database
connectDB();

await connectCloudinary()

// Sync SQL Models (Creates tables if they don't exist)
try {
  // Manual migration for missing columns
  const [results] = await sequelize.query("SHOW COLUMNS FROM Questions LIKE 'responseType'");
  if (results.length === 0) {
      await sequelize.query("ALTER TABLE Questions ADD COLUMN responseType ENUM('mcq', 'short_answer') DEFAULT 'mcq' AFTER text");
  }

  const [ansResults] = await sequelize.query("SHOW COLUMNS FROM Questions LIKE 'correctAnswer'");
  if (ansResults.length === 0) {
      await sequelize.query("ALTER TABLE Questions ADD COLUMN correctAnswer TEXT AFTER correctOption");
  }

  const [uaResults] = await sequelize.query("SHOW COLUMNS FROM UserAnswers LIKE 'shortAnswer'");
  if (uaResults.length === 0) {
      await sequelize.query("ALTER TABLE UserAnswers ADD COLUMN shortAnswer TEXT AFTER selectedOption");
  }

  const [quizCatResults] = await sequelize.query("SHOW COLUMNS FROM quizzes LIKE 'category'");
  if (quizCatResults.length === 0) {
      await sequelize.query("ALTER TABLE quizzes ADD COLUMN category VARCHAR(255) DEFAULT 'General' AFTER status");
  }

  // Change QuizAttempts.type from ENUM to VARCHAR(255)
  try {
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'QuizAttempts'");
    if (tables.length > 0) {
        await sequelize.query("ALTER TABLE QuizAttempts MODIFY COLUMN type VARCHAR(255) DEFAULT 'mixed'");
    }
  } catch (err) {}

  // Add timeTaken column to QuizAttempts if missing
  try {
    const [ttResults] = await sequelize.query("SHOW COLUMNS FROM QuizAttempts LIKE 'timeTaken'");
    if (ttResults.length === 0) {
        await sequelize.query("ALTER TABLE QuizAttempts ADD COLUMN timeTaken INT DEFAULT 0");
    }
  } catch (err) {}  // Add isPractice column to QuizAttempts if missing
  try {
    const [ipResults] = await sequelize.query("SHOW COLUMNS FROM QuizAttempts LIKE 'isPractice'");
    if (ipResults.length === 0) {
        await sequelize.query("ALTER TABLE QuizAttempts ADD COLUMN isPractice TINYINT(1) DEFAULT 0");
    }
  } catch (err) {}

  // Extra column migrations (idempotent)
  const runMigration = async (sql) => {
    try { await sequelize.query(sql); } catch (e) { /* already exists — skip */ }
  };
  await runMigration("ALTER TABLE `Courses` ADD COLUMN IF NOT EXISTS `brochureUrl` VARCHAR(255) NULL");
  await runMigration("ALTER TABLE `Courses` ADD COLUMN IF NOT EXISTS `educatorName` VARCHAR(255) NULL");
  await runMigration("ALTER TABLE `user`    ADD COLUMN IF NOT EXISTS `bio` TEXT NULL");
  await runMigration("ALTER TABLE `user`    ADD COLUMN IF NOT EXISTS `isBlocked` TINYINT(1) DEFAULT 0");
  await runMigration("ALTER TABLE `user`    ADD COLUMN IF NOT EXISTS `canAccessBlog` TINYINT(1) DEFAULT 1");
  await runMigration("ALTER TABLE `user`    ADD COLUMN IF NOT EXISTS `canAccessQuiz` TINYINT(1) DEFAULT 1");
  await runMigration("ALTER TABLE `Blogs`   ADD COLUMN IF NOT EXISTS `authorId` VARCHAR(255) NULL");
  await runMigration("ALTER TABLE `Blogs`   MODIFY COLUMN `authorId` VARCHAR(255) NULL");
  await runMigration("ALTER TABLE `Blogs`   ADD COLUMN IF NOT EXISTS `metaTitle` VARCHAR(255) NULL");
  await runMigration("ALTER TABLE `Blogs`   ADD COLUMN IF NOT EXISTS `metaDescription` TEXT NULL");
  await runMigration("ALTER TABLE `Blogs`   ADD COLUMN IF NOT EXISTS `metaKeywords` VARCHAR(255) NULL");
  await runMigration("ALTER TABLE `Blogs`   ADD COLUMN IF NOT EXISTS `tags` JSON NULL");
  await runMigration("ALTER TABLE `Blogs`   ADD COLUMN IF NOT EXISTS `isDraft` TINYINT(1) DEFAULT 0");
  await runMigration("ALTER TABLE `Questions` ADD COLUMN IF NOT EXISTS `positiveMarks` FLOAT DEFAULT 1.0");
  await runMigration("ALTER TABLE `Questions` ADD COLUMN IF NOT EXISTS `negativeMarks` FLOAT DEFAULT 0.0");
  await runMigration("ALTER TABLE `Faculties` ADD COLUMN IF NOT EXISTS `email` VARCHAR(255) NULL");
  await runMigration("ALTER TABLE `Faculties` ADD COLUMN IF NOT EXISTS `mobileNumber` VARCHAR(255) NULL");
  await runMigration("ALTER TABLE `Faculties` ADD COLUMN IF NOT EXISTS `cv` VARCHAR(255) NULL");
  
  // Event Migrations
  await runMigration("ALTER TABLE `Events` ADD COLUMN IF NOT EXISTS `startDate` DATE NULL");
  await runMigration("ALTER TABLE `Events` ADD COLUMN IF NOT EXISTS `endDate` DATE NULL");
  await runMigration("ALTER TABLE `Events` ADD COLUMN IF NOT EXISTS `startTime` VARCHAR(255) NULL");
  await runMigration("ALTER TABLE `Events` ADD COLUMN IF NOT EXISTS `endTime` VARCHAR(255) NULL");
  await runMigration("ALTER TABLE `Events` ADD COLUMN IF NOT EXISTS `googleMeetLink` VARCHAR(255) NULL");
  await runMigration("ALTER TABLE `Events` ADD COLUMN IF NOT EXISTS `googleMapsLink` VARCHAR(255) NULL");

  // Migration for EventEnrollments
  const [eeResults] = await sequelize.query("SHOW COLUMNS FROM EventEnrollments LIKE 'paymentStatus'");
  if (eeResults.length === 0) {
      await sequelize.query("ALTER TABLE EventEnrollments ADD COLUMN amount DECIMAL(10,2) AFTER email");
      await sequelize.query("ALTER TABLE EventEnrollments ADD COLUMN razorpayOrderId VARCHAR(255) AFTER amount");
      await sequelize.query("ALTER TABLE EventEnrollments ADD COLUMN razorpayPaymentId VARCHAR(255) AFTER razorpayOrderId");
      await sequelize.query("ALTER TABLE EventEnrollments ADD COLUMN paymentStatus ENUM('pending', 'completed', 'failed') DEFAULT 'pending' AFTER razorpayPaymentId");
  }

  // BlogReadingList migration
  await runMigration(`
    CREATE TABLE IF NOT EXISTS \`BlogReadingList\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`userId\` VARCHAR(255) NOT NULL,
      \`blogId\` INT NOT NULL,
      \`createdAt\` DATETIME NOT NULL,
      \`updatedAt\` DATETIME NOT NULL,
      UNIQUE KEY \`user_blog_unique\` (\`userId\`, \`blogId\`)
    )
  `);

  await sequelize.sync();
  console.log('--- DATABASE CONNECTION SUCCESSFUL ---');
} catch (error) {
  console.error("--- DATABASE SYNC OR MIGRATION FAILED ---");
  console.error(error.message);
  try { 
    await sequelize.sync(); 
  } catch (e) {
    console.error("--- BASIC SYNC ALSO FAILED ---", e.message);
  }
}

// Middlewares
app.use(cors())
app.use('/uploads', express.static('uploads'))

// Set COOP header for Google OAuth support (from Newp)
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// Routes
app.post('/auth/google', express.json(), googleLogin)

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      status: 'operational',
      timestamp: new Date().toISOString(),
      systems: {
        api: 'healthy',
        database: 'connected',
        storage: 'accessible'
      },
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'degraded',
      error: error.message,
      systems: {
        api: 'healthy',
        database: 'disconnected'
      }
    });
  }
});

app.get('/', (req, res) => res.send("API Working"))
app.use('/admin/quiz', express.json(), adminQuizRouter)
app.use('/admin', express.json(), adminRouter)
app.use('/course', express.json(), courseRouter)
app.use('/user', express.json(), userRouter)
app.use('/blogs', express.json(), blogRouter)
app.use('/quiz', express.json(), quizRouter)
app.use('/events', express.json(), eventRouter)
app.use('/volunteer', express.json(), volunteerRouter)



// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})