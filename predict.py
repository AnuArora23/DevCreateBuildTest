# backend/predict.py
import os
import numpy as np
from pathlib import Path
from PIL import Image
import difflib
import cv2

_TF_OK = True
try:
    import tensorflow as tf
    from tensorflow.keras.applications import efficientnet
except Exception:
    _TF_OK = False
    tf = None
    efficientnet = None

_ONNX_OK = True
try:
    import onnxruntime as ort
except Exception:
    _ONNX_OK = False
    ort = None


def _load_classes(model_dir: Path):
    classes_txt = model_dir / "classes.txt"
    if classes_txt.exists():
        return [
            c.strip()
            for c in classes_txt.read_text(encoding="utf-8").splitlines()
            if c.strip()
        ]
    return []


def load_model_bundle(model_dir: Path):
    model_dir = Path(model_dir)
    classes = _load_classes(model_dir)

    tflite = model_dir / "plant_model.tflite"
    onnx = model_dir / "plant_model.onnx"
    keras = model_dir / "plant_model.keras"

    bundle = {
        "loaded": False,
        "flavor": None,
        "img_size": 224,
        "classes": classes,
        "tflite": None,
        "onnx": None,
        "keras": None,
    }

    if tflite.exists():
        try:
            interpreter = (
                tf.lite.Interpreter(model_path=str(tflite)) if _TF_OK else None
            )
            if interpreter is not None:
                interpreter.allocate_tensors()
                bundle["loaded"] = True
                bundle["flavor"] = "tflite"
                bundle["tflite"] = interpreter
                return bundle
        except Exception:
            pass

    if onnx.exists() and _ONNX_OK:
        try:
            sess = ort.InferenceSession(str(onnx), providers=["CPUExecutionProvider"])
            bundle["loaded"] = True
            bundle["flavor"] = "onnx"
            bundle["onnx"] = sess
            return bundle
        except Exception:
            pass

    if keras.exists() and _TF_OK:
        try:
            model = tf.keras.models.load_model(str(keras))
            bundle["loaded"] = True
            bundle["flavor"] = "keras"
            bundle["keras"] = model
            return bundle
        except Exception:
            pass

    return bundle


def _preprocess(image_path: str, img_size: int = 224):
    """Ensure preprocessing matches EfficientNet training"""
    img = Image.open(image_path).convert("RGB").resize((img_size, img_size))
    arr = np.asarray(img).astype("float32")

    if _TF_OK and efficientnet is not None:
        arr = efficientnet.preprocess_input(arr)  # ✅ [-1, 1]
    else:
        arr = arr / 255.0  # fallback ✅

    arr = np.expand_dims(arr, axis=0)
    return arr


def _softmax(x):
    x = x - np.max(x, axis=-1, keepdims=True)
    e = np.exp(x)
    return e / np.sum(e, axis=-1, keepdims=True)


def _normalize_label(label: str) -> str:
    return label.strip().replace("\n", "").replace("\r", "")


def match_treatment_label(label: str, treatments: dict) -> str:
    norm_label = _normalize_label(label).lower()
    norm_treatments = {k.lower().strip(): k for k in treatments.keys()}

    if norm_label in norm_treatments:
        return norm_treatments[norm_label]

    guess = difflib.get_close_matches(
        norm_label, list(norm_treatments.keys()), n=1, cutoff=0.6
    )
    if guess:
        return norm_treatments[guess[0]]

    if "default" in treatments:
        return "default"

    return label


# 👇 Heuristic fallback
def _heuristic_guess(image_path: str):
    img = np.array(Image.open(image_path).convert("RGB").resize((256, 256)))
    mean = img.mean(axis=(0, 1))
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 60, 150)
    edge_density = edges.mean() / 255.0

    labels = [
        "Apple___Apple_scab",
        "Apple___healthy",
        "Potato___Early_blight",
        "Potato___healthy",
        "Tomato___Leaf_Mold",
        "Tomato___healthy",
    ]

    scores = np.zeros(len(labels), dtype=float)
    g, r, b = mean[1], mean[0], mean[2]
    greenish = g > r and g > b
    low_sat = np.std(img, axis=(0, 1)).mean() < 45

    scores[0] = 0.8 if not greenish else 0.4
    scores[1] = 0.6 if greenish else 0.2
    scores[2] = 0.5 if edge_density > 0.3 else 0.1
    scores[3] = 0.4 if greenish else 0.2
    scores[4] = 0.6 if low_sat else 0.3
    scores[5] = 0.5 if greenish else 0.2

    ex = np.exp(scores - scores.max())
    probs = ex / ex.sum()
    topk = probs.argsort()[::-1][:3]

    return {
        "label": labels[topk[0]],
        "prob": float(probs[topk[0]]),
        "top_predictions": [
            {"label": labels[i], "prob": float(probs[i])} for i in topk
        ],
        "flavor": "heuristic",
    }


def predict_image(image_path: str, bundle: dict, topk: int = 3, threshold: float = 0.6):
    if not bundle or not bundle.get("loaded"):
        return _heuristic_guess(image_path)

    img_size = bundle.get("img_size", 224)
    x = _preprocess(image_path, img_size=img_size)

    probs = None
    flavor = bundle["flavor"]

    try:
        if flavor == "tflite":
            interp = bundle["tflite"]
            input_details = interp.get_input_details()
            output_details = interp.get_output_details()
            x_in = x
            if input_details[0]["dtype"] == np.uint8:
                x_in = (x_in * 255).astype(np.uint8)
            interp.set_tensor(input_details[0]["index"], x_in)
            interp.invoke()
            out = interp.get_tensor(output_details[0]["index"])[0]
            probs = out

        elif flavor == "onnx":
            sess = bundle["onnx"]
            i0 = sess.get_inputs()[0].name
            x_in = x.transpose(0, 3, 1, 2)
            out = sess.run(None, {i0: x_in.astype(np.float32)})
            probs = out[0][0]
            if probs.ndim == 1 and (probs.max() > 1 or probs.min() < 0):
                probs = _softmax(probs[None, ...])[0]

        elif flavor == "keras":
            model = bundle["keras"]
            out = model.predict(x, verbose=0)
            probs = out[0]

    except Exception:
        return _heuristic_guess(image_path)

    probs = np.asarray(probs, dtype="float32")
    if (
        np.any(probs < 0)
        or np.any(probs > 1.0)
        or not np.isclose(probs.sum(), 1.0, atol=1e-2)
    ):
        probs = _softmax(probs[None, ...])[0]

    classes = bundle.get("classes", [])
    idxs = np.argsort(-probs)[:topk]
    top = []
    for i in idxs:
        label = _normalize_label(classes[i] if i < len(classes) else f"class_{i}")
        top.append({"label": label, "prob": float(probs[i])})

    best_idx = int(idxs[0])
    best_label = _normalize_label(
        classes[best_idx] if best_idx < len(classes) else f"class_{best_idx}"
    )
    best_prob = float(probs[best_idx])

    if best_prob < threshold:
        return {
            "label": "Uncertain 🤔",
            "prob": best_prob,
            "top_predictions": top,
            "flavor": flavor,
        }

    return {
        "label": best_label,
        "prob": best_prob,
        "top_predictions": top,
        "flavor": flavor,
    }
