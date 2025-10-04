import { cropAdviceChatbot } from "../../ai/cropAdviceChatbot.js";
import { textToSpeech } from "../../ai/text-to-speech.js";
import asyncHandler from "../utils/asyncHandler.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

const ChatBotFunction = asyncHandler(async (req, res) => {
  const { query, language } = req.body;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Query is required",
    });
  }

  try {
    const result = await cropAdviceChatbot({ query, language });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const texttospeech = asyncHandler(async (req, res) => {
  const { text, language = "en-US" } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      message: "Text is required",
    });
  }

  try {
    const audioData = await textToSpeech(text);

    return res.status(200).json({
      success: true,
      data: {
        audio: audioData,
        format: "audio/wav",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const generateResult = asyncHandler(async (req, res) => {
  try {
    const detectionResult = req.body.detectionResult;

    if (!detectionResult) {
      return res.status(400).json({ message: "No detection result provided." });
    }

    // 🔹 Flatten JSON into plain text
    const plainText = `
Crop: ${detectionResult.crop_detection?.crop_type}
Crop Confidence: ${detectionResult.crop_detection?.confidence}
Auto Detected: ${detectionResult.crop_detection?.auto_detected}

Disease: ${detectionResult.disease_detection?.disease_name}
Disease Class: ${detectionResult.disease_detection?.disease_class}
Disease Confidence: ${detectionResult.disease_detection?.confidence}
Severity: ${detectionResult.disease_detection?.severity}

Model Used: ${detectionResult.model_used}
Timestamp: ${detectionResult.timestamp}
    `;

    // 🔹 Build prompt
    const prompt = `
You are an expert agricultural assistant. 
Interpret the following crop disease detection result and give a simple, farmer-friendly summary with advice:

${plainText}
    `;

    // 🔹 Ask Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 🔹 Send back
    res.status(200).json({
      status: "success",
      interpretation: text,
    });
  } catch (error) {
    console.error("Error in generateResult:", error);
    res.status(500).json({
      message: "Failed to generate interpretation",
      error: error.message,
    });
  }
});

export { ChatBotFunction, texttospeech, generateResult };
