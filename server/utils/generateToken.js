import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars.js";

export const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, { expiresIn: "15d" });

	res.cookie("jwt-netflix", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, // 15 ngày
		httpOnly: true, // Chỉ có server mới có thể đọc được cookie
		sameSite: "strict", // Chỉ cho phép gửi cookie cùng site
		secure: ENV_VARS.NODE_ENV !== "development",
	});

	return token;
};