import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 text-center px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-extrabold mb-6 text-gray-800">
            Empowering India's Farmers with AI 🌾
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Breaking barriers of traditional farming with personalized,
            real-time advisory services in your local language. No internet
            required for critical pest and disease detection.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition font-semibold text-lg">
              Download App
            </button>
            <button className="bg-white text-green-600 border border-green-600 px-8 py-4 rounded-lg hover:bg-green-50 transition font-semibold text-lg">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-16 px-6 bg-red-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
            The Challenges Our Farmers Face
          </h3>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              <strong>70% of India's small and marginal farmers</strong> rely on
              traditional knowledge, local shopkeepers, or guesswork for
              critical decisions about crop selection, pest control, and
              fertilizer use.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-gray-600">
              <div>
                <h4 className="font-semibold text-red-600 mb-3">
                  Current Problems:
                </h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>No access to personalized, real-time advisory</li>
                  <li>Language barriers and low digital literacy</li>
                  <li>Overuse of chemicals causing environmental damage</li>
                  <li>Poor yield and excessive input costs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 mb-3">
                  Consequences:
                </h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Reduced farm productivity</li>
                  <li>Financial stress for farming families</li>
                  <li>Soil degradation and water pollution</li>
                  <li>Limited access to modern agri-tech resources</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Our AI-Powered Solution
          </h3>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            KrishiMitra AI provides comprehensive farming assistance with
            innovative features designed specifically for Indian agricultural
            conditions.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 shadow-lg rounded-xl bg-green-50 border border-green-100 hover:shadow-xl transition">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌦️</span>
              </div>
              <h4 className="font-bold text-xl mb-3 text-gray-800">
                Smart Weather Alerts
              </h4>
              <p className="text-gray-600">
                Real-time weather-based alerts and predictive insights for
                better crop planning and protection.
              </p>
            </div>

            <div className="p-6 shadow-lg rounded-xl bg-blue-50 border border-blue-100 hover:shadow-xl transition">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🧪</span>
              </div>
              <h4 className="font-bold text-xl mb-3 text-gray-800">
                Soil Health Analysis
              </h4>
              <p className="text-gray-600">
                Personalized soil health recommendations and optimal fertilizer
                guidance based on your land.
              </p>
            </div>

            <div className="p-6 shadow-lg rounded-xl bg-purple-50 border border-purple-100 hover:shadow-xl transition">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h4 className="font-bold text-xl mb-3 text-gray-800">
                AI Pest Detection
              </h4>
              <p className="text-gray-600">
                <strong>Offline ML model (only 10MB)</strong> for instant pest
                and disease identification via image upload.
              </p>
            </div>

            <div className="p-6 shadow-lg rounded-xl bg-yellow-50 border border-yellow-100 hover:shadow-xl transition">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-bold text-xl mb-3 text-gray-800">
                Market Intelligence
              </h4>
              <p className="text-gray-600">
                Live market price tracking and demand forecasting to maximize
                your profits.
              </p>
            </div>

            <div className="p-6 shadow-lg rounded-xl bg-red-50 border border-red-100 hover:shadow-xl transition">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎙️</span>
              </div>
              <h4 className="font-bold text-xl mb-3 text-gray-800">
                Voice Support
              </h4>
              <p className="text-gray-600">
                Multilingual voice assistance for farmers with low literacy
                levels - speak in your local language.
              </p>
            </div>

            <div className="p-6 shadow-lg rounded-xl bg-indigo-50 border border-indigo-100 hover:shadow-xl transition">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h4 className="font-bold text-xl mb-3 text-gray-800">
                Location-Specific
              </h4>
              <p className="text-gray-600">
                Hyper-local advisory services accounting for soil type, weather
                patterns, and crop history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Highlights */}
      <section className="py-16 px-6 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8 text-gray-800">
            Built for Indian Farmers
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">🗣️</div>
              <h4 className="font-bold text-lg mb-2">Multilingual</h4>
              <p className="text-gray-600">Available in 12+ Indian languages</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="font-bold text-lg mb-2">Lightweight</h4>
              <p className="text-gray-600">
                10MB offline ML model for pest detection
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-4">🌐</div>
              <h4 className="font-bold text-lg mb-2">Low Data Usage</h4>
              <p className="text-gray-600">Works efficiently on 2G networks</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">
            Ready to Transform Your Farming?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of farmers who are increasing their yield and income
            with KrishiMitra AI
          </p>
          <button className="bg-white text-green-600 px-10 py-4 rounded-lg hover:bg-gray-100 transition font-bold text-lg shadow-lg">
            Download Free App Now
          </button>
          <p className="mt-4 text-green-100">Available on Android and iOS</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
