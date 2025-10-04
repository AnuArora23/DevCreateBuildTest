import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema({
  sampleId: { type: mongoose.Schema.Types.ObjectId, ref: "SoilSample" },
  crop: { type: String },
  recommended: {
    nKgPerHa: Number,
    pKgPerHa: Number,
    kKgPerHa: Number,
    fertilizerTypes: [String],
    timing: [String], // e.g., "base", "topdress 30 DAS"
  },
  reason: String,
  provider: { type: String, enum: ["rule", "ml"], default: "ml" },
  modelVersion: String,
  confidence: Number,
  createdAt: { type: Date, default: Date.now },
});

const FertilizerRecommendationModel = mongoose.model(
  "FertilizerRecommendation",
  RecommendationSchema
);

export default FertilizerRecommendationModel;
