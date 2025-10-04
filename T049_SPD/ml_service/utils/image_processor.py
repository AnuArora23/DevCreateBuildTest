import cv2
import numpy as np
import logging
from PIL import Image
import io
from typing import Tuple, Union, Optional
import tensorflow as tf

logger = logging.getLogger(__name__)

class ImageProcessor:
    """
    Utility class for image preprocessing operations
    Handles image loading, resizing, normalization, and augmentation
    """
    
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        """
        Initialize ImageProcessor
        
        Args:
            target_size: Target image size for model input (height, width)
        """
        self.target_size = target_size
        self.normalization_method = "standard"  # or "imagenet"
        
        # ImageNet mean and std for normalization
        self.imagenet_mean = np.array([0.485, 0.456, 0.406])
        self.imagenet_std = np.array([0.229, 0.224, 0.225])
    
    def preprocess_image(self, image_data: bytes, normalize: bool = True) -> np.ndarray:
        """
        Preprocess image data for model inference
        
        Args:
            image_data: Raw image bytes
            normalize: Whether to normalize pixel values
            
        Returns:
            Preprocessed image array ready for model input
        """
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            img_array = np.array(image)
            
            # Resize image
            img_array = self.resize_image(img_array, self.target_size)
            
            # Normalize if requested
            if normalize:
                img_array = self.normalize_image(img_array)
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            logger.debug(f"Preprocessed image shape: {img_array.shape}")
            return img_array
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            raise ValueError(f"Failed to preprocess image: {str(e)}")
    
    def resize_image(self, image: np.ndarray, target_size: Tuple[int, int]) -> np.ndarray:
        """
        Resize image to target size
        
        Args:
            image: Input image array
            target_size: Target size (height, width)
            
        Returns:
            Resized image array
        """
        try:
            height, width = target_size
            
            # Use OpenCV for resizing (better quality)
            resized = cv2.resize(image, (width, height), interpolation=cv2.INTER_LANCZOS4)
            
            return resized
            
        except Exception as e:
            logger.error(f"Error resizing image: {str(e)}")
            # Fallback to PIL
            try:
                pil_image = Image.fromarray(image)
                resized_pil = pil_image.resize((target_size[1], target_size[0]), Image.LANCZOS)
                return np.array(resized_pil)
            except Exception as e2:
                logger.error(f"Fallback resize also failed: {str(e2)}")
                raise ValueError("Failed to resize image")
    
    def normalize_image(self, image: np.ndarray) -> np.ndarray:
        """
        Normalize image pixel values
        
        Args:
            image: Input image array
            
        Returns:
            Normalized image array
        """
        try:
            image = image.astype(np.float32)
            
            if self.normalization_method == "standard":
                # Standard normalization (0-1)
                image = image / 255.0
            elif self.normalization_method == "imagenet":
                # ImageNet normalization
                image = image / 255.0
                image = (image - self.imagenet_mean) / self.imagenet_std
            elif self.normalization_method == "centered":
                # Center around 0 (-1 to 1)
                image = (image / 127.5) - 1.0
            
            return image
            
        except Exception as e:
            logger.error(f"Error normalizing image: {str(e)}")
            raise ValueError("Failed to normalize image")
    
    def denormalize_image(self, image: np.ndarray) -> np.ndarray:
        """
        Denormalize image back to 0-255 range
        
        Args:
            image: Normalized image array
            
        Returns:
            Denormalized image array (0-255)
        """
        try:
            if self.normalization_method == "standard":
                image = image * 255.0
            elif self.normalization_method == "imagenet":
                image = (image * self.imagenet_std) + self.imagenet_mean
                image = image * 255.0
            elif self.normalization_method == "centered":
                image = (image + 1.0) * 127.5
            
            return np.clip(image, 0, 255).astype(np.uint8)
            
        except Exception as e:
            logger.error(f"Error denormalizing image: {str(e)}")
            return image
    
    def preprocess_batch(self, image_data_list: list, normalize: bool = True) -> np.ndarray:
        """
        Preprocess a batch of images
        
        Args:
            image_data_list: List of raw image bytes
            normalize: Whether to normalize pixel values
            
        Returns:
            Batch of preprocessed images
        """
        try:
            processed_images = []
            
            for image_data in image_data_list:
                processed_img = self.preprocess_image(image_data, normalize)
                processed_images.append(processed_img[0])  # Remove batch dimension
            
            # Stack into batch
            batch = np.stack(processed_images, axis=0)
            
            logger.debug(f"Processed batch shape: {batch.shape}")
            return batch
            
        except Exception as e:
            logger.error(f"Error preprocessing batch: {str(e)}")
            raise ValueError(f"Failed to preprocess image batch: {str(e)}")
    
    def augment_image(self, image: np.ndarray, augmentation_type: str = "light") -> np.ndarray:
        """
        Apply data augmentation to image
        
        Args:
            image: Input image array (0-255)
            augmentation_type: Type of augmentation ("light", "moderate", "heavy")
            
        Returns:
            Augmented image array
        """
        try:
            augmented = image.copy()
            
            if augmentation_type == "light":
                # Light augmentation: small rotations and brightness
                if np.random.random() > 0.5:
                    augmented = self._rotate_image(augmented, angle=np.random.uniform(-10, 10))
                if np.random.random() > 0.5:
                    augmented = self._adjust_brightness(augmented, factor=np.random.uniform(0.8, 1.2))
                    
            elif augmentation_type == "moderate":
                # Moderate augmentation: more variations
                if np.random.random() > 0.5:
                    augmented = self._rotate_image(augmented, angle=np.random.uniform(-20, 20))
                if np.random.random() > 0.5:
                    augmented = self._adjust_brightness(augmented, factor=np.random.uniform(0.7, 1.3))
                if np.random.random() > 0.5:
                    augmented = self._adjust_contrast(augmented, factor=np.random.uniform(0.8, 1.2))
                if np.random.random() > 0.5:
                    augmented = cv2.flip(augmented, 1)  # Horizontal flip
                    
            elif augmentation_type == "heavy":
                # Heavy augmentation: all transformations
                if np.random.random() > 0.3:
                    augmented = self._rotate_image(augmented, angle=np.random.uniform(-30, 30))
                if np.random.random() > 0.3:
                    augmented = self._adjust_brightness(augmented, factor=np.random.uniform(0.6, 1.4))
                if np.random.random() > 0.3:
                    augmented = self._adjust_contrast(augmented, factor=np.random.uniform(0.7, 1.3))
                if np.random.random() > 0.5:
                    augmented = cv2.flip(augmented, 1)  # Horizontal flip
                if np.random.random() > 0.3:
                    augmented = self._add_gaussian_noise(augmented)
            
            return augmented
            
        except Exception as e:
            logger.error(f"Error augmenting image: {str(e)}")
            return image  # Return original if augmentation fails
    
    def _rotate_image(self, image: np.ndarray, angle: float) -> np.ndarray:
        """Rotate image by given angle"""
        try:
            h, w = image.shape[:2]
            center = (w // 2, h // 2)
            
            # Get rotation matrix
            rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            
            # Apply rotation
            rotated = cv2.warpAffine(image, rotation_matrix, (w, h), flags=cv2.INTER_LINEAR)
            
            return rotated
        except:
            return image
    
    def _adjust_brightness(self, image: np.ndarray, factor: float) -> np.ndarray:
        """Adjust image brightness"""
        try:
            adjusted = cv2.convertScaleAbs(image, alpha=factor, beta=0)
            return adjusted
        except:
            return image
    
    def _adjust_contrast(self, image: np.ndarray, factor: float) -> np.ndarray:
        """Adjust image contrast"""
        try:
            adjusted = cv2.convertScaleAbs(image, alpha=factor, beta=0)
            return adjusted
        except:
            return image
    
    def _add_gaussian_noise(self, image: np.ndarray, mean: float = 0, std: float = 25) -> np.ndarray:
        """Add Gaussian noise to image"""
        try:
            noise = np.random.normal(mean, std, image.shape).astype(np.float32)
            noisy_image = image.astype(np.float32) + noise
            noisy_image = np.clip(noisy_image, 0, 255).astype(np.uint8)
            return noisy_image
        except:
            return image
    
    def extract_leaf_region(self, image: np.ndarray, method: str = "green_mask") -> np.ndarray:
        """
        Extract leaf region from image using various methods
        
        Args:
            image: Input image array
            method: Method to use ("green_mask", "edge_detection", "contour")
            
        Returns:
            Image with leaf region highlighted/extracted
        """
        try:
            if method == "green_mask":
                return self._extract_by_green_mask(image)
            elif method == "edge_detection":
                return self._extract_by_edges(image)
            elif method == "contour":
                return self._extract_by_contour(image)
            else:
                logger.warning(f"Unknown extraction method: {method}")
                return image
                
        except Exception as e:
            logger.error(f"Error extracting leaf region: {str(e)}")
            return image
    
    def _extract_by_green_mask(self, image: np.ndarray) -> np.ndarray:
        """Extract leaf using green color mask"""
        try:
            # Convert to HSV for better green detection
            hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            
            # Define range for green color
            lower_green = np.array([35, 50, 50])
            upper_green = np.array([85, 255, 255])
            
            # Create mask
            mask = cv2.inRange(hsv, lower_green, upper_green)
            
            # Apply morphological operations to clean up mask
            kernel = np.ones((3, 3), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            
            # Apply mask to original image
            result = cv2.bitwise_and(image, image, mask=mask)
            
            return result
        except:
            return image
    
    def _extract_by_edges(self, image: np.ndarray) -> np.ndarray:
        """Extract leaf using edge detection"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Edge detection
            edges = cv2.Canny(blurred, 50, 150)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                # Get the largest contour (assumed to be the leaf)
                largest_contour = max(contours, key=cv2.contourArea)
                
                # Create mask
                mask = np.zeros(gray.shape, np.uint8)
                cv2.drawContours(mask, [largest_contour], -1, 255, -1)
                
                # Apply mask
                result = cv2.bitwise_and(image, image, mask=mask)
                return result
            
            return image
        except:
            return image
    
    def _extract_by_contour(self, image: np.ndarray) -> np.ndarray:
        """Extract leaf using contour detection"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Apply threshold
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                # Filter contours by area
                min_area = image.shape[0] * image.shape[1] * 0.01  # At least 1% of image
                valid_contours = [c for c in contours if cv2.contourArea(c) > min_area]
                
                if valid_contours:
                    # Get the largest valid contour
                    largest_contour = max(valid_contours, key=cv2.contourArea)
                    
                    # Create mask
                    mask = np.zeros(gray.shape, np.uint8)
                    cv2.drawContours(mask, [largest_contour], -1, 255, -1)
                    
                    # Apply mask
                    result = cv2.bitwise_and(image, image, mask=mask)
                    return result
            
            return image
        except:
            return image
    
    def get_image_stats(self, image: np.ndarray) -> dict:
        """
        Get statistics about the image
        
        Args:
            image: Input image array
            
        Returns:
            Dict with image statistics
        """
        try:
            stats = {
                "shape": image.shape,
                "dtype": str(image.dtype),
                "min_value": float(np.min(image)),
                "max_value": float(np.max(image)),
                "mean_value": float(np.mean(image)),
                "std_value": float(np.std(image))
            }
            
            if len(image.shape) == 3:
                stats["channels"] = image.shape[2]
                stats["channel_means"] = [float(np.mean(image[:, :, i])) for i in range(image.shape[2])]
            
            return stats
            
        except Exception as e:
            logger.error(f"Error calculating image stats: {str(e)}")
            return {"error": str(e)}
    
    def set_normalization_method(self, method: str):
        """
        Set the normalization method
        
        Args:
            method: "standard", "imagenet", or "centered"
        """
        if method in ["standard", "imagenet", "centered"]:
            self.normalization_method = method
            logger.info(f"Set normalization method to: {method}")
        else:
            logger.warning(f"Unknown normalization method: {method}")
    
    def set_target_size(self, size: Tuple[int, int]):
        """
        Set the target size for image preprocessing
        
        Args:
            size: Target size as (height, width)
        """
        self.target_size = size
        logger.info(f"Set target size to: {size}")