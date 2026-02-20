import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    DB_NAME = os.getenv('DB_NAME', 'smart_dam_db')
    
    # Model paths
    MODEL_PATH = os.getenv('MODEL_PATH', 'models/rainfall_model.pkl')
    
    # YOLOv8 Model
    YOLO_MODEL = os.getenv('YOLO_MODEL', 'yolov8n.pt')  # nano model for speed
    
    # Human detection settings
    DETECTION_CONFIDENCE = float(os.getenv('DETECTION_CONFIDENCE', 0.5))
    DETECTION_INTERVAL = int(os.getenv('DETECTION_INTERVAL', 3))  # seconds
    _render_env = os.getenv('RENDER') or os.getenv('RENDER_SERVICE_ID')
    _enable_detection_raw = os.getenv('ENABLE_HUMAN_DETECTION')
    if _enable_detection_raw is None:
        ENABLE_HUMAN_DETECTION = False if _render_env else True
    else:
        ENABLE_HUMAN_DETECTION = _enable_detection_raw.strip().lower() in ('1', 'true', 'yes', 'on')

    # CORS (comma-separated origins or "*")
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    
    # API Keys (if needed in future)
    # FIREBASE_API_KEY = os.getenv('FIREBASE_API_KEY', '')
    
    # Location
    DAM_LATITUDE = float(os.getenv('DAM_LATITUDE', 12.96312116701951))
    DAM_LONGITUDE = float(os.getenv('DAM_LONGITUDE', 79.94246446052891))

    # Weather cache (seconds)
    WEATHER_CACHE_TTL = int(os.getenv('WEATHER_CACHE_TTL', 300))
