import mongoose from "mongoose";

const SoilSampleSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    fieldId: { type: String },
    gps: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    sampleDate: { type: Date, default: Date.now },
    depthCm: Number,
    n: Number, // nitrogen (ppm or mg/kg)
    p: Number,
    k: Number,
    ph: Number,
    organicCarbon: Number,
    cec: Number,
    texture: String, // loam/sandy/clay
    micronutrients: mongoose.Schema.Types.Mixed,
    labReportUrl: String,
  },
  { timestamps: true }
);

const SoilHealthModel = mongoose.model("SoilHealth", SoilSampleSchema);

export default SoilHealthModel;
