import os
from datetime import datetime, timedelta
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from config import Config
from utils.human_detection import HumanDetector
from utils.rainfall_predictor import RainfallPredictor

app = Flask(__name__)
CORS(app)

client = MongoClient(Config.MONGO_URI)
db = client[Config.DB_NAME]

readings_col = db['readings']
alerts_col = db['alerts']
valve_status_col = db['valve_status']
valve_control_col = db['valve_control']

human_detector = HumanDetector()

if human_detector.model:
    human_detector.start_continuous_detection(
        db_collection=db['human_detection'],
        interval=Config.DETECTION_INTERVAL
    )
    print(f"✓ Continuous human detection started")
else:
    print("⚠️ Human detection disabled")

rainfall_predictor = RainfallPredictor(Config.MODEL_PATH)

DAM_LOCATION = {
    "latitude": Config.DAM_LATITUDE,
    "longitude": Config.DAM_LONGITUDE,
    "name": "Smart Dam Location"
}

def nice_ts(raw):
    if raw is None:
        return ""
    try:
        if isinstance(raw, (int, float)):
            dt = datetime.utcfromtimestamp(raw / 1000.0)
        elif isinstance(raw, str):
            dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        else:
            dt = raw
        ist_dt = dt + timedelta(hours=5, minutes=30)
        return ist_dt.strftime("%d %b %Y, %I:%M %p IST")
    except:
        return str(raw)

def fetch_weather():
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": DAM_LOCATION["latitude"],
        "longitude": DAM_LOCATION["longitude"],
        "current_weather": True,
        "hourly": "precipitation_probability,cloudcover,relativehumidity_2m,sunshine_duration,winddirection_10m",
        "timezone": "auto",
    }
    try:
        r = requests.get(url, params=params, timeout=5)
        r.raise_for_status()
        data = r.json()
        hourly = data.get("hourly", {})
        return {
            "temperature": data["current_weather"].get("temperature"),
            "humidity": hourly.get("relativehumidity_2m", [None])[0],
            "cloud": hourly.get("cloudcover", [None])[0],
            "rain_prob": hourly.get("precipitation_probability", [None])[0],
            "sunshine": hourly.get("sunshine_duration", [None])[0],
            "wind_direction": hourly.get("winddirection_10m", [None])[0],
            "windspeed": data["current_weather"].get("windspeed"),
            "time": data["current_weather"].get("time"),
        }
    except:
        return {"temperature": None, "humidity": None, "cloud": None, "rain_prob": None, "sunshine": None, "wind_direction": None, "windspeed": None, "time": None}

@app.route("/")
def health():
    return jsonify({"status": "ok", "service": "Smart Dam System", "version": "2.0"})

@app.route("/api/location")
def api_location():
    return jsonify(DAM_LOCATION)

@app.route("/api/weather")
def api_weather():
    w = fetch_weather()
    return jsonify({
        "locationName": DAM_LOCATION["name"],
        "temperature": w["temperature"],
        "humidity": w["humidity"],
        "cloud": w["cloud"],
        "rain_prob": w["rain_prob"],
        "windspeed": w["windspeed"],
        "wind_direction": w["wind_direction"],
        "sunshine": w["sunshine"],
        "time": nice_ts(datetime.utcnow())
    })

@app.route("/api/rainfall")
def api_rainfall():
    try:
        latest_reading = readings_col.find_one(sort=[("timestamp", -1)])
        if not latest_reading:
            return jsonify({"error": "No sensor data", "percent": 0, "rainLabel": "NO"}), 400
        
        sensor_temp = latest_reading.get("temp")
        sensor_humidity = latest_reading.get("humidity")
        if sensor_temp is None or sensor_humidity is None:
            return jsonify({"error": "Invalid sensor data", "percent": 0, "rainLabel": "NO"}), 400
        
        weather = fetch_weather()
        cloud_cover = weather.get("cloud")
        windspeed = weather.get("windspeed")
        pressure = 1013.25
        
        if cloud_cover is None or windspeed is None:
            return jsonify({"error": "Weather API incomplete", "percent": 0, "rainLabel": "NO"}), 500
        
        model_input = {
            'Temperature': float(sensor_temp),
            'Humidity': float(sensor_humidity),
            'Wind_Speed': float(windspeed),
            'Cloud_Cover': float(cloud_cover),
            'Pressure': float(pressure)
        }
        
        percent, rain_label = rainfall_predictor.predict(model_input)
        
        prediction_doc = {
            "percent": float(percent),
            "rainLabel": rain_label,
            "timestamp": datetime.utcnow(),
            "input_data": model_input
        }
        
        db['rainfall_predictions'].update_one({"_id": "current"}, {"$set": prediction_doc}, upsert=True)
        alerts_col.insert_one({"type": "rainfall_prediction", "percent": float(percent), "rainLabel": rain_label, "timestamp": datetime.utcnow()})
        
        return jsonify({"percent": float(percent), "rainLabel": rain_label, "timestamp": nice_ts(prediction_doc["timestamp"])})
    except Exception as e:
        return jsonify({"percent": 0, "rainLabel": "NO", "error": str(e)}), 500

