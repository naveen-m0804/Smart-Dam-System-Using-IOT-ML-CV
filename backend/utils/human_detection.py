import cv2
import numpy as np
import os
import sys
import threading
import time
from datetime import datetime
import torch

# Add this line to allow YOLO models to load in PyTorch 2.6+
torch.serialization.add_safe_globals(['ultralytics.nn.tasks.DetectionModel', 'ultralytics.nn.modules.block.C2f'])

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from config import Config
except ImportError:
    Config = None

from ultralytics import YOLO

class HumanDetector:
    def __init__(self):
        self.model = None
        self.running = False
        self.detection_thread = None
        self.last_detection_time = None
        self.last_detected = False
        self.last_confidence = 0.0
        
        try:
            model_name = Config.YOLO_MODEL if Config else 'yolov8n.pt'
            self.model = YOLO(model_name)
            print(f"✓ YOLOv8 model loaded: {model_name}")
        except Exception as e:
            print(f"⚠️ Error loading YOLO model: {e}")
            self.model = None
    
    def detect_from_webcam(self, timeout=2):
        if not self.model:
            return False, 0.0
        
        try:
            cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                return False, 0.0
            
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                return False, 0.0
            
            results = self.model(frame, verbose=False)
            max_confidence = 0.0
            human_detected = False
            
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    min_confidence = Config.DETECTION_CONFIDENCE if Config else 0.5
                    if class_id == 0 and confidence >= min_confidence:
                        human_detected = True
                        max_confidence = max(max_confidence, confidence)
            
            return human_detected, max_confidence
        except Exception as e:
            return False, 0.0
    
    def _continuous_detection_loop(self, db_collection=None, interval=3):
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("⚠️ Cannot open webcam")
            return
        
        if not self.model:
            print("⚠️ Model not loaded")
            return
        
        print(f"🎥 Continuous detection active (interval: {interval}s)")
        
        try:
            while self.running:
                ret, frame = cap.read()
                if not ret:
                    time.sleep(interval)
                    continue
                
                results = self.model(frame, verbose=False)
                max_confidence = 0.0
                human_detected = False
                
                for result in results:
                    boxes = result.boxes
                    for box in boxes:
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        min_confidence = Config.DETECTION_CONFIDENCE if Config else 0.5
                        if class_id == 0 and confidence >= min_confidence:
                            human_detected = True
                            max_confidence = max(max_confidence, confidence)
                
                self.last_detected = human_detected
                self.last_confidence = max_confidence
                self.last_detection_time = datetime.utcnow()
                
                timestamp = self.last_detection_time.strftime("%H:%M:%S")
                if human_detected:
                    print(f"[{timestamp}] 🚨 HUMAN DETECTED (conf: {max_confidence:.2f})")
                else:
                    print(f"[{timestamp}] ✓ No human detected")
                
                if db_collection is not None:
                    detection_doc = {
                        "detected": human_detected,
                        "confidence": float(max_confidence),
                        "timestamp": self.last_detection_time
                    }
                    db_collection.update_one(
                        {"_id": "current"},
                        {"$set": detection_doc},
                        upsert=True
                    )
                    
                    if human_detected and Config:
                        try:
                            from pymongo import MongoClient
                            client = MongoClient(Config.MONGO_URI)
                            db = client[Config.DB_NAME]
                            db['alerts'].insert_one({
                                "type": "human",
                                "detected": True,
                                "confidence": float(max_confidence),
                                "timestamp": self.last_detection_time,
                                "nodeId": "webcam"
                            })
                        except:
                            pass
                
                time.sleep(interval)
        except KeyboardInterrupt:
            print("\n🛑 Stopping")
        finally:
            cap.release()
            self.running = False
    
    def start_continuous_detection(self, db_collection=None, interval=None):
        if self.running:
            return False
        if not self.model:
            return False
        
        interval = interval or (getattr(Config, 'DETECTION_INTERVAL', 3) if Config else 3)
        self.running = True
        self.detection_thread = threading.Thread(
            target=self._continuous_detection_loop,
            args=(db_collection, interval),
            daemon=True
        )
        self.detection_thread.start()
        return True
    
    def stop_continuous_detection(self):
        if not self.running:
            return False
        self.running = False
        if self.detection_thread:
            self.detection_thread.join(timeout=5)
        return True
    
    def get_status(self):
        return {
            "detected": self.last_detected,
            "confidence": self.last_confidence,
            "timestamp": self.last_detection_time,
            "running": self.running
        }