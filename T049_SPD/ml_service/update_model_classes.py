#!/usr/bin/env python3
"""
Script to inspect model outputs and update class configurations
"""

import tensorflow as tf
import numpy as np
import json
from pathlib import Path

def load_and_inspect_model(model_path):
    """Load a model and inspect its output shape to determine number of classes"""
    try:
        print(f"\n🔍 Inspecting model: {model_path}")
        model = tf.keras.models.load_model(model_path)
        
        # Get model summary info
        print(f"   Input shape: {model.input.shape}")
        print(f"   Output shape: {model.output.shape}")
        
        # Get number of classes from output shape
        num_classes = model.output.shape[-1]
        print(f"   Number of classes: {num_classes}")
        
        # Test with dummy input
        dummy_input = np.random.rand(1, 224, 224, 3).astype(np.float32)
        output = model.predict(dummy_input, verbose=0)
        print(f"   Sample prediction shape: {output.shape}")
        print(f"   Sample prediction sum: {output.sum():.3f} (should be ~1.0 for softmax)")
        
        return num_classes, model
        
    except Exception as e:
        print(f"   ❌ Error loading model: {e}")
        return None, None

def update_model_configs():
    """Update model configurations with class information"""
    models_dir = Path("models/disease_models")
    
    # Current class configurations
    class_configs = {
        "corn": [
            "Corn__Blight",
            "Corn__Common_Rust", 
            "Corn__Gray_Leaf_Spot",
            "Corn__Healthy"
        ],
        "tomato": [],  # You need to provide these
        "grape": [],   # You need to provide these  
        "mango": [],   # You need to provide these
        "peanut": []   # You need to provide these
    }
    
    print("🌿 Plant Disease Detection - Model Class Inspector")
    print("=" * 60)
    
    # Inspect each model
    for model_file in models_dir.glob("*.keras"):
        crop_name = model_file.stem.replace("_disease_model", "")
        
        num_classes, model = load_and_inspect_model(model_file)
        
        if num_classes:
            current_classes = class_configs.get(crop_name, [])
            
            if current_classes:
                if len(current_classes) == num_classes:
                    print(f"   ✅ Class count matches configured classes")
                    print(f"   Classes: {current_classes}")
                else:
                    print(f"   ⚠️  Class count mismatch!")
                    print(f"   Expected: {len(current_classes)}, Got: {num_classes}")
            else:
                print(f"   ⚠️  No classes configured for {crop_name}")
                print(f"   Please add {num_classes} class names for this crop")
                
                # Generate placeholder class names
                placeholder_classes = [f"{crop_name.title()}__Class_{i}" for i in range(num_classes)]
                print(f"   Placeholder classes: {placeholder_classes}")
    
    # Show how to update configurations
    print("\n📝 To update class names for your models:")
    print("1. For each crop, find out the exact class names from your training")
    print("2. Update the class_configs dictionary in this script")
    print("3. Or manually update services/model_manager.py")
    
    print("\n🎯 Current Configuration Status:")
    for crop, classes in class_configs.items():
        status = "✅ Configured" if classes else "❌ Needs classes"
        print(f"   {crop}: {status} ({len(classes)} classes)")

def main():
    update_model_configs()

if __name__ == "__main__":
    main()