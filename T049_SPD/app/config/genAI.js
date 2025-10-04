import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

export default genModel;
