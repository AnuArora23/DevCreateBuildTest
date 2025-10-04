import mongoose from "mongoose";

const WeatherReadingSchema = new mongoose.Schema(
  {
    source: String, // station / satellite / model
    tempC: Number,
    minTempC: Number,
    maxTempC: Number,
    rainMm: Number,
    humidityPct: Number,
    windMs: Number,
    solarWm2: Number,
    soilMoisturePct: Number,
    location: {
      type: { type: String, default: "Point" }, // GeoJSON type
      coordinates: [Number], // [longitude, latitude]
    },
  },
  { timestamps: true }
);

// Create 2dsphere index for geo queries
WeatherReadingSchema.index({ location: "2dsphere" });

const WeatherReadingModel = mongoose.model(
  "WeatherReading",
  WeatherReadingSchema
);
export default WeatherReadingModel;
