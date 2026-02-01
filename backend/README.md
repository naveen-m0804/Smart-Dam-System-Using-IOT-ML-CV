# 🌊 Smart Dam Automation System

Complete IoT-based dam automation system with human detection, rainfall prediction ML model, and real-time monitoring.

## 🎯 Features

- ✅ Real-time water level monitoring
- ✅ Automated valve control
- ✅ **Human detection safety system** (YOLOv8)
- ✅ **Rainfall prediction ML model**
- ✅ Vibration detection
- ✅ Role-based access control (Admin/User)
- ✅ Weather API integration
- ✅ MongoDB database
- ✅ ESP32 edge device support

---

## 📋 Prerequisites

### Hardware
- ESP32 WROOM development board
- DHT11 temperature/humidity sensor
- HC-SR04 ultrasonic sensor
- Servo motor (for valve)
- Vibration sensor
- Buzzer
- Webcam (for human detection)

### Software
- Python 3.9+
- MongoDB 6.0+
- Arduino IDE 2.0+
- Node.js 18+ (for frontend - separate repo)

---

## 🚀 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/smart-dam-system.git
cd smart-dam-system
```

### Step 2: MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Ubuntu/Debian
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `.env` file

### Step 3: Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Edit `.env` file:**
```env
MONGO_URI=mongodb://localhost:27017/
DB_NAME=smart_dam_db
MODEL_PATH=models/rainfall_model.pkl
YOLO_MODEL=yolov8n.pt
DETECTION_CONFIDENCE=0.5
SECRET_KEY=your-random-secret-key-here
DAM_LATITUDE=12.96312116701951
DAM_LONGITUDE=79.94246446052891
PORT=5000
```

### Step 4: Download/Place ML Model

**Option A: If you have the model**
```bash
# Create models directory
mkdir -p models

# Place your rainfall_model.pkl in models/
cp /path/to/your/rainfall_model.pkl models/
```

**Option B: Train new model (if needed)**
```python
# Create training script: train_model.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load your training data
# data = pd.read_csv('rainfall_data.csv')

# Features: 'temparature', 'humidity ', 'cloud ', 'sunshine', 'wind_direction'
# Target: 'rainfall' (0 or 1)

# model = RandomForestClassifier(n_estimators=100)
# model.fit(X_train, y_train)
# joblib.dump(model, 'models/rainfall_model.pkl')
```

### Step 5: YOLOv8 Model Setup

YOLOv8 will download automatically on first run. Or manually:

```bash
# The model will auto-download on first use
# For manual download:
pip install ultralytics
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

### Step 6: Test Backend

```bash
# Make sure MongoDB is running
sudo systemctl status mongod

# Start Flask app
python app.py

# You should see:
# 🔥 Smart Dam Backend starting on :5000
# 📍 Dam Location: 12.96312116701951, 79.94246446052891
# 🤖 Human Detection: Enabled
# 🌧️ Rainfall ML Model: Loaded
```

Test endpoints:
```bash
# Health check
curl http://localhost:5000/

# Weather
curl http://localhost:5000/api/weather

# Rainfall prediction
curl http://localhost:5000/api/rainfall
```

### Step 7: ESP32 Setup

#### 7.1 Install Arduino IDE Libraries

Open Arduino IDE → Tools → Manage Libraries → Install:
- `DHT sensor library` by Adafruit
- `ESP32Servo`
- `ArduinoJson` (v6.x)

#### 7.2 Configure ESP32 Code

Edit `esp32/smart_dam_esp32.ino`:

```cpp
// Update these lines:
#define WIFI_SSID   "YourWiFiName"
#define WIFI_PASS   "YourWiFiPassword"

// Update backend URL (your computer's IP)
#define BACKEND_URL "http://192.168.1.100:5000"
```

**Find your IP:**
```bash
# Linux/Mac
ifconfig | grep inet

# Windows
ipconfig
```

#### 7.3 Upload to ESP32

1. Connect ESP32 via USB
2. Select Board: **ESP32 Dev Module**
3. Select Port: `/dev/ttyUSB0` (or COM3 on Windows)
4. Click Upload ⬆️

#### 7.4 Monitor Serial

Open Serial Monitor (Ctrl+Shift+M):
- Baud rate: **115200**
- You should see connection logs and sensor readings

---

## 🔧 Configuration

### MongoDB Collections

The system creates these collections:
- `readings` - Sensor data
- `alerts` - Alert logs (water level, vibration, human detection)
- `valve_status` - Current valve state
- `valve_control` - Control commands
- `rainfall_predictions` - ML predictions
- `human_detection` - Detection status

### Pin Configuration (ESP32)

```
DHT11:          GPIO 4
Ultrasonic Trig: GPIO 5
Ultrasonic Echo: GPIO 18
Servo:          GPIO 14
Buzzer:         GPIO 26
Vibration:      GPIO 21
```

---

## 🎮 Usage

