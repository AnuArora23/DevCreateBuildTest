import React, { useState, useEffect } from "react";
import axios from "axios";

const WeatherAlert = () => {
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  // Send alert to API automatically when location is obtained

  const sendWeatherAlert = async (lat, lon) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/weather/send-alert",
        {
          lat,
          lon,
        }
      );

      // Axios automatically parses JSON, result is in response.data
      const result = response.data;
      console.log(result.weather); // if your API returns a 'weather' field
      setWeatherData(result.weather);
      console.log("Weather alert received:", result);
    } catch (error) {
      console.error("Error sending alert:", error);

      // Axios errors may be in error.response
      const message = error.response
        ? `HTTP error! status: ${error.response.status}`
        : error.message;

      setError(`Failed to get weather alert: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location and auto-send request
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    setWeatherData(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });

        // Auto-send weather alert request with obtained coordinates
        await sendWeatherAlert(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Failed to get location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "Please ensure location services are enabled.";
        }

        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Automatically get location when component mounts
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleRetry = () => {
    getCurrentLocation();
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Convert Celsius to Fahrenheit
  const celsiusToFahrenheit = (celsius) => {
    return ((celsius * 9) / 5 + 32).toFixed(1);
  };

  // Get weather condition based on temperature
  const getWeatherCondition = (tempC) => {
    if (tempC < 0) return "Freezing";
    if (tempC < 10) return "Cold";
    if (tempC < 20) return "Cool";
    if (tempC < 30) return "Warm";
    return "Hot";
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Weather Alert System
      </h2>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <span className="text-gray-600 text-lg">
            Getting your location...
          </span>
          <span className="text-gray-500 text-sm mt-2">
            Sending weather alert request
          </span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-red-400 mr-3 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold text-lg mb-2">
                Unable to get weather alert
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition duration-200 flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Try Again
          </button>
        </div>
      )}

      {/* Weather Data Display */}
      {weatherData && !loading && (
        <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Weather Alert
              </h3>
              <p className="text-gray-600">
                Current weather conditions for your location
              </p>
            </div>
            <div className="flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Alert Received
            </div>
          </div>

          {/* Main Weather Card */}
          {/* <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {weatherData.tempC}°C
                </div>
                <div className="text-lg text-gray-500">
                  {celsiusToFahrenheit(Number(weatherData.tempC.toFixed(3)))}°F
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {getWeatherCondition(weatherData.tempC)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Feels like</div>
                <div className="text-xl font-semibold text-gray-700">
                  {weatherData.tempC}°C
                </div>
              </div>
            </div>
          </div> */}

          {/* Temperature Range */}
          {/* <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center text-green-600 mb-2">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">High</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {weatherData.maxTempC}°C
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center text-blue-400 mb-2">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Low</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {weatherData.minTempC}°C
              </div>
            </div>
          </div> */}

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div className="text-lg font-bold text-gray-700">
                {weatherData.humidityPct}%
              </div>
              <div className="text-xs text-gray-500">Humidity</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-lg font-bold text-gray-700">
                {weatherData.windMs}m/s
              </div>
              <div className="text-xs text-gray-500">Wind</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                </svg>
              </div>
              <div className="text-lg font-bold text-gray-700">
                {weatherData.rainMm}mm
              </div>
              <div className="text-xs text-gray-500">Rain</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-4 h-4 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-lg font-bold text-gray-700">
                {weatherData.solarWm2}W/m²
              </div>
              <div className="text-xs text-gray-500">Solar</div>
            </div>
          </div>

          {/* Location and Metadata */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">📍 Location:</span>
                <p className="text-gray-800 font-mono">
                  {weatherData.location?.coordinates[1].toFixed(6)},{" "}
                  {weatherData.location?.coordinates[0].toFixed(6)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  🕒 Last Updated:
                </span>
                <p className="text-gray-800">
                  {formatDate(weatherData.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retry Button when weather data is shown */}
      {weatherData && !loading && (
        <div className="text-center">
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200 flex items-center justify-center mx-auto"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Refresh Weather Alert
          </button>
        </div>
      )}
    </div>
  );
};

export default WeatherAlert;
