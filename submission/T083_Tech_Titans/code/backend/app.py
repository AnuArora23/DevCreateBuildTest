from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
import numpy as np
import cv2
import mediapipe as mp
from rembg import remove
from PIL import Image
import io
import logging
import random # Needed for the suggestion logic

# --- Auth/Wishlist/DB Setup ---
# You need to ensure these files/modules exist
from routes.auth import router as auth_router
from routes.wishlist import router as wishlist_router
from database import engine, SessionLocal # ASSUMPTION: database.py provides these
from models import Base, ClosetItem # ASSUMPTION: models.py provides these and the NEW ClosetItem

# Create all tables on startup (existing code)
Base.metadata.create_all(bind=engine)

# --- App Setup (existing code) ---
app = FastAPI(title="Virtual Try-On & Closet API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers (existing code) ---
app.include_router(auth_router, prefix="/auth")
app.include_router(wishlist_router, prefix="/wishlist")

# --- Logging (existing code) ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- ML Models (existing code) ---
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, min_detection_confidence=0.5)
FACEMESH_OVAL_INDICES = np.array([ 
    10, 338, 297, 332, 284, 251, 389, 356, 454, 
    323, 361, 288, 397, 365, 379, 378, 400, 377, 
    152, 148, 176, 149, 150, 136, 172, 58, 132, 
    93, 234, 127, 162, 21, 54, 103, 67, 109 
]) 

# --- Dependency for Database Session ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Utility Functions (existing code) ---
def read_image_from_bytes(image_bytes: bytes) -> np.ndarray: 
    # ... (existing content) ...
    nparr = np.frombuffer(image_bytes, np.uint8) 
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR) 
    return img 

def get_face_landmarks(image: np.ndarray): 
    # ... (existing content) ...
    h, w, _ = image.shape 
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) 
    results = face_mesh.process(image_rgb) 
    if not results.multi_face_landmarks: 
        return None, None 
    face_landmarks = results.multi_face_landmarks[0] 
    points = np.array([(int(lm.x * w), int(lm.y * h)) for lm in face_landmarks.landmark]) 
    x_min, y_min = np.min(points, axis=0) 
    x_max, y_max = np.max(points, axis=0) 
    bbox = (x_min, y_min, x_max - x_min, y_max - y_min) 
    return bbox, points 

