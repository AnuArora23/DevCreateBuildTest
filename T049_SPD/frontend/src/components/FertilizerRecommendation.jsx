import React from "react";

const FertilizerRecommendation = ({ recommendationData }) => {
  if (!recommendationData) return null;

  const { crop, recommended, reason, provider, confidence } =
    recommendationData;

  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return "text-green-600 bg-green-50";
    if (conf >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getConfidenceLevel = (conf) => {
    if (conf >= 0.8) return "High";
    if (conf >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              🌾 Fertilizer Recommendation
            </h2>
            <p className="text-green-100">Personalized plan for your crop</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">{crop}</div>
            <div className="text-green-100 text-sm">Selected Crop</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Macronutrients Card */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              📊
            </span>
            Macronutrients Requirements (kg/ha)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {recommended.nKgPerHa}
              </div>
              <div className="text-sm font-medium text-blue-800">
                Nitrogen (N)
              </div>
              <div className="text-xs text-blue-600 mt-1">kg/ha</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {recommended.pKgPerHa}
              </div>
              <div className="text-sm font-medium text-purple-800">
                Phosphorus (P)
              </div>
              <div className="text-xs text-purple-600 mt-1">kg/ha</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {recommended.kKgPerHa}
              </div>
              <div className="text-sm font-medium text-orange-800">
                Potassium (K)
              </div>
              <div className="text-xs text-orange-600 mt-1">kg/ha</div>
            </div>
          </div>
        </div>

        {/* Fertilizer Types & Timing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fertilizer Types */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                🧪
              </span>
              Recommended Fertilizers
            </h3>
            <div className="space-y-3">
              {recommended.fertilizerTypes.map((type, idx) => (
                <div
                  key={idx}
                  className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                >
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Application Timing */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                ⏰
              </span>
              Application Schedule
            </h3>
            <div className="space-y-4">
              {recommended.timing.map((step, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-yellow-600 font-bold text-sm">
                      {idx + 1}
                    </span>
                  </div>
                  <p className="text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              💡
            </span>
            Analysis & Reasoning
          </h3>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-gray-700 leading-relaxed">{reason}</p>
          </div>
        </div>

        {/* Footer with Provider & Confidence */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex items-center mb-3 sm:mb-0">
            <span className="text-gray-500 text-sm mr-2">Provider:</span>
            <span className="font-medium text-gray-700">{provider}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <span className="text-gray-500 text-sm mr-2">Confidence:</span>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(
                  confidence
                )}`}
              >
                {getConfidenceLevel(confidence)} (
                {(confidence * 100).toFixed(0)}%)
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            📋 Save Recommendation
          </button>
          <button className="flex-1 bg-white text-green-600 py-3 px-6 rounded-xl font-semibold border border-green-200 hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            📧 Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default FertilizerRecommendation;
