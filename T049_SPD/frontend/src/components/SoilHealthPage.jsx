import React, { useState, useEffect } from "react";
import axios from "axios";
import FertilizerRecommendation from "./FertilizerRecommendation";

const SoilHealthPage = () => {
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [crop, setCrop] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSoilData = async () => {
      if (!token) {
        setError("No token found. Please log in first.");
        return;
      }

      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
      }

      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await axios.post(
              "http://localhost:3000/api/soilHealth/getSoilInfo",
              { location: { latitude, longitude } },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            setSoilData(response.data);
          } catch (err) {
            console.error(err);
            setError("Failed to fetch soil health data.");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error(err);
          setError(
            "Failed to get your location. Make sure location is enabled."
          );
          setLoading(false);
        }
      );
    };

    fetchSoilData();
  }, [token]);

  const handleGetRecommendations = async () => {
    if (!crop) {
      setRecError("Please enter a crop.");
      return;
    }

    if (!soilData?._id) {
      setRecError("Soil sample ID not available.");
      return;
    }

    setRecError("");
    setRecommendations([]);
    setRecLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/soilHealth/recommendFertilizerGuidelines",
        { crop, sampleId: soilData._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setRecommendations([response.data]);
    } catch (err) {
      console.error(err);
      setRecError("Failed to fetch fertilizer recommendations.");
    } finally {
      setRecLoading(false);
    }
  };

  const getNutrientStatus = (value, nutrient) => {
    const ranges = {
      n: { low: 0, medium: 20, high: 40 },
      p: { low: 0, medium: 15, high: 30 },
      k: { low: 0, medium: 100, high: 200 },
      ph: { low: 5.5, optimal: 6.5, high: 7.5 },
    };

    if (nutrient === "ph") {
      if (value < ranges.ph.low) return "text-red-500";
      if (value > ranges.ph.high) return "text-red-500";
      if (value >= ranges.ph.low && value <= ranges.ph.high)
        return "text-green-500";
      return "text-yellow-500";
    }

    if (value < ranges[nutrient].medium) return "text-red-500";
    if (value >= ranges[nutrient].high) return "text-green-500";
    return "text-yellow-500";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading soil data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );

  if (!soilData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Soil Health Analysis
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive soil data and fertilizer recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-wrap justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Field Overview
                </h2>
                <div className="flex space-x-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">📍</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Field ID</p>
                      <p className="font-semibold text-gray-800">
                        {soilData.fieldId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600">📅</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sample Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(soilData.sampleDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600">🌍</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold text-gray-800">
                        {soilData.gps?.coordinates?.[1]?.toFixed(4)},{" "}
                        {soilData.gps?.coordinates?.[0]?.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600">📏</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Depth</p>
                      <p className="font-semibold text-gray-800">
                        {soilData.depthCm} cm
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs for Nutrients */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                      activeTab === "overview"
                        ? "border-b-2 border-green-500 text-green-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    📊 Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("macro")}
                    className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                      activeTab === "macro"
                        ? "border-b-2 border-green-500 text-green-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    🧪 Macronutrients
                  </button>
                  <button
                    onClick={() => setActiveTab("micro")}
                    className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                      activeTab === "micro"
                        ? "border-b-2 border-green-500 text-green-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    🔬 Micronutrients
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {soilData.n}
                      </p>
                      <p className="text-sm text-gray-600">Nitrogen (N)</p>
                      <p className="text-xs text-gray-500">mg/kg</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {soilData.p}
                      </p>
                      <p className="text-sm text-gray-600">Phosphorus (P)</p>
                      <p className="text-xs text-gray-500">mg/kg</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {soilData.k}
                      </p>
                      <p className="text-sm text-gray-600">Potassium (K)</p>
                      <p className="text-xs text-gray-500">mg/kg</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {soilData.ph}
                      </p>
                      <p className="text-sm text-gray-600">pH Level</p>
                      <p className="text-xs text-gray-500">pH</p>
                    </div>
                  </div>
                )}

                {activeTab === "macro" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-700">
                            Nitrogen (N)
                          </span>
                          <span
                            className={`font-bold ${getNutrientStatus(
                              soilData.n,
                              "n"
                            )}`}
                          >
                            {soilData.n} mg/kg
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (soilData.n / 60) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-700">
                            Phosphorus (P)
                          </span>
                          <span
                            className={`font-bold ${getNutrientStatus(
                              soilData.p,
                              "p"
                            )}`}
                          >
                            {soilData.p} mg/kg
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (soilData.p / 40) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-700">
                            Potassium (K)
                          </span>
                          <span
                            className={`font-bold ${getNutrientStatus(
                              soilData.k,
                              "k"
                            )}`}
                          >
                            {soilData.k} mg/kg
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (soilData.k / 250) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-700">
                            pH Level
                          </span>
                          <span
                            className={`font-bold ${getNutrientStatus(
                              soilData.ph,
                              "ph"
                            )}`}
                          >
                            {soilData.ph}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                ((soilData.ph - 4) / 6) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-gray-700 mb-2">
                          Organic Carbon
                        </p>
                        <p className="text-2xl font-bold text-gray-800">
                          {soilData.organicCarbon}%
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-gray-700 mb-2">CEC</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {soilData.cec} meq/100g
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "micro" && soilData.micronutrients && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(soilData.micronutrients).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <p className="text-lg font-bold text-gray-800">
                            {value}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="text-xs text-gray-500">mg/kg</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Recommendations */}
          <div className="space-y-6">
            {/* Fertilizer Recommendation Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                🌿 Fertilizer Recommendations
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Selection
                  </label>
                  <input
                    type="text"
                    placeholder="Enter crop name (e.g., Wheat, Corn)"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>

                <button
                  onClick={handleGetRecommendations}
                  disabled={recLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {recLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    "Get Recommendations"
                  )}
                </button>

                {recError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{recError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Soil Texture Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                🏺 Soil Texture
              </h2>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <p className="text-3xl font-bold text-yellow-600 mb-2">
                  {soilData.texture}
                </p>
                <p className="text-sm text-gray-600">Soil Type</p>
              </div>
            </div>

            {/* Status Legend */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📈 Status Legend
              </h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Optimal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Moderate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Needs Attention</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Display */}
        {recommendations.length > 0 && (
          <div className="mt-8">
            <FertilizerRecommendation recommendationData={recommendations[0]} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SoilHealthPage;
