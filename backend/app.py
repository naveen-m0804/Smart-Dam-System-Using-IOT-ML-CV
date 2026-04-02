import os
from datetime import datetime, timedelta
import requests
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from config import Config

if Config.ENABLE_HUMAN_DETECTION:
    from utils.human_detection import HumanDetector
else:
    class HumanDetector:
        def __init__(self):
            self.model = None
            self.running = False

app = Flask(__name__)

def _cors_origins():
    raw = getattr(Config, "CORS_ORIGINS", "*")
    if not raw or raw.strip() == "*":
        return "*"
    return [o.strip() for o in raw.split(",") if o.strip()]

CORS(app, resources={r"/*": {
    "origins": _cors_origins(),
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
}}, supports_credentials=False)

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

rainfall_predictor = None
WEATHER_CACHE = {"data": None, "ts": 0.0}

def get_rainfall_predictor():
    global rainfall_predictor
    if rainfall_predictor is None:
        from utils.rainfall_predictor import RainfallPredictor
        rainfall_predictor = RainfallPredictor(Config.MODEL_PATH)
    return rainfall_predictor

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
    now = time.time()
    if WEATHER_CACHE["data"] and (now - WEATHER_CACHE["ts"] < Config.WEATHER_CACHE_TTL):
        return WEATHER_CACHE["data"]

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
        result = {
            "temperature": data["current_weather"].get("temperature"),
            "humidity": hourly.get("relativehumidity_2m", [None])[0],
            "cloud": hourly.get("cloudcover", [None])[0],
            "rain_prob": hourly.get("precipitation_probability", [None])[0],
            "sunshine": hourly.get("sunshine_duration", [None])[0],
            "wind_direction": hourly.get("winddirection_10m", [None])[0],
            "windspeed": data["current_weather"].get("windspeed"),
            "time": data["current_weather"].get("time"),
        }
        WEATHER_CACHE["data"] = result
        WEATHER_CACHE["ts"] = now
        return result
    except:
        if WEATHER_CACHE["data"]:
            return WEATHER_CACHE["data"]
        return {"temperature": None, "humidity": None, "cloud": None, "rain_prob": None, "sunshine": None, "wind_direction": None, "windspeed": None, "time": None}

# ============================================================
#  HEALTH / CONNECTIVITY
# ============================================================

@app.route("/")
@app.route("/api/health")
@app.route("/api/ping")
def health():
    is_render = bool(os.getenv('RENDER') or os.getenv('RENDER_SERVICE_ID'))
    return jsonify({
        "status": "ok",
        "service": "Smart Dam System",
        "version": "2.1",
        "environment": "cloud" if is_render else "local",
    })

@app.route("/api/debug/connection")
def api_debug_connection():
    """Debug endpoint to verify backend + DB connectivity."""
    is_render = bool(os.getenv('RENDER') or os.getenv('RENDER_SERVICE_ID'))
    db_ok = False
    try:
        client.admin.command('ping')
        db_ok = True
    except:
        pass
    return jsonify({
        "backend": "ok",
        "mongodb": "ok" if db_ok else "unreachable",
        "environment": "cloud" if is_render else "local",
        "mongo_host": Config.MONGO_URI.split("@")[-1].split("/")[0] if "@" in Config.MONGO_URI else "localhost",
        "db_name": Config.DB_NAME,
        "cors_origins": _cors_origins(),
        "human_detection": Config.ENABLE_HUMAN_DETECTION,
    })

# ============================================================
#  MANUAL SENSOR INPUT (for local testing without ESP32)
# ============================================================

@app.route("/api/sensor/manual", methods=["POST"])
def api_sensor_manual():
    """Manual sensor data input — use this when ESP32 is not connected.
    Accepts JSON body with fields:
      - temp (required): temperature in Celsius
      - humidity (required): humidity percentage
      - distance (optional): ultrasonic distance in cm
      - percent (optional): water level percentage (auto-calculated from distance if omitted)
      - vibration (optional, default: false)
    """
    data = request.get_json() or {}
    required = ["temp", "humidity"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"success": False, "error": f"Missing fields: {', '.join(missing)}"}), 400

    # Compute water percent from distance if provided
    if "distance" in data and "percent" not in data:
        dam_height = 40  # cm, same as ESP32
        dist = float(data["distance"])
        data["percent"] = max(0, min(100, ((dam_height - dist) / dam_height) * 100))

    data.setdefault("percent", 0)
    data.setdefault("vibration", False)
    data.setdefault("valve_state", "CLOSED")
    data.setdefault("human_detected", False)
    data.setdefault("rain_prediction", 0)
    data["timestamp"] = datetime.utcnow()
    data["source"] = "manual"

    readings_col.insert_one(data)
    return jsonify({"success": True, "message": "Manual reading saved"}), 201

# ============================================================
#  EXISTING API ENDPOINTS
# ============================================================

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

        predictor = get_rainfall_predictor()
        percent, rain_label = predictor.predict(model_input)

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
    # First try the alerts collection
    logs = list(alerts_col.find({"type": alert_type}, sort=[("timestamp", -1)], limit=200))

    # If no dedicated alerts exist, synthesize logs from the readings collection
    # This ensures Water Level and Vibration tabs show historical data
    if not logs and alert_type in ("waterlevel", "vibration"):
        if alert_type == "waterlevel":
            # Pull water level history from readings that have a percent value
            readings = list(readings_col.find(
                {"percent": {"$exists": True}},
                sort=[("timestamp", -1)],
                limit=200
            ))
            for r in readings:
                pct = r.get("percent", 0) or 0
                if pct > 75:
                    level = "HIGH_WATER"
                elif pct > 50:
                    level = "MEDIUM"
                elif pct > 25:
                    level = "LOW"
                else:
                    level = "SAFE"
                logs.append({
                    "_id": str(r["_id"]),
                    "type": "waterlevel",
                    "level": level,
                    "distanceCm": r.get("distance"),
                    "percent": pct,
                    "nodeId": r.get("source", "esp32"),
                    "timestamp": r.get("timestamp"),
                })
        elif alert_type == "vibration":
            # Pull vibration history from readings
            readings = list(readings_col.find(
                {"vibration": {"$exists": True}},
                sort=[("timestamp", -1)],
                limit=200
            ))
            for r in readings:
                vib = r.get("vibration", False)
                logs.append({
                    "_id": str(r["_id"]),
                    "type": "vibration",
                    "level": "HIGH" if vib else "NORMAL",
                    "nodeId": r.get("source", "esp32"),
                    "timestamp": r.get("timestamp"),
                })

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
    if not Config.ENABLE_HUMAN_DETECTION:
        return jsonify({"humanDetected": False, "lastChecked": "", "confidence": 0.0, "detectorRunning": False, "disabled": True})
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
    is_render = bool(os.getenv('RENDER') or os.getenv('RENDER_SERVICE_ID'))
    env_label = "☁️  CLOUD (Render)" if is_render else "🏠 LOCAL"
    print(f"🔥 Backend starting on :{port}  [{env_label}]")
    print(f"   MongoDB: {Config.MONGO_URI.split('@')[-1].split('/')[0] if '@' in Config.MONGO_URI else 'localhost'}")
    print(f"   CORS: {_cors_origins()}")
    app.run(host="0.0.0.0", port=port, debug=not is_render)