### For Users (Read-Only)

Users can view:
- Current sensor readings
- Dashboard statistics
- Water level trends
- Alert history

Users **cannot**:
- Control valve manually
- Change system settings

### For Admins

Admins can:
- View all data (same as users)
- **Manually control valve** (OPEN/CLOSE)
- Switch between AUTO/MANUAL modes
- Access system logs

### API Endpoints

#### Public (User & Admin)

```bash
GET  /api/weather              # Current weather
GET  /api/rainfall             # Rainfall prediction
GET  /api/readings             # Sensor readings
GET  /api/valve/status         # Valve status
GET  /api/dashboard/stats      # Dashboard data
GET  /api/alerts/waterlevel/logs
GET  /api/alerts/vibration/logs
GET  /api/human-detection/status
```

#### Admin Only

```bash
POST /api/valve/control        # Control valve
     Body: {
       "mode": "MANUAL",
       "command": "OPEN",
       "userRole": "admin"
     }
```

---

## 🛡️ Safety Features

### Human Detection Safety Protocol

1. **Detection Active**: Webcam continuously monitors for humans
2. **If human detected**:
   - ❌ Valve **cannot** open (even if water is high)
   - 🔴 If valve is already open → **closes immediately**
   - 🚨 Alert logged to database
   - 📢 Buzzer beeps warning

3. **Safety Override**: Human detection has highest priority
   - Overrides AUTO mode
   - Overrides MANUAL commands
   - Only resumes when human is clear

### Alert System

- **High Water Level** (>75%): Opens valve automatically
- **Rain Prediction** (>75% + >40% water): Opens valve
- **Vibration**: Logs alert, sounds buzzer
- **Human Detection**: Closes valve, prevents opening

---

## 📊 Monitoring

### View Logs

```bash
# Backend logs
tail -f backend.log

# MongoDB queries
mongosh
use smart_dam_db
db.readings.find().sort({timestamp: -1}).limit(10)
db.alerts.find({type: "human"})
```

### ESP32 Serial Logs

```
[DATA] T:28.5C H:65.0% D:15.2cm W:62.0% R:45.5% V:NO H:NO VLV:OPEN MODE:AUTO
[RAIN] Updated rainfall prediction: 45.5%
[OK] Data uploaded 200
```

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB connection error:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check connection string in .env
MONGO_URI=mongodb://localhost:27017/
```

**Model not loading:**
```bash
# Verify model file exists
ls -lh models/rainfall_model.pkl

# Check permissions
chmod 644 models/rainfall_model.pkl
```

**Webcam error:**
```bash
# Check webcam device
ls /dev/video*

# Test webcam
python -c "import cv2; print(cv2.VideoCapture(0).isOpened())"
```

### ESP32 Issues

**WiFi not connecting:**
- Check SSID/password
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)
- Check router settings

**Sensor readings NaN:**
- Check DHT11 connections
- Verify power supply (5V)
- Add 10kΩ pull-up resistor to data pin

**Backend connection failed:**
- Verify computer IP address
- Check firewall allows port 5000
- Ensure computer and ESP32 on same network

---

## 📦 Deployment

### Deploy Backend to Cloud

**Option 1: Heroku**
```bash
# Install Heroku CLI
# Create Procfile
echo "web: python app.py" > Procfile

# Deploy
heroku create smart-dam-backend
git push heroku main
```

**Option 2: DigitalOcean/AWS/Azure**
- Use MongoDB Atlas for database
- Deploy Flask app as container
- Update ESP32 with public URL

### Security for Production

```python
# In config.py - use strong secrets
SECRET_KEY = os.urandom(32)

# Enable HTTPS
# Use environment variables for all credentials
# Implement JWT authentication
# Rate limiting
```

---

## 📁 Project Structure

```
smart-dam-system/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── config.py                 # Configuration
│   ├── requirements.txt          # Python dependencies
│   ├── models/
│   │   └── rainfall_model.pkl    # ML model
│   └── utils/
│       ├── human_detection.py    # YOLOv8 detection
│       └── rainfall_predictor.py # ML predictor
├── esp32/
│   └── smart_dam_esp32.ino      # ESP32 firmware
├── .env                          # Environment variables (DO NOT COMMIT)
├── .env.example                  # Template
├── .gitignore
└── README.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📜 License

MIT License - See LICENSE file

---

## 👨‍💻 Author

Your Name - [GitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- YOLOv8 by Ultralytics
- OpenWeather API
- MongoDB
- ESP32 Community

---

## 📞 Support

For issues and questions:
- Open GitHub issue
- Email: your.email@example.com

---

**⚠️ Important Notes:**

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use strong SECRET_KEY** in production
3. **Enable HTTPS** for production deployment
4. **Regular backups** of MongoDB database
5. **Monitor webcam access** - privacy concerns
6. **Test thoroughly** before deploying to real dam

---

Made with ❤️ for smarter water management