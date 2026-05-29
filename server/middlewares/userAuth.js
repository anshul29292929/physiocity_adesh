import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const userAuth = async (req, res, next) => {
    try {
        let token = req.headers.token;

        if (!token && req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized. Login Again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Fetch user from database
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found. Login Again.' });
        }

        if (user.isBlocked) {
            return res.json({ success: false, message: 'Your account has been suspended. Please contact support.' });
        }

        if (req.originalUrl.includes('/api/quiz') && !user.canAccessQuiz) {
            return res.json({ success: false, message: 'You do not have permission to access quizzes.' });
        }

        if (req.originalUrl.includes('/api/blogs') && !user.canAccessBlog) {
            return res.json({ success: false, message: 'You do not have permission to access blogs.' });
        }

        // Attach user to req for controllers
        req.user = user;
        
        // Mocking Clerk's req.auth structure for backward compatibility
        req.auth = { userId: user.id };
        
        next();

    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        res.json({ success: false, message: 'Session Expired. Please Login.' });
    }
};

export default userAuth;
