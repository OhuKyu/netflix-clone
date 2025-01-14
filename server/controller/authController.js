import { User } from '../models/user.js';
import bcryptjs from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';

export async function signup(req, res) {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Mật khẩu phải chứa ít nhất 6 ký tự' });
        }

        const exitstingUserByEmail = await User.findOne({ email: email });

        if (exitstingUserByEmail) {
            return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
        }

        const exitstingUserByUsername = await User.findOne({ username: username });

        if (exitstingUserByUsername) {
            return res.status(400).json({ success: false, message: 'Username đã tồn tại' });
        }

        const salt = await bcryptjs.genSalt(10);
        const passwordHash = await bcryptjs.hash(password, salt);

        const PROFILE_PICTURE = ["/avatar1.png", "/avatar2.png", "/avatar3.png"];

        const image = PROFILE_PICTURE[Math.floor(Math.random() * PROFILE_PICTURE.length)];

        const newUser = new User({
            email,
            password: passwordHash,
            username,
            image
        });

        generateTokenAndSetCookie(newUser._id, res);
        await newUser.save();

        res.status(201).json({
            success: true, user: {
                ...newUser._doc,
                password: ''
            }
        });

    } catch (error) {
        console.error('Lỗi signup', error.message);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Email không tồn tại' });
        }

        const isPasswordMatch = await bcryptjs.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu không đúng' });
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            success: true, user: {
                ...user._doc,
                password: ""
            }
        });

    } catch (error) {

    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('jwt-netflix');
        res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
    } catch (error) {
        console.error('Lỗi logout', error.message);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
}