def apply_face_swap(src_img: np.ndarray, dest_img: np.ndarray) -> np.ndarray: 
    # ... (existing content) ...
    try: 
        src_bbox, src_all_points = get_face_landmarks(src_img) 
        dest_bbox, dest_all_points = get_face_landmarks(dest_img) 
        if src_all_points is None or dest_all_points is None: 
            logger.warning("Face not detected in source or destination image. Skipping face swap.") 
            return dest_img 
        src_points = src_all_points[FACEMESH_OVAL_INDICES] 
        dest_points = dest_all_points[FACEMESH_OVAL_INDICES] 
        dest_convex_hull = cv2.convexHull(dest_points) 
        mask = np.zeros(dest_img.shape[:2], dtype=np.uint8) 
        cv2.fillConvexPoly(mask, dest_convex_hull, 255) 
        h_matrix, _ = cv2.findHomography(src_points, dest_points, cv2.RANSAC, 5.0) 
        warped_src = cv2.warpPerspective(src_img, h_matrix, (dest_img.shape[1], dest_img.shape[0])) 
        x, y, w, h = dest_bbox 
        center = (x + w // 2, y + h // 2) 
        output = cv2.seamlessClone(warped_src, dest_img, mask, center, cv2.NORMAL_CLONE) 
        return output 
    except Exception as e: 
        logger.error(f"Face swap error: {e}") 
        return dest_img 

def overlay_garment(body_img: np.ndarray, dress_img_bytes: bytes) -> np.ndarray: 
    # ... (existing content) ...
    try: 
        dress_no_bg_bytes = remove(dress_img_bytes) 
        body_pil = Image.fromarray(cv2.cvtColor(body_img, cv2.COLOR_BGR2RGB)) 
        dress_pil = Image.open(io.BytesIO(dress_no_bg_bytes)).convert("RGBA") 
        body_rgb = cv2.cvtColor(body_img, cv2.COLOR_BGR2RGB) 
        results = pose.process(body_rgb) 
        if not results.pose_landmarks: 
            logger.warning("Pose not detected. Cannot place garment.") 
            return body_img 
        landmarks = results.pose_landmarks.landmark 
        h, w, _ = body_img.shape 
        left_shoulder = (int(landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x * w), int(landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y * h)) 
        right_shoulder = (int(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].x * w), int(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].y * h)) 
        left_hip = (int(landmarks[mp_pose.PoseLandmark.LEFT_HIP].x * w), int(landmarks[mp_pose.PoseLandmark.LEFT_HIP].y * h)) 
        mid_shoulder_x = (left_shoulder[0] + right_shoulder[0]) // 2 
        shoulder_width = abs(right_shoulder[0] - left_shoulder[0]) 
        TARGET_WIDTH_MULTIPLIER = 2.8 
        target_width = int(shoulder_width * TARGET_WIDTH_MULTIPLIER) 
        original_dress_width, original_dress_height = dress_pil.size 
        aspect_ratio = original_dress_height / original_dress_width 
        target_height = int(target_width * aspect_ratio) 
        resized_dress = dress_pil.resize((target_width, target_height), Image.Resampling.LANCZOS) 
        paste_x = mid_shoulder_x - (target_width // 2) 
        avg_shoulder_y = (left_shoulder[1] + right_shoulder[1]) // 2 
        Y_OFFSET_FACTOR = 0.25 
        shoulder_to_hip_distance = left_hip[1] - avg_shoulder_y 
        paste_y = avg_shoulder_y - int(shoulder_to_hip_distance * Y_OFFSET_FACTOR) 
        if paste_y < 0: 
            paste_y = 0 
        body_pil.paste(resized_dress, (paste_x, paste_y), resized_dress) 
        final_img = cv2.cvtColor(np.array(body_pil), cv2.COLOR_RGB2BGR) 
        return final_img 
    except Exception as e: 
        logger.error(f"Garment overlay error: {e}") 
        return body_img 


# --- Virtual Try-On Endpoint (existing code) --- 
@app.post("/virtual-tryon", tags=["Virtual Try-On"]) 
async def virtual_tryon(face_image: UploadFile = File(...), body_image: UploadFile = File(...), dress_image: UploadFile = File(...)): 
    # ... (existing content) ...
    logger.info("Received request for virtual try-on.") 
    try: 
        face_bytes = await face_image.read() 
        body_bytes = await body_image.read() 
        dress_bytes = await dress_image.read() 
        face_cv = read_image_from_bytes(face_bytes) 
        body_cv = read_image_from_bytes(body_bytes) 
        if face_cv is None or body_cv is None: 
            raise HTTPException(status_code=400, detail="Could not decode one or more images.") 
        logger.info("Performing face swap...") 
        body_with_new_face = apply_face_swap(face_cv, body_cv) 
        logger.info("Overlaying garment...") 
        final_result = overlay_garment(body_with_new_face, dress_bytes) 
        logger.info("Encoding and returning result.") 
        _, img_encoded = cv2.imencode(".png", final_result) 
        return StreamingResponse(io.BytesIO(img_encoded.tobytes()), media_type="image/png") 
    except Exception as e: 
        logger.error(f"Error in virtual try-on: {e}") 
        raise HTTPException(status_code=500, detail="Try-on generation failed.")


# **********************************************
# --- NEW: AI SUGGESTOR ENDPOINTS AND LOGIC ---
# **********************************************

# --- AI Simulation Functions (Adapted from Flask example) ---

def simulate_ai_analysis(filename: str):
    """
    Simulates AI/CV processing to determine clothing category and color.
    In a real app, this would use your CV models (like those imported above)
    to process the actual image data.
    """
    filename_lower = filename.lower()
    
    # Simple Category Heuristics
    if 'shirt' in filename_lower or 'tee' in filename_lower or 'top' in filename_lower:
        category = 'Shirt'
    elif 'trousers' in filename_lower or 'pants' in filename_lower or 'jeans' in filename_lower or 'bottom' in filename_lower:
        category = 'Trousers'
    elif 'jacket' in filename_lower or 'coat' in filename_lower:
        category = 'Jacket'
    else:
        category = 'Other'

    # Simple Color Heuristics
    if 'blue' in filename_lower or 'denim' in filename_lower:
        color = 'Blue'
    elif 'red' in filename_lower or 'maroon' in filename_lower:
        color = 'Red'
    elif 'white' in filename_lower or 'cream' in filename_lower:
        color = 'White'
    elif 'black' in filename_lower or 'grey' in filename_lower:
        color = 'Black'
    elif 'yellow' in filename_lower or 'gold' in filename_lower:
        color = 'Yellow'
    elif 'green' in filename_lower:
        color = 'Green'
    else:
        color = 'Neutral' 

    return category, color

def get_color_compatibility_score(color1: str, color2: str) -> int:
    """Simplified color matching logic."""
    neutrals = ['Black', 'White', 'Neutral', 'Grey', 'Denim']
    
    if color1 in neutrals or color2 in neutrals:
        return 3 # Neutral matches well
    if color1 == color2:
        return 2 # Monochromatic
    # Blue + Yellow is complementary
    if (color1 == 'Blue' and color2 == 'Yellow') or (color1 == 'Yellow' and color2 == 'Blue'):
        return 2
    
    return 1 # Other vibrant combinations

# --- Item Upload/Save Endpoint ---

# NOTE: This endpoint is crucial. The frontend needs to call this to save items 
# *before* calling /suggest. The existing frontend code may need modification 
# to upload the images to this new endpoint.

@app.post("/closet/upload", tags=["Closet Management"])
async def upload_closet_item(
    user_id: int, # Assuming user authentication gives you a user_id
    image: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """
    Simulates the full process: AI analyzes the uploaded image, 
    and the metadata is stored in the database.
    """
    try:
        # 1. Read file and Simulate AI Analysis
        filename = image.filename
        # In a real app, you'd save the image to disk/cloud storage here
        # image_bytes = await image.read()
        category, color = simulate_ai_analysis(filename)
        
        # 2. Save metadata to the database
        db_item = ClosetItem(
            user_id=user_id,
            file_name=filename,
            category=category,
            color=color,
            # Placeholder for actual image storage path
            image_url=f"/static/closet/{user_id}/{filename}"
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)

        return {"message": "Item successfully analyzed and added to closet.", 
                "item_id": db_item.id,
                "category": category,
                "color": color}
    except Exception as e:
        logger.error(f"Error saving closet item: {e}")
        raise HTTPException(status_code=500, detail="Could not process and save closet item.")


# --- Suggestion Endpoint ---

@app.post("/suggest", tags=["AI Suggestor"])
async def suggest_outfit(user_id: int, db: Session = Depends(get_db)):
    """
    Recommends the best shirt/trousers combo from the user's stored closet items.
    """
    logger.info(f"Generating suggestion for user: {user_id}")
    
    # 1. Fetch relevant items from the database
    user_items = db.query(ClosetItem).filter(ClosetItem.user_id == user_id).all()
    
    shirts = [item for item in user_items if item.category == 'Shirt']
    trousers = [item for item in user_items if item.category == 'Trousers']
    
    if not shirts or not trousers:
        return JSONResponse(
            content={'suggestion': 'Please upload at least one Shirt and one Trousers to your virtual closet.'},
            status_code=200
        )

    # 2. Find the best match
    best_match = {
        'shirt': None,
        'trousers': None,
        'score': -1
    }

    for shirt in shirts:
        for trousers_item in trousers:
            score = get_color_compatibility_score(shirt.color, trousers_item.color)
            
            if score > best_match['score']:
                best_match['score'] = score
                best_match['shirt'] = shirt
                best_match['trousers'] = trousers_item

    # 3. Format the suggestion
    if best_match['score'] >= 1:
        shirt_name = best_match['shirt'].file_name.split('.')[0]
        trousers_name = best_match['trousers'].file_name.split('.')[0]
        
        confidence = ""
        if best_match['score'] == 3:
            confidence = " (A perfect classic match!)"
        elif best_match['score'] == 2:
            confidence = " (A great combination!)"
        elif best_match['score'] == 1:
            confidence = " (This combination works well.)"
            
        suggestion_text = (
            f"**{shirt_name}** (Color: {best_match['shirt'].color}) "
            f"and **{trousers_name}** (Color: {best_match['trousers'].color}).{confidence}"
        )
    else:
        suggestion_text = "Found items, but could not determine a color-matched combination."


    return {"suggestion": suggestion_text,
            "shirt_id": best_match['shirt'].id,
            "trousers_id": best_match['trousers'].id}

# **********************************************
# --- END NEW SUGGESTOR CODE ---
# **********************************************