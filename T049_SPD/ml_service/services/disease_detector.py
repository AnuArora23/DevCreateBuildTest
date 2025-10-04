import logging
import numpy as np
from typing import Dict, Any, Optional
from services.model_manager import ModelManager

logger = logging.getLogger(__name__)

class DiseaseDetector:
    """
    Main disease detection service that coordinates crop detection and disease classification
    """
    
    def __init__(self, model_manager: ModelManager):
        """
        Initialize DiseaseDetector
        
        Args:
            model_manager: ModelManager instance for handling crop-specific models
        """
        self.model_manager = model_manager
        
        # Disease severity mapping (you can customize this based on your needs)
        self.severity_mapping = {
            "healthy": "none",
            "rust": "moderate",
            "blight": "severe",
            "spot": "mild",
            "leaf_curl": "moderate",
            "mosaic": "moderate",
            "mold": "moderate"
        }
    
    def detect_disease(self, preprocessed_image: np.ndarray, crop_type: str) -> Dict[str, Any]:
        """
        Detect disease in the given crop image
        
        Args:
            preprocessed_image: Preprocessed image array
            crop_type: Type of crop (corn, tomato, etc.)
            
        Returns:
            Dict containing disease detection results
        """
        crop_type = crop_type.lower()
        
        try:
            # Check if we have a model for this crop type
            if crop_type not in self.model_manager.get_available_models():
                raise ValueError(f"No model available for crop type: {crop_type}")
            
            # Make prediction using the appropriate model
            prediction_result = self.model_manager.predict(crop_type, preprocessed_image)
            
            if prediction_result is None:
                raise RuntimeError(f"Prediction failed for crop type: {crop_type}")
            
            # Extract results
            predicted_class = prediction_result["predicted_class"]
            confidence = prediction_result["confidence"]
            all_predictions = prediction_result["all_predictions"]
            
            # Process disease information
            disease_info = self._process_disease_class(predicted_class)
            
            # Determine severity
            severity = self._determine_severity(predicted_class, confidence)
            
            # Prepare response
            result = {
                "disease_class": predicted_class,
                "disease_name": disease_info["name"],
                "disease_type": disease_info["type"],
                "confidence": confidence,
                "severity": severity,
                "all_predictions": all_predictions,
                "model_used": f"{crop_type}_disease_model",
                "recommendations": self._get_recommendations(predicted_class, severity),
                "is_healthy": disease_info["is_healthy"]
            }
            
            logger.info(f"Disease detection completed for {crop_type}: {predicted_class} ({confidence:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"Error in disease detection: {str(e)}")
            raise RuntimeError(f"Disease detection failed: {str(e)}")
    
    def _process_disease_class(self, disease_class: str) -> Dict[str, Any]:
        """
        Process raw disease class name into structured information
        
        Args:
            disease_class: Raw disease class name from model
            
        Returns:
            Dict with processed disease information
        """
        disease_class_lower = disease_class.lower()
        
        # Check if it's healthy
        is_healthy = "healthy" in disease_class_lower
        
        # Extract disease type and name
        if is_healthy:
            disease_type = "healthy"
            disease_name = "Healthy Plant"
        else:
            # Parse disease name (assuming format like "Crop_Disease_Name")
            parts = disease_class.replace("_", " ").split()
            
            if len(parts) > 1:
                # Remove crop name if present
                crop_names = ["corn", "tomato", "potato", "rice", "wheat"]
                filtered_parts = [part for part in parts if part.lower() not in crop_names]
                
                if filtered_parts:
                    disease_name = " ".join(filtered_parts).title()
                    disease_type = filtered_parts[-1].lower()  # Last word often indicates type
                else:
                    disease_name = disease_class.replace("_", " ").title()
                    disease_type = "unknown"
            else:
                disease_name = disease_class.title()
                disease_type = "unknown"
        
        return {
            "name": disease_name,
            "type": disease_type,
            "is_healthy": is_healthy,
            "raw_class": disease_class
        }
    
    def _determine_severity(self, disease_class: str, confidence: float) -> str:
        """
        Determine disease severity based on class name and confidence
        
        Args:
            disease_class: Disease class name
            confidence: Model confidence
            
        Returns:
            Severity level as string
        """
        disease_class_lower = disease_class.lower()
        
        # If healthy, no severity
        if "healthy" in disease_class_lower:
            return "none"
        
        # Base severity from disease type
        base_severity = "mild"  # default
        
        for disease_type, severity in self.severity_mapping.items():
            if disease_type in disease_class_lower:
                base_severity = severity
                break
        
        # Adjust based on confidence
        if confidence < 0.6:
            # Lower confidence might mean early stage or mild case
            if base_severity == "severe":
                return "moderate"
            elif base_severity == "moderate":
                return "mild"
        elif confidence > 0.9:
            # Very high confidence might indicate advanced stage
            if base_severity == "mild":
                return "moderate"
            elif base_severity == "moderate":
                return "severe"
        
        return base_severity
    
    def _get_recommendations(self, disease_class: str, severity: str) -> Dict[str, Any]:
        """
        Get treatment recommendations based on disease and severity
        
        Args:
            disease_class: Disease class name
            severity: Disease severity level
            
        Returns:
            Dict with recommendations
        """
        disease_class_lower = disease_class.lower()
        
        if "healthy" in disease_class_lower:
            return {
                "treatment": "No treatment needed",
                "prevention": [
                    "Continue regular monitoring",
                    "Maintain good plant hygiene",
                    "Ensure proper spacing and ventilation"
                ],
                "urgency": "none"
            }
        
        # Default recommendations based on severity
        if severity == "mild":
            urgency = "low"
            treatment_actions = [
                "Monitor closely for progression",
                "Remove affected leaves if few in number",
                "Improve air circulation around plants"
            ]
        elif severity == "moderate":
            urgency = "medium"
            treatment_actions = [
                "Apply appropriate fungicide or treatment",
                "Remove and destroy affected plant parts",
                "Increase monitoring frequency"
            ]
        else:  # severe
            urgency = "high"
            treatment_actions = [
                "Immediate treatment required",
                "Consider removing severely affected plants",
                "Apply systemic treatment",
                "Consult agricultural expert"
            ]
        
        # Add disease-specific recommendations
        specific_treatments = self._get_specific_treatment(disease_class_lower)
        
        return {
            "treatment": specific_treatments.get("treatment", "General disease management"),
            "actions": treatment_actions,
            "prevention": specific_treatments.get("prevention", [
                "Practice crop rotation",
                "Maintain field hygiene",
                "Use resistant varieties when available"
            ]),
            "urgency": urgency,
            "follow_up": "Monitor for 7-14 days after treatment"
        }
    
    def _get_specific_treatment(self, disease_class: str) -> Dict[str, Any]:
        """
        Get specific treatment recommendations for known diseases
        
        Args:
            disease_class: Disease class name (lowercase)
            
        Returns:
            Dict with specific treatment info
        """
        treatments = {
            "rust": {
                "treatment": "Apply fungicide containing propiconazole or tebuconazole",
                "prevention": [
                    "Plant rust-resistant varieties",
                    "Avoid overhead irrigation",
                    "Remove volunteer plants"
                ]
            },
            "blight": {
                "treatment": "Apply copper-based fungicide or chlorothalonil",
                "prevention": [
                    "Ensure good drainage",
                    "Avoid working with wet plants",
                    "Practice 3-4 year crop rotation"
                ]
            },
            "spot": {
                "treatment": "Apply fungicide and improve air circulation",
                "prevention": [
                    "Space plants properly",
                    "Water at soil level",
                    "Remove plant debris"
                ]
            },
            "mold": {
                "treatment": "Apply fungicide and reduce humidity",
                "prevention": [
                    "Improve ventilation",
                    "Avoid overcrowding",
                    "Control greenhouse humidity"
                ]
            }
        }
        
        for key, treatment_info in treatments.items():
            if key in disease_class:
                return treatment_info
        
        return {
            "treatment": "Consult local agricultural extension service",
            "prevention": ["Follow integrated pest management practices"]
        }
    
    def batch_detect_diseases(self, images_and_crops: list) -> list:
        """
        Process multiple images for disease detection
        
        Args:
            images_and_crops: List of tuples (preprocessed_image, crop_type)
            
        Returns:
            List of detection results
        """
        results = []
        
        for i, (image, crop_type) in enumerate(images_and_crops):
            try:
                result = self.detect_disease(image, crop_type)
                result["batch_index"] = i
                results.append(result)
            except Exception as e:
                logger.error(f"Error processing batch item {i}: {str(e)}")
                results.append({
                    "batch_index": i,
                    "error": str(e),
                    "status": "failed"
                })
        
        return results
    
    def get_supported_crops(self) -> list:
        """Get list of crops that can be processed"""
        return self.model_manager.get_available_models()
    
    def get_disease_statistics(self, results: list) -> Dict[str, Any]:
        """
        Calculate statistics from multiple detection results
        
        Args:
            results: List of detection results
            
        Returns:
            Dict with statistics
        """
        if not results:
            return {}
        
        successful_results = [r for r in results if "error" not in r]
        
        if not successful_results:
            return {"total_processed": len(results), "successful": 0, "failed": len(results)}
        
        # Calculate statistics
        healthy_count = sum(1 for r in successful_results if r.get("is_healthy", False))
        disease_counts = {}
        severity_counts = {"mild": 0, "moderate": 0, "severe": 0, "none": 0}
        
        for result in successful_results:
            disease = result.get("disease_name", "Unknown")
            severity = result.get("severity", "unknown")
            
            disease_counts[disease] = disease_counts.get(disease, 0) + 1
            if severity in severity_counts:
                severity_counts[severity] += 1
        
        return {
            "total_processed": len(results),
            "successful": len(successful_results),
            "failed": len(results) - len(successful_results),
            "healthy_plants": healthy_count,
            "diseased_plants": len(successful_results) - healthy_count,
            "disease_distribution": disease_counts,
            "severity_distribution": severity_counts,
            "health_percentage": (healthy_count / len(successful_results)) * 100 if successful_results else 0
        }