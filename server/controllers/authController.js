import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { sub: googleId, email, name, picture: imageUrl } = ticket.getPayload();

        // Find or Create User by email (or googleId)
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create New User
            user = await User.create({
                id: googleId, // Using googleId as the primary ID or a separate one
                googleId,
                name,
                email,
                imageUrl,
                enrolledCourses: []
            });
        } else {
            // Update existing user's Google info if needed
            if (user.isBlocked) {
                return res.json({ success: false, message: 'Your account has been suspended. Please contact support.' });
            }
            user.googleId = googleId;
            user.imageUrl = imageUrl;
            await user.save();
        }

        // Generate Local JWT
        const appToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                imageUrl: user.imageUrl,
            },
            token: appToken
        });

    } catch (error) {
        console.error('Google Auth Error:', error.message);
        res.json({ success: false, message: 'Authentication Failed' });
    }
};
