from pathlib import Path
from predict import load_model_bundle, predict_image

# Model directory
model_dir = Path("data/model")
bundle = load_model_bundle(model_dir)

# Image path (your test image)
img_path = r"C:\Users\rdxay\OneDrive\Documents\Desktop\Projects AIML\backend\data\dataset\valid\Tomato___Leaf_Mold\0a9b3ff4-5343-4814-ac2c-fdb3613d4e4d___Crnl_L.Mold 6559.JPG"

# Run prediction
result = predict_image(img_path, bundle)

print("==== Prediction Result ====")
print("Best Label:", result["label"])
print("Probability:", result["prob"])
print("Top Predictions:", result["top_predictions"])
print("Model Flavor:", result["flavor"])
