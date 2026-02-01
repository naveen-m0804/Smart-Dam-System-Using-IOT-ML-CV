import joblib
import pandas as pd
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class RainfallPredictor:
    def __init__(self, model_path):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        try:
            self.model = joblib.load(model_path)
            self.feature_cols = list(self.model.feature_names_in_)
            print(f"✓ Rainfall model loaded: {model_path}")
            print(f"  Features: {self.feature_cols}")
        except Exception as e:
            raise Exception(f"Failed to load model: {e}")
    
    def predict(self, input_data):
        try:
            X = pd.DataFrame([input_data], columns=self.feature_cols)
            
            if hasattr(self.model, "predict_proba"):
                proba = self.model.predict_proba(X)
                percent = proba[0][1] * 100.0
            else:
                pred = self.model.predict(X)
                percent = pred[0] * 100.0
            
            rain_label = "YES" if percent >= 50.0 else "NO"
            return round(percent, 2), rain_label
            
        except Exception as e:
            print(f"⚠️ Prediction error: {e}")
            humidity = input_data.get('Humidity', 50.0)
            cloud = input_data.get('Cloud_Cover', 50.0)
            percent = (humidity * 0.6 + cloud * 0.4)
            rain_label = "YES" if percent >= 50.0 else "NO"
            return round(percent, 2), rain_label
    
    def predict_from_sensors(self, temp, humidity, wind_speed, cloud_cover, pressure):
        input_data = {
            'Temperature': float(temp),
            'Humidity': float(humidity),
            'Wind_Speed': float(wind_speed),
            'Cloud_Cover': float(cloud_cover),
            'Pressure': float(pressure)
        }
        return self.predict(input_data)