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
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    
    # API Keys (if needed in future)
    # FIREBASE_API_KEY = os.getenv('FIREBASE_API_KEY', '')
    
    # Location
    DAM_LATITUDE = float(os.getenv('DAM_LATITUDE', 12.96312116701951))
    DAM_LONGITUDE = float(os.getenv('DAM_LONGITUDE', 79.94246446052891))