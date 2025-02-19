import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { ENV_VARS } from '../config/envVars.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies['jwt-netflix'];

        if (!token) {
            return res.status(401).json({ success: false, message: "Token chưa được cung cấp" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
        }

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Lỗi protectRoute: ", error.message);
        res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};
