import axios from "axios";
import UserModel from "../../db/models/user.model.js";
import { sendFCMAlert } from "../utils/alertService.js";
import asyncHandler from "../utils/asyncHandler.js";
import WeatherReadingModel from "../../db/models/weather_reading.model.js";

const checkAndSendFCMAlert = async (reading) => {
  let alertMessage = "";

  if (reading.tempC > 40)
    alertMessage += `⚠️ High temperature: ${reading.tempC}°C\n`;
  if (reading.rainMm > 50)
    alertMessage += `🌧 Heavy rainfall: ${reading.rainMm}mm\n`;
  if (reading.soilMoisturePct < 20)
    alertMessage += `💧 Low soil moisture: ${reading.soilMoisturePct}%\n`;

  if (alertMessage) {
    // Find all users associated with this field
    const users = await UserModel.find({
      fcmToken: { $exists: true },
    });
    for (const user of users) {
      await sendFCMAlert(user.fcmToken, "Weather Alert", alertMessage);
    }
  }
};

const fetchWeatherFromAPI = asyncHandler(async (req, res) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ message: "lat and lon are required" });
  }

  const response = await axios.get(
    `https://api.agromonitoring.com/agro/1.0/weather/forecast?lat=${lat}&lon=${lon}&appid=14e84756cafb7ab758a1ce080e75130c`
  );

  const data = response.data[0];

  const newReading = new WeatherReadingModel({
    source: "model",
    tempC: data.main.temp - 273.15, // converting Kelvin to Celsius
    minTempC: data.main.temp_min - 273.15,
    maxTempC: data.main.temp_max - 273.15,
    rainMm: data.rain?.["3h"] || 0, // using 3h rain if available
    humidityPct: data.main.humidity,
    windMs: data.wind.speed,
    solarWm2: 0, // no solar data in your JSON
    soilMoisturePct: 0, // if not available
    timestamp: new Date(data.dt * 1000), // dt is in seconds
    location: {
      type: "Point",
      coordinates: [lon, lat], // pass your lat/lon
    },
  });
  await newReading.save();

  // Send FCM alert if conditions met
  await checkAndSendFCMAlert(newReading);

  res.json({
    message: "Weather saved and FCM alerts sent if needed",
    weather: newReading,
  });
});

export { fetchWeatherFromAPI };
