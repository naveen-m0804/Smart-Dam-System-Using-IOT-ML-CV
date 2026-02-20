# 🌊 Smart Dam System — IoT + ML + Computer Vision

> An intelligent, automated dam monitoring and control platform that combines ESP32-based IoT sensors, Machine Learning flood prediction, and Computer Vision water level detection — with a real-time web dashboard for remote monitoring and automated gate control.

**🔗 Live Demo:** [damflow.vercel.app](https://damflow.vercel.app)

---

## 📌 Table of Contents

1. [Abstract](#abstract)
2. [Problem Statement](#problem-statement)
3. [Why This System?](#why-this-system)
4. [System Architecture](#system-architecture)
5. [Key Features](#key-features)
6. [Technology Stack](#technology-stack)
7. [Module Breakdown](#module-breakdown)
   - [IoT Layer — ESP32](#1-iot-layer--esp32)
   - [ML Layer — Flood Prediction](#2-ml-layer--flood-prediction)
   - [CV Layer — Visual Water Level Detection](#3-cv-layer--visual-water-level-detection)
   - [Backend — API & Data Hub](#4-backend--api--data-hub)
   - [Frontend — Dashboard](#5-frontend--dashboard)
8. [System Flow](#system-flow)
9. [Data Flow Diagram](#data-flow-diagram)
10. [Hardware Components](#hardware-components)
11. [Folder Structure](#folder-structure)
12. [Getting Started](#getting-started)
13. [Environment Variables](#environment-variables)
14. [API Overview](#api-overview)
15. [Screenshots & Output](#screenshots--output)
16. [Future Enhancements](#future-enhancements)
17. [Contributing](#contributing)
18. [License](#license)

---

## Abstract

The Smart Dam System is an integrated platform that brings together the Internet of Things (IoT), Machine Learning (ML), and Computer Vision (CV) to automate and intelligently monitor dam operations. Traditional dam management relies heavily on manual inspections and reactive decision-making, which introduces dangerous delays during critical events like floods or sudden water level spikes.

This system replaces that manual workflow with a tri-layered intelligent architecture. An ESP32 microcontroller continuously reads physical sensor data — water level, flow rate, rainfall, and gate position — and pushes this data to the cloud in real time. A Python-based Machine Learning model analyzes incoming sensor streams to predict flood risk, classify dam status, and trigger automated gate control decisions. Simultaneously, a Computer Vision module processes camera feed or image input to independently verify water levels visually, adding a hardware-independent layer of confirmation.

All data is aggregated by a TypeScript backend and served to a responsive web dashboard where operators can monitor real-time telemetry, review alerts, view historical trends, and override automated decisions when needed. The result is a system that is proactive rather than reactive — capable of preventing damage before it occurs.

---

## Problem Statement

Dam management in India and across the world faces several critical challenges:

- **Manual Monitoring Risk** — Most dams still rely on manual water level gauge readings, which are error-prone and infeasible during nighttime or extreme weather conditions.
- **Delayed Flood Response** — Reactive decision-making means gate operations often happen too late after rainfall events, causing downstream flooding.
- **Lack of Predictive Intelligence** — Existing systems have no mechanism to forecast flood conditions hours in advance based on sensor trends and historical data.
- **No Remote Visibility** — Dam operators and disaster management officials lack access to real-time dam telemetry from remote locations.
- **Single Point of Failure** — Systems that rely only on one sensor type are vulnerable to hardware failure — a combined IoT + CV approach provides redundancy.

This system addresses all of these by building a fully automated, remotely accessible, multi-modal dam intelligence platform.

---

## Why This System?

| Traditional Dam Management | Smart Dam System |
|---|---|
| Manual water level readings | Real-time IoT sensor data pushed every few seconds |
| Reactive gate operation | Proactive automated gate control via ML predictions |
| No flood forecasting | ML model predicts flood risk before it occurs |
| No visual verification | Computer Vision independently confirms water level |
| On-site only monitoring | Remote web dashboard accessible from anywhere |
| No historical analysis | Full historical data logging with visual trend charts |
| No alert system | Automated alerts for critical threshold breaches |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        PHYSICAL LAYER (Hardware)                  │
│  Water Level Sensor · Flow Rate Sensor · Rain Sensor · Camera    │
│                    ESP32 Microcontroller                         │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP / MQTT (WiFi)
┌────────────────────────────▼─────────────────────────────────────┐
│                     BACKEND (Node.js + TypeScript)                │
│   REST API  ·  WebSocket Server  ·  Data Ingestion Endpoint      │
│         Time-Series Storage  ·  Alert Engine                     │
└──────┬─────────────────────────────────────────┬─────────────────┘
       │                                          │
┌──────▼─────────────┐                ┌──────────▼──────────────┐
│   ML SERVICE       │                │   CV SERVICE             │
│   (Python)         │                │   (Python)               │
│                    │                │                           │
│  Flood Risk Model  │                │  Image / Camera Feed      │
│  Anomaly Detection │                │  Water Level Extraction   │
│  Gate Control      │                │  Visual Confirmation      │
│  Recommendations   │                │  (OpenCV / CNN)           │
└──────┬─────────────┘                └──────────┬───────────────┘
       │                                          │
┌──────▼──────────────────────────────────────────▼───────────────┐
│                   FRONTEND DASHBOARD (React + TypeScript)         │
│  Real-Time Telemetry  ·  Alerts  ·  Historical Charts            │
│  Gate Control Panel  ·  CV Feed Viewer  ·  Prediction Display    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 📡 IoT Real-Time Monitoring
- ESP32 collects water level, flow rate, and rainfall data continuously
- Data pushed to backend at configurable intervals via WiFi
- Gate position status tracked and reported

### 🤖 Machine Learning Flood Prediction
- Trained model classifies current dam state: Normal, Warning, Critical, or Flood Risk
- Predicts future water level trends based on sensor history
- Automatically recommends or triggers gate open/close decisions
- Anomaly detection flags unusual sensor readings

### 👁️ Computer Vision Water Level Detection
- Processes live camera feed or uploaded images of the dam
- Detects water surface level independently from IoT sensors
- Provides visual confirmation layer separate from hardware sensors
- Uses image segmentation and edge detection via OpenCV

### 📊 Real-Time Web Dashboard
- Live sensor telemetry with auto-updating charts
- Visual alert banners for Warning / Critical / Flood states
- Historical data visualization with trend analysis
- Remote gate control override for operators
- CV feed display integrated in dashboard

### 🔔 Alert & Notification System
- Threshold-based alerts for water level, flow rate, and rainfall
- System state transitions trigger real-time dashboard alerts
- Designed to integrate with SMS/email notification services

### 🔄 Automated Gate Control
- ML model drives gate open/close commands automatically
- Manual override available from dashboard
- Gate position is confirmed by ESP32 feedback sensor

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React.js** | Component-based UI library |
| **TypeScript** | Type-safe JavaScript for robust frontend code |
| **Tailwind CSS** | Mobile-responsive utility-first styling |
| **Recharts / Chart.js** | Real-time and historical data visualization |
| **WebSocket Client** | Live data streaming from backend |
| **Vercel** | Frontend deployment and hosting |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | REST API framework |
| **TypeScript** | Type-safe server-side development |
| **WebSocket (ws)** | Real-time push to connected dashboard clients |
| **PostgreSQL / SQLite** | Time-series sensor data storage |

### ML & Computer Vision

| Technology | Purpose |
|---|---|
| **Python** | Core language for ML and CV modules |
| **scikit-learn / TensorFlow** | Flood prediction and classification model |
| **OpenCV** | Image processing for visual water level detection |
| **NumPy / Pandas** | Data manipulation and preprocessing |
| **Flask / FastAPI** | Lightweight API to expose ML and CV endpoints |

### IoT — ESP32

| Technology | Purpose |
|---|---|
| **ESP32 Microcontroller** | Core IoT hardware unit |
| **C++ (Arduino framework)** | Firmware programming |
| **WiFi Library** | Network connectivity |
| **HTTPClient** | Sending sensor data to backend API |
| **Ultrasonic / Float Sensor** | Water level measurement |
| **Flow Rate Sensor (YF-S201)** | Measuring water flow |
| **Rain Sensor Module** | Rainfall detection |
| **Servo Motor** | Dam gate actuation |

---

## Module Breakdown

### 1. IoT Layer — ESP32

The ESP32 is the physical edge device at the dam site. It runs firmware written in C++ using the Arduino framework and is responsible for:

- **Reading sensors** — water level (ultrasonic or float sensor), flow rate (YF-S201 pulse counter), rainfall (analog rain sensor), and gate servo position.
- **Processing raw values** — converting pulse counts to flow rate (litres/min), distance to water level (cm/percentage), and voltage to rainfall intensity.
- **Transmitting data** — packaging sensor readings as a JSON payload and sending them via HTTP POST to the backend data ingestion endpoint at regular intervals (configurable, default every 5 seconds).
- **Receiving commands** — polling or listening for gate control commands from the backend and actuating the servo motor accordingly.

The ESP32 connects to the local WiFi network at the dam site. The backend URL and WiFi credentials are stored in the firmware configuration.

```
Sensors → ESP32 → JSON Payload → HTTP POST → Backend API
Backend API → Gate Command → ESP32 → Servo Motor → Gate Movement
```

### 2. ML Layer — Flood Prediction

The Python ML service is a separate microservice that consumes sensor data and provides intelligent analysis:

- **Classification Model** — Trained on historical dam sensor data to classify the current state as one of: `NORMAL`, `WATCH`, `WARNING`, `CRITICAL`, or `FLOOD`.
- **Water Level Trend Prediction** — A regression model forecasts the next N minutes of water level based on recent sensor readings and rainfall.
- **Anomaly Detection** — Flags sensor readings that deviate abnormally from historical patterns, which could indicate sensor failure or unusual hydrological events.
- **Gate Recommendation** — Based on predicted water level and current state, the model outputs a recommended gate action: `OPEN`, `CLOSE`, or `MAINTAIN`.
- **Exposure** — The ML service exposes a REST API (Flask/FastAPI) that the backend calls after each new sensor reading to get the current prediction and recommendation.

**Model Training:**
The model is trained on a dataset of sensor readings labeled with dam states. Features include current water level, rate of change of water level, flow rate, cumulative rainfall, and hour of day.

### 3. CV Layer — Visual Water Level Detection

The Computer Vision module provides hardware-independent water level estimation using image analysis:

- **Input** — Still images uploaded via the dashboard or frames from a camera stream pointed at the dam wall or a marked water gauge.
- **Processing Pipeline:**
  1. Image preprocessing (resize, normalize, grayscale conversion)
  2. Edge detection (Canny / Sobel) to find water surface boundary
  3. Reference line calibration against known gauge markings
  4. Water level percentage extraction from detected surface position
- **Output** — Water level percentage value and an annotated image showing the detected surface line, which is displayed in the dashboard.
- **Purpose** — Acts as a backup confirmation for IoT sensor readings. If the CV-detected level significantly diverges from the sensor reading, an inconsistency alert is raised.

### 4. Backend — API & Data Hub

The Node.js/TypeScript backend is the central hub that:

- Receives sensor data from the ESP32 via a POST endpoint and stores it in the database.
- After each ingestion, calls the ML service API to get flood prediction and gate recommendation.
- Compares ML prediction against configured thresholds and generates alerts.
- Broadcasts real-time updates to all connected dashboard clients via WebSocket.
- Provides REST endpoints for the dashboard to fetch historical data, current status, and trigger manual gate commands.
- Forwards gate commands to the ESP32 (either through polling or a push mechanism).
- Accepts CV image analysis results and stores them alongside sensor readings.

### 5. Frontend — Dashboard

The React/TypeScript dashboard is the operator-facing interface:

- **Live Telemetry Panel** — Displays current water level (%), flow rate (L/min), rainfall (mm/hr), gate position, and ML-predicted dam state with color-coded status badge.
- **Real-Time Charts** — Line charts updating every few seconds showing water level, flow rate, and rainfall trends over the last hour/day.
- **Flood Risk Indicator** — Visual gauge showing the ML model's current flood risk score.
- **CV Feed Panel** — Displays the annotated camera image with detected water level line.
- **Alert Feed** — Live scrolling feed of system alerts with timestamps and severity levels.
- **Gate Control Panel** — Buttons to manually open, close, or set gate position, with current gate status display.
- **Historical View** — Date-range picker to view historical sensor data as charts and downloadable CSV.

---

## System Flow

```
[Physical Dam Site]
        │
        │  Sensors continuously read water conditions
        ▼
[ESP32 Firmware]
        │
        │  Every 5 seconds: POST /api/sensor-data
        ▼
[Backend — Node.js/TS]
        │
        ├──► Store reading in database
        │
        ├──► Call ML Service API → Get flood prediction + gate recommendation
        │
        ├──► Check thresholds → Generate alerts if needed
        │
        ├──► Broadcast updated state via WebSocket to all dashboard clients
        │
        └──► If ML recommends gate action: Send command to ESP32
                        │
                        ▼
              [ESP32 actuates Servo Motor → Gate moves]

[Camera / Image Upload]
        │
        │  POST /api/cv/analyze (image)
        ▼
[CV Service — Python]
        │
        │  Detect water level from image → Return level % + annotated image
        ▼
[Backend] ──► Store CV result ──► Broadcast to dashboard

[Dashboard — React/TS]
        │
        ├──► WebSocket: Receive live sensor updates and alerts
        ├──► REST: Fetch historical data for charts
        ├──► Display: Telemetry, CV feed, charts, alerts, gate panel
        └──► User Action: Manual gate command → POST /api/gate/control
```

---

## Data Flow Diagram

```
┌────────────┐    JSON POST     ┌──────────────┐    Query      ┌──────────────┐
│   ESP32    │ ─────────────► │   Backend    │ ──────────► │   Database   │
│  Sensors   │                 │  (Express/TS)│ ◄──────────  │ (PostgreSQL) │
└────────────┘                 └──────┬───────┘   Results     └──────────────┘
                                      │
                         ┌────────────┼─────────────┐
                         │            │              │
                  ML API Call    WebSocket       CV Storage
                         │         Push              │
                         ▼            ▼              │
                ┌────────────┐  ┌──────────┐         │
                │ ML Service │  │Dashboard │ ◄────────┘
                │ (Python/   │  │(React/TS)│
                │  Flask)    │  └──────────┘
                └────────────┘
                         │
                Gate Recommendation
                         │
                         ▼
                ┌────────────────┐
                │ ESP32 Gate Cmd │
                │ → Servo Motor  │
                └────────────────┘
```

---

## Hardware Components

| Component | Model / Type | Purpose |
|---|---|---|
| **Microcontroller** | ESP32 DevKit | Core IoT processing unit |
| **Water Level Sensor** | Ultrasonic (HC-SR04) or Float Sensor | Measuring water depth/level |
| **Flow Rate Sensor** | YF-S201 Hall Effect | Measuring water outflow in L/min |
| **Rain Sensor** | Analog Rain Drop Module | Detecting and measuring rainfall |
| **Gate Actuator** | Servo Motor (SG90/MG996R) | Physically opening/closing dam gate |
| **Camera Module** | ESP32-CAM or USB Camera | Live visual feed for CV module |
| **Power Supply** | 5V / 3.3V regulated | Powering ESP32 and sensors |
| **WiFi Network** | Local router / Hotspot | Connectivity to cloud backend |

---

## Folder Structure

```
Smart-Dam-System-Using-IOT-ML-CV/
│
├── esp32/
│   └── smart_dam_esp32/
│       ├── smart_dam_esp32.ino       # Main Arduino sketch
│       ├── config.h                  # WiFi credentials, backend URL, pins
│       ├── sensors.h                 # Sensor reading functions
│       └── gate_control.h            # Servo motor control logic
│
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Express + WebSocket server entry
│   │   ├── routes/
│   │   │   ├── sensorData.ts         # POST /api/sensor-data (ESP32 ingestion)
│   │   │   ├── gateControl.ts        # POST /api/gate/control
│   │   │   ├── history.ts            # GET /api/history
│   │   │   └── cv.ts                 # POST /api/cv/analyze
│   │   ├── services/
│   │   │   ├── mlService.ts          # Calls Python ML API
│   │   │   ├── alertEngine.ts        # Threshold evaluation + alert generation
│   │   │   └── websocket.ts          # WebSocket broadcast manager
│   │   └── db/
│   │       ├── index.ts              # Database connection pool
│   │       └── schema.sql            # Table definitions
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                   # Root component + routing
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Main monitoring page
│   │   │   └── History.tsx           # Historical data viewer
│   │   ├── components/
│   │   │   ├── TelemetryPanel.tsx    # Live sensor readings
│   │   │   ├── WaterLevelChart.tsx   # Real-time level chart
│   │   │   ├── FloodRiskGauge.tsx    # ML risk indicator
│   │   │   ├── CVFeedPanel.tsx       # Annotated CV image display
│   │   │   ├── AlertFeed.tsx         # Scrolling alert list
│   │   │   └── GateControlPanel.tsx  # Manual gate controls
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts       # WebSocket connection hook
│   │   └── types/
│   │       └── dam.types.ts          # Shared TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── ml/                               # (Python ML & CV service)
│   ├── app.py                        # Flask/FastAPI entry point
│   ├── model/
│   │   ├── train.py                  # Model training script
│   │   ├── predict.py                # Prediction inference
│   │   └── flood_model.pkl           # Saved trained model
│   ├── cv/
│   │   ├── water_level_detection.py  # OpenCV water level extractor
│   │   └── annotate.py               # Image annotation utilities
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- Arduino IDE with ESP32 board support installed
- PostgreSQL (or SQLite for local dev)
- Git

---

### 1. Clone the Repository
```bash
git clone https://github.com/naveen-m0804/Smart-Dam-System-Using-IOT-ML-CV.git
cd Smart-Dam-System-Using-IOT-ML-CV
```

---

### 2. Flash the ESP32 Firmware

1. Open Arduino IDE
2. Install the ESP32 board package via Board Manager
3. Install required libraries: `WiFi`, `HTTPClient`, `ESP32Servo`
4. Open `esp32/smart_dam_esp32/smart_dam_esp32.ino`
5. Edit `config.h` with your WiFi credentials and backend URL:
```cpp
#define WIFI_SSID     "your_wifi_ssid"
#define WIFI_PASSWORD "your_wifi_password"
#define BACKEND_URL   "http://your-backend-ip:5000/api/sensor-data"
```
6. Select your ESP32 board and COM port, then upload

---

### 3. Set Up the ML / CV Service

```bash
cd ml
pip install -r requirements.txt

# Train the model (if not already trained)
python model/train.py

# Start the ML service
python app.py
# Runs on http://localhost:8000
```

---

### 4. Set Up the Backend

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
npm run migrate

# Start development server
npm run dev
# Runs on http://localhost:5000
```

---

### 5. Set Up the Frontend

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env
# Set REACT_APP_API_BASE_URL and REACT_APP_WS_URL

npm start
# Runs on http://localhost:3000
```

---

## Environment Variables

### Backend `.env`
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartdam

# ML Service URL
ML_SERVICE_URL=http://localhost:8000

# Alert Thresholds
WATER_LEVEL_WARNING=70
WATER_LEVEL_CRITICAL=85
WATER_LEVEL_FLOOD=95
FLOW_RATE_MAX=500

# CORS
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

### ML Service `.env`
```env
PORT=8000
MODEL_PATH=model/flood_model.pkl
```

---

## API Overview

### Sensor Data Ingestion (from ESP32)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sensor-data` | Receive sensor readings from ESP32 |

**Payload:**
```json
{
  "water_level_pct": 72.5,
  "flow_rate_lpm": 124.3,
  "rainfall_mm": 12.0,
  "gate_position": "OPEN",
  "timestamp": "2026-02-20T10:30:00Z"
}
```

### Dashboard Data
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/status/current` | Latest sensor reading + ML state |
| GET | `/api/history` | Historical readings (query: `from`, `to`, `interval`) |
| GET | `/api/alerts` | Recent alert history |

### Gate Control
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/gate/control` | Send gate open/close command |

**Payload:**
```json
{ "action": "OPEN" }
```

### Computer Vision
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/cv/analyze` | Upload image for CV water level detection |

---

## Screenshots & Output

### Dashboard — Live Telemetry Overview
![Dashboard](docs/screenshots/dashboard.png)

### ESP32 Hardware Setup
![Hardware](docs/screenshots/esp32-hardware.png)

---

## Future Enhancements

- **SMS / WhatsApp Alerts** — Integrate Twilio or WhatsApp Business API to push flood warnings to dam officials and downstream residents.
- **Drone Integration** — Use aerial drone imagery as input to the CV module for large reservoir surveying.
- **Multi-Dam Network** — Scale the platform to monitor a network of connected dams with a centralized command center.
- **Digital Twin** — Create a 3D simulation of the dam that updates in real time based on sensor data.
- **Rainfall Forecast Integration** — Pull weather forecast APIs (IMD / OpenWeatherMap) to factor predicted rainfall into the ML model for earlier warning.
- **Mobile App** — React Native app for field operators to monitor and control the dam from mobile devices offline and online.
- **MQTT Protocol** — Replace HTTP polling with MQTT for more efficient bidirectional IoT communication.
- **Edge ML** — Run a lightweight version of the flood prediction model directly on the ESP32 for offline operation during connectivity loss.
- **Energy Harvesting** — Solar-powered ESP32 deployment for remote dam sites without grid electricity.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'Add: description of change'`)
4. Push to your branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

Please ensure changes are tested and documented before submitting.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built to protect lives and infrastructure through intelligent, real-time dam automation.</strong><br/>
  <sub>Combining IoT · Machine Learning · Computer Vision for smarter water resource management</sub>
</div>
