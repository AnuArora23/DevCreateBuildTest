import mongoose from "mongoose";

const MarketForecastSchema = new mongoose.Schema({
  commodity: String,
  market: String,
  generatedAt: Date,
  horizonDays: Number,
  forecasts: [
    {
      date: Date,
      predictedPrice: Number,
      lowerPI: Number,
      upperPI: Number,
    },
  ],
  modelVersion: String,
});

const MarketForecastModel = mongoose.model(
  "MarketForecast",
  MarketForecastSchema
);

export default MarketForecastModel;
