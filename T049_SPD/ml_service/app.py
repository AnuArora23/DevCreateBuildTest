from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from typing import Optional
import os
from datetime import datetime

from services.model_manager import ModelManager
from services.crop_detector import CropDetector
from services.disease_detector import DiseaseDetector
from utils.image_processor import ImageProcessor
from config.settings import Settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Plant Disease Detection API",
    description="Backend API for detecting plant diseases using deep learning models",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
settings = Settings()
model_manager = ModelManager(settings.MODEL_PATH)
crop_detector = CropDetector(settings.CROP_DETECTOR_MODEL_PATH)
disease_detector = DiseaseDetector(model_manager)
image_processor = ImageProcessor()

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    try:
        logger.info("Loading crop detection model...")
        crop_detector.load_model()
        logger.info("Models initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize models: {str(e)}")
        raise e

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Plant Disease Detection API is running", "timestamp": datetime.now()}

@app.get("/models")
async def get_available_models():
    """Get list of available crop models"""
    try:
        available_models = model_manager.get_available_models()
        return {
            "available_models": available_models,
            "total_models": len(available_models)
        }
    except Exception as e:
        logger.error(f"Error fetching available models: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch available models")

@app.post("/detect-disease")
async def detect_disease(
    image: UploadFile = File(..., description="Plant leaf image for disease detection"),
    crop_type: Optional[str] = Form(None, description="Specific crop type (optional - will auto-detect if not provided)")
):
    """
    Main endpoint for disease detection
    - Accepts leaf image
    - Auto-detects crop type if not provided
    - Routes to appropriate disease detection model
    - Returns disease prediction and confidence
    """
    try:
        # Validate uploaded file
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and preprocess image
        image_data = await image.read()
        processed_image = image_processor.preprocess_image(image_data)
        
        # Determine crop type
        if crop_type is None:
            logger.info("Auto-detecting crop type...")
            crop_detection_result = crop_detector.detect_crop(processed_image)
            detected_crop = crop_detection_result["crop_type"]
            crop_confidence = crop_detection_result["confidence"]
        else:
            detected_crop = crop_type.lower()
            crop_confidence = 1.0  # Manual selection
        
        logger.info(f"Using crop type: {detected_crop} (confidence: {crop_confidence})")
        
        # Perform disease detection
        disease_result = disease_detector.detect_disease(processed_image, detected_crop)
        
        response = {
            "status": "success",
            "crop_detection": {
                "crop_type": detected_crop,
                "confidence": crop_confidence,
                "auto_detected": crop_type is None
            },
            "disease_detection": {
                "disease_class": disease_result["disease_class"],
                "disease_name": disease_result["disease_name"],
                "confidence": disease_result["confidence"],
                "severity": disease_result.get("severity", "unknown")
            },
            "model_used": disease_result["model_used"],
            "timestamp": datetime.now().isoformat()
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        logger.error(f"Error in disease detection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Disease detection failed: {str(e)}")

@app.post("/activate-model")
async def activate_model(crop_type: str = Form(..., description="Crop type to activate model for")):
    """
    Activate a specific crop model for faster inference
    This preloads the model into memory
    """
    try:
        success = model_manager.activate_model(crop_type.lower())
        if success:
            return {
                "status": "success",
                "message": f"Model for {crop_type} activated successfully",
                "active_model": crop_type.lower()
            }
        else:
            raise HTTPException(status_code=404, detail=f"Model for {crop_type} not found")
    except Exception as e:
        logger.error(f"Error activating model: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to activate model")

@app.post("/detect-crop-only")
async def detect_crop_only(image: UploadFile = File(...)):
    """
    Endpoint to only detect crop type from leaf image
    """
    try:
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_data = await image.read()
        processed_image = image_processor.preprocess_image(image_data)
        
        result = crop_detector.detect_crop(processed_image)
        
        return {
            "status": "success",
            "crop_type": result["crop_type"],
            "confidence": result["confidence"],
            "all_predictions": result.get("all_predictions", {}),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in crop detection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Crop detection failed: {str(e)}")

@app.get("/model-status")
async def get_model_status():
    """Get status of all models"""
    try:
        status = {
            "crop_detector": {
                "loaded": crop_detector.is_loaded(),
                "model_path": settings.CROP_DETECTOR_MODEL_PATH
            },
            "disease_models": model_manager.get_model_status(),
            "active_model": model_manager.get_active_model()
        }
        return status
    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get model status")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )