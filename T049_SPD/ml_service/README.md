# 🌿 Plant Disease Detection Backend API

A FastAPI-based backend system for detecting diseases in plant leaves using deep learning models. This system supports multiple crop types with dedicated disease detection models for each crop and includes auto-crop detection capabilities.

## 🚀 Features

- **Multi-Crop Support**: Dedicated models for 5 different crop types (corn, tomato, potato, rice, wheat)
- **Auto-Crop Detection**: Automatically identifies the crop type from leaf images
- **Disease Classification**: Detects various diseases for each supported crop
- **Severity Assessment**: Provides disease severity levels and treatment recommendations
- **RESTful API**: Easy-to-use HTTP endpoints for integration
- **Image Processing**: Comprehensive image preprocessing and augmentation
- **Model Management**: Efficient loading and switching between crop-specific models
- **Batch Processing**: Support for processing multiple images at once

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Frontend      │────│   FastAPI        │────│   Model Manager     │
│   (Upload)      │    │   Backend        │    │   (5 Crop Models)   │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │
                                │
                       ┌──────────────────┐
                       │  Crop Detector   │
                       │  (Small Model)   │
                       └──────────────────┘
```

## 📡 API Endpoints

### Health Check

- `GET /` - Health check endpoint

### Model Management

- `GET /models` - Get list of available crop models
- `POST /activate-model` - Activate a specific crop model
- `GET /model-status` - Get status of all models

### Disease Detection

- `POST /detect-disease` - Main disease detection endpoint (auto-detects crop)
- `POST /detect-crop-only` - Only detect crop type from image

## 🛠️ Installation

### Prerequisites

- Python 3.8+
- CUDA-compatible GPU (optional, for faster inference)
- At least 4GB RAM
- 5GB free disk space for models

### Setup

1. **Create virtual environment**

   ```bash
   python3 -m venv venv #on windows it you might need to replace python3 with python
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env file with your configuration (download from this link https://drive.google.com/file/d/1WsF5qxjhuT5svZiGH6F3RJD-rZBQyZEa/view?usp=sharing)
   ```

4. **Create model directories**
   ```bash
   mkdir -p models/disease_models
   ```

## 🤖 Model Requirements

### Disease Detection Models

`.keras` models should:

- Accept input shape of (224, 224, 3)
- Use standard normalization (0-1)
- Output probabilities for disease classes
- Be named with crop type in filename

### Crop Detection Model

- Should classify images into crop types: corn, tomato, potato, rice, wheat
- Input shape: (224, 224, 3)
- Output: classes corresponding to crop types

## 📁 Project Structure

```
plant-disease-detection/
├── app.py                 # Main FastAPI application
├── config/
│   └── settings.py        # Configuration settings
├── services/
│   ├── model_manager.py   # Model loading and management
│   ├── crop_detector.py   # Crop detection service
│   └── disease_detector.py # Disease detection service
├── utils/
│   └── image_processor.py # Image preprocessing utilities
├── models/
│   ├── disease_models/    # Disease detection models
│   └── crop_detector.keras # Crop detection model
├── logs/                  # Application logs
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## 🚀 Usage

### Starting the Server

```bash
python app.py
```

The API will be available at `http://localhost:8000`

### API Documentation

Once running, visit:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Example API Usage

#### Detect Disease (Auto-detect crop)

```bash
curl -X POST "http://localhost:8000/detect-disease" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/leaf_image.jpg"
```

#### Response Example

```json
{
  "status": "success",
  "crop_detection": {
    "crop_type": "tomato",
    "confidence": 0.95,
    "auto_detected": true
  },
  "disease_detection": {
    "disease_class": "Tomato_Late_Blight",
    "disease_name": "Late Blight",
    "confidence": 0.87,
    "severity": "severe"
  },
  "model_used": "tomato_disease_model",
  "timestamp": "2024-01-15T10:30:00"
}
```

## ⚙️ Configuration

Key configuration options in `.env`:

- `MAX_IMAGE_SIZE`: Maximum allowed image size (bytes)
- `CROP_DETECTION_THRESHOLD`: Minimum confidence for crop detection
- `DISEASE_DETECTION_THRESHOLD`: Minimum confidence for disease detection
- `ENABLE_GPU`: Enable GPU acceleration if available
- `MODEL_CACHE_SIZE`: Number of models to keep in memory

---

## 🧪 Research Models

_This backend was built to serve the models from the original research project below:_

### Research Overview

This project originally explored deep learning approaches for classifying leaf diseases across five crops using transfer learning with MobileNetV2.

### Target Crops:

- Tomato
- Corn
- Grape
- Mango
- Peanut

### Models Structure:

```
original_models/
├── tomato_mnv2/
├── corn_mnv2/
├── grape_mnv2/
├── mango_mnv2/
├── peanut_mnv2/
└── combined_mnv2/
```

### Research Features:

- ⚙️ Trained with **MobileNetV2**
- 🔁 Balanced dataset using oversampling & rotation augmentation
- 📊 Accuracy, confusion matrices, and test performance plots
- 🧠 Individual and unified model approaches
- 📉 Bias and overfitting addressed using dataset curation
- 🌱 Tested on **real-world unseen leaf images**

### Dataset

Balanced dataset curated from multiple open sources (PlantVillage, Mendeley, etc.). Each class contains 1200 images.
📦 Hosted on **[Kaggle](https://www.kaggle.com/datasets/ankurpaul52/balanced-multi-crop-plant-disease-dataset)**
