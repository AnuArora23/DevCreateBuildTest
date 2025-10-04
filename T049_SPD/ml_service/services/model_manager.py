import os
import logging
import tensorflow as tf
from typing import Dict, List, Optional, Any
import pickle
import json
from pathlib import Path

logger = logging.getLogger(__name__)

class ModelManager:
    """
    Manages multiple crop-specific disease detection models
    Handles model loading, activation, and switching between models
    """
    
    def __init__(self, models_directory: str):
        """
        Initialize ModelManager
        
        Args:
            models_directory: Path to directory containing all .keras model files
        """
        self.models_directory = Path(models_directory)
        self.loaded_models: Dict[str, tf.keras.Model] = {}
        self.active_model: Optional[str] = None
        self.model_configs: Dict[str, Dict] = {}
        
        # Expected crop types (you can modify this based on your models)
        self.supported_crops = [
            "corn", "tomato", "grape", "mango", "peanut"
        ]
        
        self._discover_models()
        self._load_model_configs()
    
    def _discover_models(self):
        """Discover available .keras model files"""
        self.available_models = {}
        
        if not self.models_directory.exists():
            logger.warning(f"Models directory {self.models_directory} does not exist")
            return
        
        # Look for .keras files
        for keras_file in self.models_directory.glob("*.keras"):
            # Extract crop name from filename (assuming format like "corn_disease_model.keras")
            filename = keras_file.stem.lower()
            crop_name = None
            
            # Try to match with supported crops
            for crop in self.supported_crops:
                if crop in filename:
                    crop_name = crop
                    break
            
            if crop_name:
                self.available_models[crop_name] = str(keras_file)
                logger.info(f"Found model for {crop_name}: {keras_file}")
            else:
                logger.warning(f"Could not determine crop type for model: {keras_file}")
    
    def _load_model_configs(self):
        """Load model configurations if they exist"""
        config_file = self.models_directory / "model_configs.json"
        if config_file.exists():
            try:
                with open(config_file, 'r') as f:
                    self.model_configs = json.load(f)
                logger.info("Loaded model configurations")
            except Exception as e:
                logger.error(f"Error loading model configs: {str(e)}")
                self.model_configs = {}
        else:
            # Create default configurations
            self._create_default_configs()
    
    def _create_default_configs(self):
        """Create default configurations for models"""
        # Default disease classes for each crop (these will be auto-detected from your models)
        default_configs = {
            "corn": {
                "classes": [
                    "Corn__Blight",
                    "Corn__Common_Rust", 
                    "Corn__Gray_Leaf_Spot",
                    "Corn__Healthy"
                ],
                "input_shape": [224, 224, 3],
                "preprocessing": "standard"
            },
            "tomato": {
                "classes": [],  # Will be auto-detected from model
                "input_shape": [224, 224, 3],
                "preprocessing": "standard"
            },
            "grape": {
                "classes": [],  # Will be auto-detected from model
                "input_shape": [224, 224, 3],
                "preprocessing": "standard"
            },
            "mango": {
                "classes": [],  # Will be auto-detected from model
                "input_shape": [224, 224, 3],
                "preprocessing": "standard"
            },
            "peanut": {
                "classes": [],  # Will be auto-detected from model
                "input_shape": [224, 224, 3],
                "preprocessing": "standard"
            }
        }
        
        # Only keep configs for available models
        self.model_configs = {
            crop: config for crop, config in default_configs.items() 
            if crop in self.available_models
        }
        
        # Save configurations
        try:
            config_file = self.models_directory / "model_configs.json"
            with open(config_file, 'w') as f:
                json.dump(self.model_configs, f, indent=2)
            logger.info("Created default model configurations")
        except Exception as e:
            logger.error(f"Error saving model configs: {str(e)}")
    
    def load_model(self, crop_type: str) -> bool:
        """
        Load a specific crop model into memory
        
        Args:
            crop_type: The crop type to load model for
            
        Returns:
            bool: True if successful, False otherwise
        """
        crop_type = crop_type.lower()
        
        if crop_type not in self.available_models:
            logger.error(f"Model for {crop_type} not found")
            return False
        
        if crop_type in self.loaded_models:
            logger.info(f"Model for {crop_type} already loaded")
            return True
        
        try:
            model_path = self.available_models[crop_type]
            logger.info(f"Loading model for {crop_type} from {model_path}")
            
            # Load the Keras model
            model = tf.keras.models.load_model(model_path)
            self.loaded_models[crop_type] = model
            
            logger.info(f"Successfully loaded {crop_type} model")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model for {crop_type}: {str(e)}")
            return False
    
    def activate_model(self, crop_type: str) -> bool:
        """
        Activate a specific crop model (load if not already loaded)
        
        Args:
            crop_type: The crop type to activate
            
        Returns:
            bool: True if successful, False otherwise
        """
        crop_type = crop_type.lower()
        
        # Load model if not already loaded
        if not self.load_model(crop_type):
            return False
        
        self.active_model = crop_type
        logger.info(f"Activated model for {crop_type}")
        return True
    
    def get_model(self, crop_type: str) -> Optional[tf.keras.Model]:
        """
        Get a loaded model for the specified crop
        
        Args:
            crop_type: The crop type
            
        Returns:
            The Keras model if loaded, None otherwise
        """
        crop_type = crop_type.lower()
        
        if crop_type not in self.loaded_models:
            # Try to load it
            if not self.load_model(crop_type):
                return None
        
        return self.loaded_models.get(crop_type)
    
    def get_available_models(self) -> List[str]:
        """Get list of available crop models"""
        return list(self.available_models.keys())
    
    def get_loaded_models(self) -> List[str]:
        """Get list of currently loaded models"""
        return list(self.loaded_models.keys())
    
    def get_active_model(self) -> Optional[str]:
        """Get the currently active model"""
        return self.active_model
    
    def get_model_config(self, crop_type: str) -> Optional[Dict]:
        """
        Get configuration for a specific crop model
        
        Args:
            crop_type: The crop type
            
        Returns:
            Model configuration dict if available
        """
        return self.model_configs.get(crop_type.lower())
    
    def get_disease_classes(self, crop_type: str) -> List[str]:
        """
        Get disease classes for a specific crop
        
        Args:
            crop_type: The crop type
            
        Returns:
            List of disease class names
        """
        config = self.get_model_config(crop_type)
        if config:
            return config.get("classes", [])
        return []
    
    def unload_model(self, crop_type: str) -> bool:
        """
        Unload a model from memory to free up resources
        
        Args:
            crop_type: The crop type to unload
            
        Returns:
            bool: True if successful
        """
        crop_type = crop_type.lower()
        
        if crop_type in self.loaded_models:
            del self.loaded_models[crop_type]
            if self.active_model == crop_type:
                self.active_model = None
            logger.info(f"Unloaded model for {crop_type}")
            return True
        
        return False
    
    def unload_all_models(self):
        """Unload all models from memory"""
        self.loaded_models.clear()
        self.active_model = None
        logger.info("Unloaded all models")
    
    def get_model_status(self) -> Dict[str, Any]:
        """Get status information for all models"""
        status = {}
        
        for crop_type in self.available_models:
            status[crop_type] = {
                "available": True,
                "loaded": crop_type in self.loaded_models,
                "active": crop_type == self.active_model,
                "model_path": self.available_models[crop_type],
                "classes_count": len(self.get_disease_classes(crop_type))
            }
        
        return status
    
    def predict(self, crop_type: str, preprocessed_image) -> Optional[Dict]:
        """
        Make prediction using specified crop model
        
        Args:
            crop_type: The crop type
            preprocessed_image: Preprocessed image array
            
        Returns:
            Prediction results dict
        """
        model = self.get_model(crop_type)
        if model is None:
            logger.error(f"Model for {crop_type} not available")
            return None
        
        try:
            # Make prediction
            predictions = model.predict(preprocessed_image, verbose=0)
            
            # Get class names
            classes = self.get_disease_classes(crop_type)
            
            # Get predicted class and confidence
            predicted_class_idx = predictions.argmax(axis=1)[0]
            confidence = float(predictions.max(axis=1)[0])
            
            if predicted_class_idx < len(classes):
                predicted_class = classes[predicted_class_idx]
            else:
                predicted_class = f"Class_{predicted_class_idx}"
            
            return {
                "predicted_class": predicted_class,
                "confidence": confidence,
                "all_predictions": {
                    classes[i]: float(predictions[0][i]) 
                    for i in range(len(classes)) if i < len(predictions[0])
                }
            }
            
        except Exception as e:
            logger.error(f"Error making prediction with {crop_type} model: {str(e)}")
            return None