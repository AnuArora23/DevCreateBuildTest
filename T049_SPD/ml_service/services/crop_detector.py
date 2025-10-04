import logging
import tensorflow as tf
import numpy as np
from typing import Dict, Optional, Any
from pathlib import Path
import json

logger = logging.getLogger(__name__)

class CropDetector:
    """
    Service for detecting crop type from leaf images
    This small model determines which crop the leaf belongs to
    """
    
    def __init__(self, model_path: str):
        """
        Initialize CropDetector
        
        Args:
            model_path: Path to the crop detection model
        """
        self.model_path = Path(model_path)
        self.model: Optional[tf.keras.Model] = None
        self.is_model_loaded = False
        
        # Default crop classes - modify based on your actual crop detection model
        self.crop_classes = [
            "corn", "tomato", "grape", "mango", "peanut"
        ]
        
        # Load crop classes from config if available
        self._load_crop_classes()
    
    def _load_crop_classes(self):
        """Load crop classes from configuration file if it exists"""
        config_path = self.model_path.parent / "crop_classes.json"
        if config_path.exists():
            try:
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    self.crop_classes = config.get("classes", self.crop_classes)
                logger.info(f"Loaded crop classes: {self.crop_classes}")
            except Exception as e:
                logger.warning(f"Could not load crop classes config: {str(e)}")
        else:
            # Create default config
            self._create_default_config()
    
    def _create_default_config(self):
        """Create default crop classes configuration"""
        try:
            config_path = self.model_path.parent / "crop_classes.json"
            config_path.parent.mkdir(parents=True, exist_ok=True)
            
            config = {
                "classes": self.crop_classes,
                "description": "Crop types that can be detected",
                "input_shape": [224, 224, 3]
            }
            
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            logger.info("Created default crop classes configuration")
        except Exception as e:
            logger.warning(f"Could not create crop classes config: {str(e)}")
    
    def load_model(self) -> bool:
        """
        Load the crop detection model
        
        Returns:
            bool: True if successful, False otherwise
        """
        if self.is_model_loaded:
            logger.info("Crop detection model already loaded")
            return True
        
        try:
            if not self.model_path.exists():
                logger.error(f"Crop detection model not found at {self.model_path}")
                # For development/demo purposes, we'll create a dummy model
                return self._create_dummy_model()
            
            logger.info(f"Loading crop detection model from {self.model_path}")
            self.model = tf.keras.models.load_model(str(self.model_path))
            self.is_model_loaded = True
            logger.info("Crop detection model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading crop detection model: {str(e)}")
            # Fallback to dummy model for development
            return self._create_dummy_model()
    
    def _create_dummy_model(self) -> bool:
        """
        Create a dummy crop detection model for development/demo purposes
        This can be used when the actual model is not available
        """
        try:
            logger.warning("Creating dummy crop detection model for development")
            
            # Simple dummy model that outputs random probabilities
            inputs = tf.keras.layers.Input(shape=(224, 224, 3))
            x = tf.keras.layers.GlobalAveragePooling2D()(inputs)
            x = tf.keras.layers.Dense(64, activation='relu')(x)
            outputs = tf.keras.layers.Dense(len(self.crop_classes), activation='softmax')(x)
            
            self.model = tf.keras.Model(inputs=inputs, outputs=outputs)
            self.is_model_loaded = True
            
            logger.warning("Dummy crop detection model created - this is for development only!")
            return True
            
        except Exception as e:
            logger.error(f"Error creating dummy model: {str(e)}")
            return False
    
    def detect_crop(self, preprocessed_image: np.ndarray) -> Dict[str, Any]:
        """
        Detect crop type from preprocessed image
        
        Args:
            preprocessed_image: Preprocessed image array (batch, height, width, channels)
            
        Returns:
            Dict containing crop detection results
        """
        if not self.is_model_loaded:
            if not self.load_model():
                raise RuntimeError("Crop detection model could not be loaded")
        
        try:
            # Make prediction
            predictions = self.model.predict(preprocessed_image, verbose=0)
            
            # Get probabilities for all crops
            all_predictions = {}
            for i, crop in enumerate(self.crop_classes):
                if i < len(predictions[0]):
                    all_predictions[crop] = float(predictions[0][i])
            
            # Get the crop with highest confidence
            predicted_class_idx = predictions.argmax(axis=1)[0]
            confidence = float(predictions.max(axis=1)[0])
            
            if predicted_class_idx < len(self.crop_classes):
                crop_type = self.crop_classes[predicted_class_idx]
            else:
                crop_type = "unknown"
                confidence = 0.0
            
            result = {
                "crop_type": crop_type,
                "confidence": confidence,
                "all_predictions": all_predictions,
                "threshold_met": confidence > 0.5  # Configurable threshold
            }
            
            logger.info(f"Detected crop: {crop_type} with confidence: {confidence:.3f}")
            return result
            
        except Exception as e:
            logger.error(f"Error in crop detection: {str(e)}")
            # Fallback to default prediction
            return self._fallback_prediction()
    
    def _fallback_prediction(self) -> Dict[str, Any]:
        """
        Fallback prediction when detection fails
        Returns a default crop type with low confidence
        """
        logger.warning("Using fallback crop prediction")
        return {
            "crop_type": self.crop_classes[0] if self.crop_classes else "unknown",
            "confidence": 0.1,  # Very low confidence
            "all_predictions": {crop: 0.1 for crop in self.crop_classes},
            "threshold_met": False,
            "fallback": True
        }
    
    def is_loaded(self) -> bool:
        """Check if the crop detection model is loaded"""
        return self.is_model_loaded
    
    def get_supported_crops(self) -> list:
        """Get list of supported crop types"""
        return self.crop_classes.copy()
    
    def set_confidence_threshold(self, threshold: float):
        """
        Set confidence threshold for crop detection
        
        Args:
            threshold: Confidence threshold (0.0 to 1.0)
        """
        if 0.0 <= threshold <= 1.0:
            self.confidence_threshold = threshold
            logger.info(f"Set crop detection confidence threshold to {threshold}")
        else:
            logger.warning("Invalid threshold value. Must be between 0.0 and 1.0")
    
    def validate_prediction(self, crop_type: str, confidence: float) -> bool:
        """
        Validate if a crop prediction meets quality criteria
        
        Args:
            crop_type: Detected crop type
            confidence: Detection confidence
            
        Returns:
            bool: True if prediction is valid
        """
        if crop_type not in self.crop_classes:
            return False
        
        if confidence < getattr(self, 'confidence_threshold', 0.5):
            return False
        
        return True
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the crop detection model"""
        return {
            "model_loaded": self.is_model_loaded,
            "model_path": str(self.model_path),
            "supported_crops": self.crop_classes,
            "num_classes": len(self.crop_classes),
            "model_exists": self.model_path.exists() if self.model_path else False
        }