import os
from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import confusion_matrix, classification_report
import matplotlib.pyplot as plt
import seaborn as sns

# ==== Paths ====
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data" / "dataset"
TRAIN_DIR = DATA_DIR / "train"
VAL_DIR = DATA_DIR / "valid"

MODEL_DIR = BASE_DIR / "data" / "model"
MODEL_DIR.mkdir(exist_ok=True, parents=True)
MODEL_PATH = MODEL_DIR / "plant_model.keras"

IMG_SIZE = 224  # MobileNetV2 recommended size
BATCH = 32
EPOCHS = 8
AUTOTUNE = tf.data.AUTOTUNE

print("[INFO] Loading dataset ...")
train_ds = tf.keras.preprocessing.image_dataset_from_directory(
    TRAIN_DIR, image_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH, shuffle=True
)
val_ds = tf.keras.preprocessing.image_dataset_from_directory(
    VAL_DIR, image_size=(IMG_SIZE, IMG_SIZE), batch_size=BATCH, shuffle=False
)

class_names = train_ds.class_names
NUM_CLASSES = len(class_names)
print(f"[INFO] Classes ({NUM_CLASSES}):", class_names)

# ==== Class Weights ====
y_train = np.concatenate([y for _, y in train_ds], axis=0)
class_weights = compute_class_weight("balanced", classes=np.unique(y_train), y=y_train)
class_weights = dict(enumerate(class_weights))
print("[INFO] Class Weights:", class_weights)

# Optimize pipeline
train_ds = train_ds.cache().shuffle(1024).prefetch(AUTOTUNE)
val_ds = val_ds.cache().prefetch(AUTOTUNE)

# ==== Model ====
print("[INFO] Building model ...")
data_augmentation = tf.keras.Sequential(
    [
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
    ],
    name="augmentation",
)

base = tf.keras.applications.MobileNetV2(
    include_top=False, weights="imagenet", input_shape=(IMG_SIZE, IMG_SIZE, 3)
)
base.trainable = False  # Freeze base initially

inp = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x = data_augmentation(inp)
x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
x = base(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.3)(x)
out = layers.Dense(NUM_CLASSES, activation="softmax")(x)
model = models.Model(inp, out)

model.compile(
    optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"]
)

callbacks = [
    EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True),
    ModelCheckpoint(MODEL_PATH, monitor="val_accuracy", save_best_only=True),
]

# ==== Training (Stage 1: Freeze Base) ====
model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=callbacks,
    class_weight=class_weights,
)

# ==== Fine-tuning (Stage 2: Unfreeze some layers) ====
print("[INFO] Fine-tuning ...")
base.trainable = True
for layer in base.layers[:-30]:  # train last 30 layers
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=5,
    callbacks=callbacks,
    class_weight=class_weights,
)

# ==== Save Model ====
print("[INFO] Saving model:", MODEL_PATH)
model.save(MODEL_PATH)

# Save class names
with open(MODEL_DIR / "classes.txt", "w", encoding="utf-8") as f:
    for c in class_names:
        f.write(c + "\n")

# ==== Evaluation ====
print("[INFO] Evaluating model ...")
y_true = np.concatenate([y for _, y in val_ds], axis=0)
y_pred_probs = model.predict(val_ds)
y_pred = np.argmax(y_pred_probs, axis=1)

cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=class_names,
    yticklabels=class_names,
)
plt.xlabel("Predicted")
plt.ylabel("True")
plt.title("Confusion Matrix")
plt.show()

report = classification_report(y_true, y_pred, target_names=class_names, digits=3)
print(report)

print("✅ Final stable model ready for hackathon.")
