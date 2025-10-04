import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const ChatBot = () => {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("english");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [autoPlay, setAutoPlay] = useState(true);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = getLanguageCode(language);

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);

        // Auto-send after voice input
        setTimeout(() => {
          handleSend(transcript);
        }, 500);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError("Speech recognition not supported in this browser");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [language]);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = getLanguageCode(language);
    }
  }, [language, recognition]);

  // Start voice input
  const startVoiceInput = () => {
    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setError("Error starting voice input");
      }
    }
  };

  // Stop voice input
  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Call ChatBot API
  const handleSend = async (text = query) => {
    const question = text || query;
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    setLoading(true);
    setError("");

    // Add user message to chat history
    const userMessage = {
      type: "user",
      content: question,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/chatBot/bot",
        {
          query: question.trim(),
          language: language,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      if (res.data.success) {
        const botResponse = res.data.data.answer;
        setResponse(botResponse);

        // Add bot response to chat history
        const botMessage = {
          type: "bot",
          content: botResponse,
          timestamp: new Date(),
          language: language,
        };
        setChatHistory((prev) => [...prev, botMessage]);

        // Auto-play response if enabled
        if (autoPlay) {
          setTimeout(() => {
            handleTextToSpeech(botResponse);
          }, 1000);
        }
      } else {
        throw new Error(res.data.message || "Failed to get response");
      }
    } catch (err) {
      console.error("ChatBot Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to get response from chatbot. Please try again.";
      setError(errorMessage);

      const errorMessageObj = {
        type: "error",
        content: errorMessage,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessageObj]);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  // Call Text-to-Speech API
  const handleTextToSpeech = async (text = response) => {
    if (!text.trim()) {
      setError("No text available for speech conversion");
      return;
    }

    setTtsLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/chatBot/text-to-speech",
        {
          text: text.trim(),
          language: language,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      if (res.data.success) {
        const audioData = res.data.data.audio;
        if (audioData.startsWith("data:audio/wav;base64,")) {
          const base64Data = audioData.split(",")[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            setTtsLoading(false);
          };

          audio.onerror = () => {
            setError("Failed to play audio");
            URL.revokeObjectURL(audioUrl);
            setTtsLoading(false);
          };

          await audio.play();
        } else {
          throw new Error("Invalid audio format");
        }
      } else {
        throw new Error(res.data.message || "TTS conversion failed");
      }
    } catch (err) {
      console.error("TTS Error:", err);

      // Fallback to browser's speech synthesis
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.lang = getLanguageCode(language);
        utterance.rate = 0.8;

        utterance.onend = () => setTtsLoading(false);
        utterance.onerror = () => {
          setError("Failed to play audio");
          setTtsLoading(false);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setError("Text-to-speech not supported in your browser");
        setTtsLoading(false);
      }
    }
  };

  const getLanguageCode = (lang) => {
    const languageMap = {
      english: "en-IN",
      hindi: "hi-IN",
      gujarati: "gu-IN",
      marathi: "mr-IN",
      tamil: "ta-IN",
      telugu: "te-IN",
      bengali: "bn-IN",
      kannada: "kn-IN",
    };
    return languageMap[lang] || "en-IN";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setResponse("");
    setError("");
  };

  const handleQuickQuestion = (question) => {
    setQuery(question);
    setTimeout(() => {
      handleSend(question);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <span className="text-3xl">🎤</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Krishi Mitra Voice Assistant
          </h1>
          <p className="text-gray-600 text-lg">
            Speak your questions and get voice responses in your preferred
            language
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">🎤 Voice Chat</h2>
                    <p className="text-green-100 text-sm">
                      Speak or type your agricultural questions
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1 text-sm">
                      <input
                        type="checkbox"
                        checked={autoPlay}
                        onChange={(e) => setAutoPlay(e.target.checked)}
                        className="rounded"
                      />
                      <span>Auto Voice</span>
                    </label>
                    <button
                      onClick={clearChat}
                      className="bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-lg text-sm transition"
                    >
                      Clear Chat
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-500 mt-16">
                    <div className="text-6xl mb-4">🎤</div>
                    <p className="text-lg">
                      Welcome to Krishi Mitra Voice Assistant!
                    </p>
                    <p className="text-sm">
                      Click the microphone or type to start
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 ${
                            message.type === "user"
                              ? "bg-green-500 text-white rounded-br-none"
                              : message.type === "error"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-white border border-gray-200 rounded-bl-none"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">
                              {message.type === "user"
                                ? "You"
                                : message.type === "error"
                                ? "Error"
                                : "Krishi Mitra"}
                            </span>
                            {message.type === "bot" && (
                              <button
                                onClick={() =>
                                  handleTextToSpeech(message.content)
                                }
                                disabled={ttsLoading}
                                className="text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 transition disabled:opacity-50"
                              >
                                {ttsLoading ? "🔊..." : "🔊 Speak"}
                              </button>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <div className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">
                              Krishi Mitra is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-3 mb-3">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="gujarati">Gujarati</option>
                    <option value="marathi">Marathi</option>
                    <option value="tamil">Tamil</option>
                    <option value="telugu">Telugu</option>
                    <option value="bengali">Bengali</option>
                    <option value="kannada">Kannada</option>
                  </select>

                  <button
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    <span className="text-lg">{isListening ? "⏹️" : "🎤"}</span>
                    <span>{isListening ? "Stop" : "Voice Input"}</span>
                  </button>
                </div>

                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your question or use voice input..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      onClick={handleSend}
                      disabled={loading || !query.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      {loading ? "⏳" : "📤"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {isListening && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <span className="text-blue-600 text-sm">
                        Listening... Speak now
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                🎤 Voice Controls
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Auto Voice Response
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPlay}
                      onChange={(e) => setAutoPlay(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Tip:</strong> Click the microphone button and speak
                    your question in {language}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                🚀 Quick Questions
              </h3>
              <div className="space-y-2">
                {[
                  "How to control aphids in wheat?",
                  "Best fertilizer for tomato plants",
                  "Organic farming methods",
                  "Soil preparation for rice",
                  "Water conservation techniques",
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-green-50 rounded-lg text-sm text-gray-700 transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                ⭐ Features
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600">🎤</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Voice Input</p>
                    <p className="text-sm text-gray-600">
                      Speak your questions
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">🔊</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Voice Output</p>
                    <p className="text-sm text-gray-600">Listen to responses</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600">🌐</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Multi-language</p>
                    <p className="text-sm text-gray-600">8 Indian languages</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
