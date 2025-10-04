import React, { useState } from "react";
import axios from "axios";

const PestDetection = () => {
  const [image, setImage] = useState(null);
  const [cropType, setCropType] = useState("");
  const [detectionResult, setDetectionResult] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !cropType) {
      alert("Please select an image and enter crop type");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("crop_type", cropType);

    setLoading(true);
    setError(null);
    setDetectionResult(null);
    setInterpretation(null);

    try {
      // 1️⃣ Detect disease
      const detectResponse = await axios.post(
        "http://192.168.3.22:8000/detect-disease",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      let detectionData = detectResponse.data;
      setDetectionResult(detectionData);
      detectionData = JSON.stringify(detectionData);
      console.log(detectionData);

      const interpretationResponse = await axios.post(
        "http://localhost:3000/api/chatBot/generateResult",
        { detectionResult: detectionData }
      );

      setInterpretation(interpretationResponse.data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Pest & Disease Detection</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Enter crop type"
          value={cropType}
          onChange={(e) => setCropType(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          {loading ? "Detecting..." : "Detect Disease"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {detectionResult && (
        <div className="mt-4 p-2 border rounded">
          <h3 className="font-bold">Detection Result:</h3>
          <pre>{JSON.stringify(detectionResult, null, 2)}</pre>
        </div>
      )}

      {interpretation && (
        <div className="mt-4 p-2 border rounded">
          <h3 className="font-bold">AI Interpretation:</h3>
          <p>{interpretation.interpretation}</p>
          {interpretation.audioFile && (
            <audio controls src={interpretation.audioFile} className="mt-2" />
          )}
        </div>
      )}
    </div>
  );
};

export default PestDetection;
