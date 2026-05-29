import jwt from 'jsonwebtoken'
import Admin from "../models/Admin.js"

// Middleware ( Protect Admin Routes with separate Token )
export const protectAdmin = async (req, res, next) => {
    try {
        const { admintoken } = req.headers;

        if (!admintoken) {
            return res.json({ success: false, message: 'Not Authorized. Login again' });
        }

        const decoded = jwt.verify(admintoken, process.env.JWT_SECRET);

        if (!decoded.adminId) {
            return res.json({ success: false, message: 'Not Authorized. Login again' });
        }

        const admin = await Admin.findByPk(decoded.adminId);

        if (!admin) {
            return res.json({ success: false, message: 'Not Authorized. Login again' });
        }

        // Attach adminId to req.auth for controllers
        req.auth = { adminId: admin.id };

        next();

    } catch (error) {
        console.error('Admin Protection Error:', error.message);
        res.json({ success: false, message: error.message });
    }
};