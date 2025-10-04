import genModel from "../../config/genAI.js";
import SoilHealthModel from "../../db/models/soilHealth.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import FertilizerRecommendationModel from "../../db/models/fertilizerRecommendation.model.js";

async function generateSoilHealth(location, userId) {
  const prompt = `
You are an agricultural soil data assistant.
Given a location name, generate a structured soil sample record in JSON format
strictly following this schema:

{
  "fieldId": "short unique string",
  "gps": { "type": "Point", "coordinates": [longitude, latitude] },
  "sampleDate": "ISO date string",
  "depthCm": number,
  "n": number,
  "p": number,
  "k": number,
  "ph": number,
  "organicCarbon": number,
  "cec": number,
  "texture": "loam/sandy/clay etc.",
  "micronutrients": { "Zn": number, "Fe": number, "Mn": number, "B": number, "Cu": number }
}

Ensure all values are realistic for soils in "${location}".
Output must be ONLY valid JSON, no explanations.
`;

  const result = await genModel.generateContent(prompt);
  let text = result.response.text().trim();

  // ✅ Remove markdown code fences if present
  text = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let soilData;
  try {
    soilData = JSON.parse(text);
  } catch (err) {
    console.error("❌ Gemini returned invalid JSON:", text);
    throw err;
  }

  soilData.farmerId = userId;
  const soilSample = new SoilHealthModel(soilData);
  await soilSample.save();

  return soilSample;
}

async function generateFertilizerRecommendation(sample, crop) {
  const plainSample = sample.toObject ? sample.toObject() : sample;

  const prompt = `
You are an agricultural assistant.
Given the following soil sample data, generate fertilizer recommendations for ${crop}.
Return JSON strictly in this format:

{
  "crop": "${crop}",
  "recommended": {
    "nKgPerHa": number,
    "pKgPerHa": number,
    "kKgPerHa": number,
    "fertilizerTypes": [string],
    "timing": [string]
  },
  "reason": string,
  "provider": "ml",
  "modelVersion": "v1.0",
  "confidence": number (0-1)
}

Soil sample data:
${JSON.stringify(plainSample, null, 2)}

Output ONLY valid JSON, no explanations.
`;

  const result = await genModel.generateContent(prompt);
  let text = result.response.text().trim();

  text = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let recommendation;
  try {
    recommendation = JSON.parse(text);
  } catch (err) {
    console.error("❌ Gemini returned invalid JSON:", text);
    throw err;
  }

  // attach sample reference
  recommendation.sampleId = sample._id;

  const recDoc = new FertilizerRecommendationModel(recommendation);
  await recDoc.save();

  return recDoc;
}

const getSoilInfo = asyncHandler(async (req, res) => {
  const data = await generateSoilHealth(req.location, req.user._id);
  res.status(200).json(data);
});

const getFertilizerRecommendation = asyncHandler(async (req, res) => {
  const { crop, sampleId } = req.body;

  const sample = await SoilHealthModel.findById(sampleId);

  if (!sample || !crop) {
    return res.status(400).json({ message: "Sample data and crop required" });
  }

  const recommendation = await generateFertilizerRecommendation(sample, crop);

  res.status(200).json(recommendation);
});

export { getSoilInfo, getFertilizerRecommendation };
