import os
from pathlib import Path
from typing import List, Optional
import logging
import logging.handlers

class Settings:
    """
    Configuration settings for the Plant Disease Detection application
    """
    
    def __init__(self):
        # Base directories
        self.BASE_DIR = Path(__file__).parent.parent
        self.MODELS_DIR = self.BASE_DIR / "models"
        self.LOGS_DIR = self.BASE_DIR / "logs"
        self.TEMP_DIR = self.BASE_DIR / "temp"
        
        # Create directories if they don't exist
        self._create_directories()
        
        # Model paths
        self.MODEL_PATH = str(self.MODELS_DIR / "disease_models")
        self.CROP_DETECTOR_MODEL_PATH = str(self.MODELS_DIR / "crop_detector.keras")
        
        # API settings
        self.API_HOST = os.getenv("API_HOST", "0.0.0.0")
        self.API_PORT = int(os.getenv("API_PORT", "8000"))
        self.API_RELOAD = os.getenv("API_RELOAD", "True").lower() == "true"
        self.API_LOG_LEVEL = os.getenv("API_LOG_LEVEL", "info")
        
        # CORS settings
        self.CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
        self.CORS_CREDENTIALS = os.getenv("CORS_CREDENTIALS", "True").lower() == "true"
        self.CORS_METHODS = os.getenv("CORS_METHODS", "*").split(",")
        self.CORS_HEADERS = os.getenv("CORS_HEADERS", "*").split(",")
        
        # Image processing settings
        self.MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", "10485760"))  # 10MB
        self.ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/bmp", "image/tiff"]
        self.IMAGE_PREPROCESSING_SIZE = (224, 224)  # Height, Width
        self.IMAGE_NORMALIZATION = "standard"  # "standard", "imagenet", "centered"
        
        # Model settings
        self.MODEL_LOADING_TIMEOUT = int(os.getenv("MODEL_LOADING_TIMEOUT", "300"))  # 5 minutes
        self.MAX_BATCH_SIZE = int(os.getenv("MAX_BATCH_SIZE", "32"))
        self.MODEL_PREDICTION_TIMEOUT = int(os.getenv("MODEL_PREDICTION_TIMEOUT", "60"))  # 1 minute
        
        # Supported crops (update based on your actual models)
        self.SUPPORTED_CROPS = [
            "corn", "tomato", "grape", "mango", "peanut"
        ]
        
        # Confidence thresholds
        self.CROP_DETECTION_THRESHOLD = float(os.getenv("CROP_DETECTION_THRESHOLD", "0.5"))
        self.DISEASE_DETECTION_THRESHOLD = float(os.getenv("DISEASE_DETECTION_THRESHOLD", "0.6"))
        
        # Logging settings
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
        self.LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        self.LOG_FILE = str(self.LOGS_DIR / "app.log")
        self.LOG_MAX_BYTES = int(os.getenv("LOG_MAX_BYTES", "10485760"))  # 10MB
        self.LOG_BACKUP_COUNT = int(os.getenv("LOG_BACKUP_COUNT", "5"))
        
        # Database settings (for future expansion)
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///plant_disease_detection.db")
        
        # Cache settings
        self.ENABLE_MODEL_CACHING = os.getenv("ENABLE_MODEL_CACHING", "True").lower() == "true"
        self.MODEL_CACHE_SIZE = int(os.getenv("MODEL_CACHE_SIZE", "3"))  # Number of models to keep in memory
        
        # Security settings
        self.SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        
        # Rate limiting
        self.RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
        
        # External services (for future expansion)
        self.TRANSFORMER_MODEL_API = os.getenv("TRANSFORMER_MODEL_API", "")
        self.TRANSFORMER_MODEL_KEY = os.getenv("TRANSFORMER_MODEL_KEY", "")
        
        # Development settings
        self.DEBUG = os.getenv("DEBUG", "False").lower() == "true"
        self.TESTING = os.getenv("TESTING", "False").lower() == "true"
        
        # Performance settings
        self.ENABLE_GPU = os.getenv("ENABLE_GPU", "True").lower() == "true"
        self.GPU_MEMORY_LIMIT = os.getenv("GPU_MEMORY_LIMIT", "2048")  # MB
        
        # Initialize logging
        self._setup_logging()
    
    def _create_directories(self):
        """Create necessary directories"""
        directories = [
            self.MODELS_DIR,
            self.MODELS_DIR / "disease_models",
            self.LOGS_DIR,
            self.TEMP_DIR
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    def _setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=getattr(logging, self.LOG_LEVEL),
            format=self.LOG_FORMAT,
            handlers=[
                logging.StreamHandler(),
                logging.handlers.RotatingFileHandler(
                    self.LOG_FILE,
                    maxBytes=self.LOG_MAX_BYTES,
                    backupCount=self.LOG_BACKUP_COUNT
                ) if not self.TESTING else logging.NullHandler()
            ]
        )
    
    def get_model_config(self) -> dict:
        """Get model-related configuration"""
        return {
            "models_directory": self.MODEL_PATH,
            "crop_detector_path": self.CROP_DETECTOR_MODEL_PATH,
            "supported_crops": self.SUPPORTED_CROPS,
            "crop_threshold": self.CROP_DETECTION_THRESHOLD,
            "disease_threshold": self.DISEASE_DETECTION_THRESHOLD,
            "max_batch_size": self.MAX_BATCH_SIZE,
            "prediction_timeout": self.MODEL_PREDICTION_TIMEOUT,
            "enable_gpu": self.ENABLE_GPU,
            "gpu_memory_limit": self.GPU_MEMORY_LIMIT
        }
    
    def get_image_config(self) -> dict:
        """Get image processing configuration"""
        return {
            "max_size": self.MAX_IMAGE_SIZE,
            "allowed_types": self.ALLOWED_IMAGE_TYPES,
            "preprocessing_size": self.IMAGE_PREPROCESSING_SIZE,
            "normalization": self.IMAGE_NORMALIZATION
        }
    
    def get_api_config(self) -> dict:
        """Get API configuration"""
        return {
            "host": self.API_HOST,
            "port": self.API_PORT,
            "reload": self.API_RELOAD,
            "log_level": self.API_LOG_LEVEL,
            "cors_origins": self.CORS_ORIGINS,
            "cors_credentials": self.CORS_CREDENTIALS,
            "cors_methods": self.CORS_METHODS,
            "cors_headers": self.CORS_HEADERS,
            "rate_limit": self.RATE_LIMIT_PER_MINUTE
        }
    
    def get_logging_config(self) -> dict:
        """Get logging configuration"""
        return {
            "level": self.LOG_LEVEL,
            "format": self.LOG_FORMAT,
            "file": self.LOG_FILE,
            "max_bytes": self.LOG_MAX_BYTES,
            "backup_count": self.LOG_BACKUP_COUNT
        }
    
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.DEBUG
    
    def is_testing(self) -> bool:
        """Check if running in testing mode"""
        return self.TESTING
    
    def validate_settings(self) -> List[str]:
        """
        Validate settings and return list of issues
        
        Returns:
            List of validation issues (empty if all valid)
        """
        issues = []
        
        # Check if models directory exists
        if not self.MODELS_DIR.exists():
            issues.append(f"Models directory does not exist: {self.MODELS_DIR}")
        
        # Check image size limits
        if self.MAX_IMAGE_SIZE <= 0:
            issues.append("MAX_IMAGE_SIZE must be positive")
        
        # Check preprocessing size
        if len(self.IMAGE_PREPROCESSING_SIZE) != 2 or any(s <= 0 for s in self.IMAGE_PREPROCESSING_SIZE):
            issues.append("IMAGE_PREPROCESSING_SIZE must be tuple of two positive integers")
        
        # Check thresholds
        if not (0.0 <= self.CROP_DETECTION_THRESHOLD <= 1.0):
            issues.append("CROP_DETECTION_THRESHOLD must be between 0.0 and 1.0")
        
        if not (0.0 <= self.DISEASE_DETECTION_THRESHOLD <= 1.0):
            issues.append("DISEASE_DETECTION_THRESHOLD must be between 0.0 and 1.0")
        
        # Check batch size
        if self.MAX_BATCH_SIZE <= 0:
            issues.append("MAX_BATCH_SIZE must be positive")
        
        # Check timeout values
        if self.MODEL_LOADING_TIMEOUT <= 0:
            issues.append("MODEL_LOADING_TIMEOUT must be positive")
        
        if self.MODEL_PREDICTION_TIMEOUT <= 0:
            issues.append("MODEL_PREDICTION_TIMEOUT must be positive")
        
        # Check supported crops
        if not self.SUPPORTED_CROPS:
            issues.append("SUPPORTED_CROPS cannot be empty")
        
        return issues
    
    def __str__(self) -> str:
        """String representation of settings"""
        return f"Settings(debug={self.DEBUG}, models_dir={self.MODELS_DIR}, api_port={self.API_PORT})"