import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  fieldId: String,
  alertType: String, // e.g., "frost", "heavy_rain", "heat_stress"
  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  probability: Number, // 0-1
  windowStart: Date,
  windowEnd: Date,
  recommendedAction: String,
  modelVersion: String,
  createdAt: { type: Date, default: Date.now },
});

export default AlertModel = mongoose.model("Alert", AlertSchema);
