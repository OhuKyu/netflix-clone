import mongoose from "mongoose";
import { ENV_VARS } from "./envVars.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(ENV_VARS.MONGO_URI);
        console.log("Kết nối database thành công");
    } catch (error) {
        process.exit(1);
        console.error("Lỗi kết nối database: ", error.message);
    }
}