@app.route("/api/readings", methods=["GET", "POST"])
def api_readings():
    if request.method == "POST":
        data = request.get_json()
        data["timestamp"] = datetime.utcnow()
        readings_col.insert_one(data)
        return jsonify({"success": True}), 201
    
    readings = list(readings_col.find(sort=[("timestamp", -1)], limit=500))
    for r in readings:
        r["_id"] = str(r["_id"])
        r["timestamp"] = nice_ts(r.get("timestamp"))
    return jsonify(readings)

@app.route("/api/alerts/<alert_type>", methods=["POST"])
def api_alert(alert_type):
    data = request.get_json()
    data["type"] = alert_type
    data["timestamp"] = datetime.utcnow()
    alerts_col.insert_one(data)
    return jsonify({"success": True}), 201

@app.route("/api/alerts/<alert_type>/logs")
def api_alert_logs(alert_type):
    logs = list(alerts_col.find({"type": alert_type}, sort=[("timestamp", -1)], limit=200))
    for log in logs:
        log["_id"] = str(log["_id"])
        log["timestamp"] = nice_ts(log.get("timestamp"))
    return jsonify(logs)

@app.route("/api/valve/status", methods=["GET", "PUT"])
def api_valve_status():
    if request.method == "PUT":
        data = request.get_json()
        data["timestamp"] = datetime.utcnow()
        valve_status_col.update_one({"_id": "current"}, {"$set": data}, upsert=True)
        return jsonify({"success": True})
    
    status = valve_status_col.find_one({"_id": "current"})
    if not status:
        return jsonify({"state": "CLOSED", "reason": "BOOT", "timestamp": "", "mode": "AUTO"})
    
    control = valve_control_col.find_one({"_id": "current"}) or {}
    return jsonify({
        "state": status.get("state", "CLOSED"),
        "reason": status.get("reason", "BOOT"),
        "timestamp": nice_ts(status.get("timestamp")),
        "mode": control.get("mode", "AUTO")
    })

@app.route("/api/valve/control", methods=["GET", "POST"])
def api_valve_control():
    if request.method == "POST":
        data = request.get_json()
        user_role = data.get("userRole", "user")
        if user_role != "admin":
            return jsonify({"success": False, "error": "Admin only"}), 403
        
        control_data = {
            "mode": data.get("mode", "AUTO"),
            "manualCommand": data.get("command", "NONE"),
            "updatedAt": datetime.utcnow(),
            "updatedBy": data.get("userId", "unknown")
        }
        valve_control_col.update_one({"_id": "current"}, {"$set": control_data}, upsert=True)
        return jsonify({"success": True})
    
    control = valve_control_col.find_one({"_id": "current"})
    if not control:
        return jsonify({"mode": "AUTO", "manualCommand": "NONE"})
    return jsonify({"mode": control.get("mode", "AUTO"), "manualCommand": control.get("manualCommand", "NONE")})

@app.route("/api/human-detection/status")
def api_human_detection_status():
    doc = db['human_detection'].find_one({"_id": "current"})
    if not doc:
        return jsonify({"humanDetected": False, "lastChecked": "", "confidence": 0.0, "detectorRunning": human_detector.running})
    return jsonify({
        "humanDetected": doc.get("detected", False),
        "lastChecked": nice_ts(doc.get("timestamp")),
        "confidence": doc.get("confidence", 0.0),
        "detectorRunning": human_detector.running
    })

@app.route("/api/dashboard/stats")
def api_dashboard_stats():
    try:
        latest_reading = readings_col.find_one(sort=[("timestamp", -1)])
        total_readings = readings_col.count_documents({})
        total_alerts = alerts_col.count_documents({})
        vibration_alerts = alerts_col.count_documents({"type": "vibration"})
        water_alerts = alerts_col.count_documents({"type": "waterlevel"})
        human_alerts = alerts_col.count_documents({"type": "human"})
        valve_status = valve_status_col.find_one({"_id": "current"})
        
        return jsonify({
            "currentReading": {
                "temperature": latest_reading.get("temp") if latest_reading else 0,
                "humidity": latest_reading.get("humidity") if latest_reading else 0,
                "waterLevel": latest_reading.get("percent") if latest_reading else 0,
                "valveState": valve_status.get("state") if valve_status else "CLOSED",
                "timestamp": nice_ts(latest_reading.get("timestamp")) if latest_reading else ""
            },
            "statistics": {
                "totalReadings": total_readings,
                "totalAlerts": total_alerts,
                "vibrationAlerts": vibration_alerts,
                "waterLevelAlerts": water_alerts,
                "humanDetectionAlerts": human_alerts
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"🔥 Backend starting on :{port}")
    app.run(host="0.0.0.0", port=port, debug=False)