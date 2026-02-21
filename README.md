# ðŸŒŠ Smart Dam System â€” IoT + ML + Computer Vision

> An intelligent, automated dam monitoring and control platform that combines ESP32-based IoT sensors, Machine Learning flood prediction, and Computer Vision water level detection â€” with a real-time web dashboard for remote monitoring and automated gate control.

**ðŸ”— Live Demo:** [damflow.vercel.app](https://damflow.vercel.app)

---

## ðŸ“Œ Table of Contents

1. [Abstract](#abstract)
2. [Problem Statement](#problem-statement)
3. [Why This System?](#why-this-system)
4. [System Architecture](#system-architecture)
5. [Key Features](#key-features)
6. [Technology Stack](#technology-stack)
7. [Module Breakdown](#module-breakdown)
   - [IoT Layer â€” ESP32](#1-iot-layer--esp32)
   - [ML Layer â€” Flood Prediction](#2-ml-layer--flood-prediction)
   - [CV Layer â€” Visual Water Level Detection](#3-cv-layer--visual-water-level-detection)
   - [Backend â€” API & Data Hub](#4-backend--api--data-hub)
   - [Frontend â€” Dashboard](#5-frontend--dashboard)
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

This system replaces that manual workflow with a tri-layered intelligent architecture. An ESP32 microcontroller continuously reads physical sensor data â€” water level, flow rate, rainfall, and gate position â€” and pushes this data to the cloud in real time. A Python-based Machine Learning model analyzes incoming sensor streams to predict flood risk, classify dam status, and trigger automated gate control decisions. Simultaneously, a Computer Vision module processes camera feed or image input to independently verify water levels visually, adding a hardware-independent layer of confirmation.

All data is aggregated by a TypeScript backend and served to a responsive web dashboard where operators can monitor real-time telemetry, review alerts, view historical trends, and override automated decisions when needed. The result is a system that is proactive rather than reactive â€” capable of preventing damage before it occurs.

---

## Problem Statement

Dam management in India and across the world faces several critical challenges:

- **Manual Monitoring Risk** â€” Most dams still rely on manual water level gauge readings, which are error-prone and infeasible during nighttime or extreme weather conditions.
- **Delayed Flood Response** â€” Reactive decision-making means gate operations often happen too late after rainfall events, causing downstream flooding.
- **Lack of Predictive Intelligence** â€” Existing systems have no mechanism to forecast flood conditions hours in advance based on sensor trends and historical data.
- **No Remote Visibility** â€” Dam operators and disaster management officials lack access to real-time dam telemetry from remote locations.
- **Single Point of Failure** â€” Systems that rely only on one sensor type are vulnerable to hardware failure â€” a combined IoT + CV approach provides redundancy.

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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        PHYSICAL LAYER (Hardware)                  â”‚
â”‚  Water Level Sensor Â· Flow Rate Sensor Â· Rain Sensor Â· Camera    â”‚
â”‚                    ESP32 Microcontroller                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â”‚ HTTP / MQTT (WiFi)
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     BACKEND (Node.js + TypeScript)                â”‚
â”‚   REST API  Â·  WebSocket Server  Â·  Data Ingestion Endpoint      â”‚
â”‚         Time-Series Storage  Â·  Alert Engine                     â”‚
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚                                          â”‚
â”Œâ”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   ML SERVICE       â”‚                â”‚   CV SERVICE             â”‚
â”‚   (Python)         â”‚                â”‚   (Python)               â”‚
â”‚                    â”‚                â”‚                           â”‚
â”‚  Flood Risk Model  â”‚                â”‚  Image / Camera Feed      â”‚
â”‚  Anomaly Detection â”‚                â”‚  Water Level Extraction   â”‚
â”‚  Gate Control      â”‚                â”‚  Visual Confirmation      â”‚
â”‚  Recommendations   â”‚                â”‚  (OpenCV / CNN)           â”‚
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚                                          â”‚
â”Œâ”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   FRONTEND DASHBOARD (React + TypeScript)         â”‚
â”‚  Real-Time Telemetry  Â·  Alerts  Â·  Historical Charts            â”‚
â”‚  Gate Control Panel  Â·  CV Feed Viewer  Â·  Prediction Display    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Key Features

### ðŸ“¡ IoT Real-Time Monitoring
- ESP32 collects water level, flow rate, and rainfall data continuously
- Data pushed to backend at configurable intervals via WiFi
- Gate position status tracked and reported

### ðŸ¤– Machine Learning Flood Prediction
- Trained model classifies current dam state: Normal, Warning, Critical, or Flood Risk
- Predicts future water level trends based on sensor history
- Automatically recommends or triggers gate open/close decisions
- Anomaly detection flags unusual sensor readings

### ðŸ‘ï¸ Computer Vision Water Level Detection
- Processes live camera feed or uploaded images of the dam
- Detects water surface level independently from IoT sensors
- Provides visual confirmation layer separate from hardware sensors
- Uses image segmentation and edge detection via OpenCV

### ðŸ“Š Real-Time Web Dashboard
- Live sensor telemetry with auto-updating charts
- Visual alert banners for Warning / Critical / Flood states
- Historical data visualization with trend analysis
- Remote gate control override for operators
- CV feed display integrated in dashboard

### ðŸ”” Alert & Notification System
- Threshold-based alerts for water level, flow rate, and rainfall
- System state transitions trigger real-time dashboard alerts
- Designed to integrate with SMS/email notification services

### ðŸ”„ Automated Gate Control
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
| **MongoDB** | Time-series sensor data storage |

### ML & Computer Vision

| Technology | Purpose |
|---|---|
| **Python** | Core language for ML and CV modules |
| **scikit-learn / TensorFlow** | Flood prediction and classification model |
| **OpenCV** | Image processing for visual water level detection |
| **NumPy / Pandas** | Data manipulation and preprocessing |
| **Flask / FastAPI** | Lightweight API to expose ML and CV endpoints |

### IoT â€” ESP32

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

### 1. IoT Layer â€” ESP32

The ESP32 is the physical edge device at the dam site. It runs firmware written in C++ using the Arduino framework and is responsible for:

- **Reading sensors** â€” water level (ultrasonic or float sensor), flow rate (YF-S201 pulse counter), rainfall (analog rain sensor), and gate servo position.
- **Processing raw values** â€” converting pulse counts to flow rate (litres/min), distance to water level (cm/percentage), and voltage to rainfall intensity.
- **Transmitting data** â€” packaging sensor readings as a JSON payload and sending them via HTTP POST to the backend data ingestion endpoint at regular intervals (configurable, default every 5 seconds).
- **Receiving commands** â€” polling or listening for gate control commands from the backend and actuating the servo motor accordingly.

The ESP32 connects to the local WiFi network at the dam site. The backend URL and WiFi credentials are stored in the firmware configuration.

```
Sensors â†’ ESP32 â†’ JSON Payload â†’ HTTP POST â†’ Backend API
Backend API â†’ Gate Command â†’ ESP32 â†’ Servo Motor â†’ Gate Movement
```

### 2. ML Layer â€” Flood Prediction

The Python ML service is a separate microservice that consumes sensor data and provides intelligent analysis:

- **Classification Model** â€” Trained on historical dam sensor data to classify the current state as one of: `NORMAL`, `WATCH`, `WARNING`, `CRITICAL`, or `FLOOD`.
- **Water Level Trend Prediction** â€” A regression model forecasts the next N minutes of water level based on recent sensor readings and rainfall.
- **Anomaly Detection** â€” Flags sensor readings that deviate abnormally from historical patterns, which could indicate sensor failure or unusual hydrological events.
- **Gate Recommendation** â€” Based on predicted water level and current state, the model outputs a recommended gate action: `OPEN`, `CLOSE`, or `MAINTAIN`.
- **Exposure** â€” The ML service exposes a REST API (Flask/FastAPI) that the backend calls after each new sensor reading to get the current prediction and recommendation.

**Model Training:**
The model is trained on a dataset of sensor readings labeled with dam states. Features include current water level, rate of change of water level, flow rate, cumulative rainfall, and hour of day.

### 3. CV Layer â€” Visual Water Level Detection

The Computer Vision module provides hardware-independent water level estimation using image analysis:

- **Input** â€” Still images uploaded via the dashboard or frames from a camera stream pointed at the dam wall or a marked water gauge.
- **Processing Pipeline:**
  1. Image preprocessing (resize, normalize, grayscale conversion)
  2. Edge detection (Canny / Sobel) to find water surface boundary
  3. Reference line calibration against known gauge markings
  4. Water level percentage extraction from detected surface position
- **Output** â€” Water level percentage value and an annotated image showing the detected surface line, which is displayed in the dashboard.
- **Purpose** â€” Acts as a backup confirmation for IoT sensor readings. If the CV-detected level significantly diverges from the sensor reading, an inconsistency alert is raised.

### 4. Backend â€” API & Data Hub

The Node.js/TypeScript backend is the central hub that:

- Receives sensor data from the ESP32 via a POST endpoint and stores it in the database.
- After each ingestion, calls the ML service API to get flood prediction and gate recommendation.
- Compares ML prediction against configured thresholds and generates alerts.
- Broadcasts real-time updates to all connected dashboard clients via WebSocket.
- Provides REST endpoints for the dashboard to fetch historical data, current status, and trigger manual gate commands.
- Forwards gate commands to the ESP32 (either through polling or a push mechanism).
- Accepts CV image analysis results and stores them alongside sensor readings.

### 5. Frontend â€” Dashboard

The React/TypeScript dashboard is the operator-facing interface:

- **Live Telemetry Panel** â€” Displays current water level (%), flow rate (L/min), rainfall (mm/hr), gate position, and ML-predicted dam state with color-coded status badge.
- **Real-Time Charts** â€” Line charts updating every few seconds showing water level, flow rate, and rainfall trends over the last hour/day.
- **Flood Risk Indicator** â€” Visual gauge showing the ML model's current flood risk score.
- **CV Feed Panel** â€” Displays the annotated camera image with detected water level line.
- **Alert Feed** â€” Live scrolling feed of system alerts with timestamps and severity levels.
- **Gate Control Panel** â€” Buttons to manually open, close, or set gate position, with current gate status display.
- **Historical View** â€” Date-range picker to view historical sensor data as charts and downloadable CSV.

---

## System Flow

```
[Physical Dam Site]
        â”‚
        â”‚  Sensors continuously read water conditions
        â–¼
[ESP32 Firmware]
        â”‚
        â”‚  Every 5 seconds: POST /api/sensor-data
        â–¼
[Backend â€” Node.js/TS]
        â”‚
        â”œâ”€â”€â–º Store reading in database
        â”‚
        â”œâ”€â”€â–º Call ML Service API â†’ Get flood prediction + gate recommendation
        â”‚
        â”œâ”€â”€â–º Check thresholds â†’ Generate alerts if needed
        â”‚
        â”œâ”€â”€â–º Broadcast updated state via WebSocket to all dashboard clients
        â”‚
        â””â”€â”€â–º If ML recommends gate action: Send command to ESP32
                        â”‚
                        â–¼
              [ESP32 actuates Servo Motor â†’ Gate moves]

[Camera / Image Upload]
        â”‚
        â”‚  POST /api/cv/analyze (image)
        â–¼
[CV Service â€” Python]
        â”‚
        â”‚  Detect water level from image â†’ Return level % + annotated image
        â–¼
[Backend] â”€â”€â–º Store CV result â”€â”€â–º Broadcast to dashboard

[Dashboard â€” React/TS]
        â”‚
        â”œâ”€â”€â–º WebSocket: Receive live sensor updates and alerts
        â”œâ”€â”€â–º REST: Fetch historical data for charts
        â”œâ”€â”€â–º Display: Telemetry, CV feed, charts, alerts, gate panel
        â””â”€â”€â–º User Action: Manual gate command â†’ POST /api/gate/control
```

---

## Data Flow Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    JSON POST     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    Query      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   ESP32    â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º â”‚   Backend    â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º â”‚   Database   â”‚
â”‚  Sensors   â”‚                 â”‚  (Express/TS)â”‚ â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚ (MongoDB) â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                 â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜   Results     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                      â”‚
                         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                         â”‚            â”‚              â”‚
                  ML API Call    WebSocket       CV Storage
                         â”‚         Push              â”‚
                         â–¼            â–¼              â”‚
                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚
                â”‚ ML Service â”‚  â”‚Dashboard â”‚ â—„â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                â”‚ (Python/   â”‚  â”‚(React/TS)â”‚
                â”‚  Flask)    â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                         â”‚
                Gate Recommendation
                         â”‚
                         â–¼
                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                â”‚ ESP32 Gate Cmd â”‚
                â”‚ â†’ Servo Motor  â”‚
                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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
â”‚
â”œâ”€â”€ esp32/
â”‚   â””â”€â”€ smart_dam_esp32/
â”‚       â”œâ”€â”€ smart_dam_esp32.ino       # Main Arduino sketch
â”‚       â”œâ”€â”€ config.h                  # WiFi credentials, backend URL, pins
â”‚       â”œâ”€â”€ sensors.h                 # Sensor reading functions
â”‚       â””â”€â”€ gate_control.h            # Servo motor control logic
â”‚
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ index.ts                  # Express + WebSocket server entry
â”‚   â”‚   â”œâ”€â”€ routes/
â”‚   â”‚   â”‚   â”œâ”€â”€ sensorData.ts         # POST /api/sensor-data (ESP32 ingestion)
â”‚   â”‚   â”‚   â”œâ”€â”€ gateControl.ts        # POST /api/gate/control
â”‚   â”‚   â”‚   â”œâ”€â”€ history.ts            # GET /api/history
â”‚   â”‚   â”‚   â””â”€â”€ cv.ts                 # POST /api/cv/analyze
â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ mlService.ts          # Calls Python ML API
â”‚   â”‚   â”‚   â”œâ”€â”€ alertEngine.ts        # Threshold evaluation + alert generation
â”‚   â”‚   â”‚   â””â”€â”€ websocket.ts          # WebSocket broadcast manager
â”‚   â”‚   â””â”€â”€ db/
â”‚   â”‚       â”œâ”€â”€ index.ts              # MongoDB connection setup
â”‚   â”‚       â””â”€â”€ schema.ts            # MongoDB collections configuration
â”‚   â”œâ”€â”€ package.json
â”‚   â””â”€â”€ tsconfig.json
â”‚
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ App.tsx                   # Root component + routing
â”‚   â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”‚   â”œâ”€â”€ Dashboard.tsx         # Main monitoring page
â”‚   â”‚   â”‚   â””â”€â”€ History.tsx           # Historical data viewer
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ TelemetryPanel.tsx    # Live sensor readings
â”‚   â”‚   â”‚   â”œâ”€â”€ WaterLevelChart.tsx   # Real-time level chart
â”‚   â”‚   â”‚   â”œâ”€â”€ FloodRiskGauge.tsx    # ML risk indicator
â”‚   â”‚   â”‚   â”œâ”€â”€ CVFeedPanel.tsx       # Annotated CV image display
â”‚   â”‚   â”‚   â”œâ”€â”€ AlertFeed.tsx         # Scrolling alert list
â”‚   â”‚   â”‚   â””â”€â”€ GateControlPanel.tsx  # Manual gate controls
â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”‚   â””â”€â”€ useWebSocket.ts       # WebSocket connection hook
â”‚   â”‚   â””â”€â”€ types/
â”‚   â”‚       â””â”€â”€ dam.types.ts          # Shared TypeScript interfaces
â”‚   â”œâ”€â”€ package.json
â”‚   â””â”€â”€ tsconfig.json
â”‚
â”œâ”€â”€ ml/                               # (Python ML & CV service)
â”‚   â”œâ”€â”€ app.py                        # Flask/FastAPI entry point
â”‚   â”œâ”€â”€ model/
â”‚   â”‚   â”œâ”€â”€ train.py                  # Model training script
â”‚   â”‚   â”œâ”€â”€ predict.py                # Prediction inference
â”‚   â”‚   â””â”€â”€ flood_model.pkl           # Saved trained model
â”‚   â”œâ”€â”€ cv/
â”‚   â”‚   â”œâ”€â”€ water_level_detection.py  # OpenCV water level extractor
â”‚   â”‚   â””â”€â”€ annotate.py               # Image annotation utilities
â”‚   â””â”€â”€ requirements.txt
â”‚
â”œâ”€â”€ .gitignore
â””â”€â”€ README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- Arduino IDE with ESP32 board support installed
- MongoDB
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
#define BACKEND_URL   "http://your-backend-ip:5000"
```
6. Select your ESP32 board and COM port, then upload

---

### 3. Verify the ML Model

The rainfall model is already included. Ensure the file exists at `backend/models/rainfall_model.pkl`.
No separate ML service is required for local runs.

---

### 4. Set Up the Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate  # Windows PowerShell
# source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt

# Configure environment variables
# Edit backend/.env with your values

python app.py
# Runs on http://localhost:5000
```

---

### 5. Set Up the Frontend

```bash
cd frontend
npm install

# Configure environment
# Edit frontend/.env with VITE_API_URL

npm run dev
# Runs on http://localhost:5173
```

---

## Environment Variables

### Backend `.env`
```env
MONGO_URI=mongodb://localhost:27017/
DB_NAME=smart_dam_db
MODEL_PATH=models/rainfall_model.pkl
YOLO_MODEL=yolov8n.pt
DETECTION_CONFIDENCE=0.5
DETECTION_INTERVAL=3
ENABLE_HUMAN_DETECTION=true
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
WEATHER_CACHE_TTL=300
SECRET_KEY=change-me
DAM_LATITUDE=12.96312116701951
DAM_LONGITUDE=79.94246446052891
PORT=5000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
```

### ML Model
The rainfall model is loaded from `backend/models/rainfall_model.pkl` via `MODEL_PATH` in the backend `.env`.

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

### Dashboard â€” Live Telemetry Overview
![Dashboard](docs/screenshots/dashboard.png)

### ESP32 Hardware Setup
![Hardware](docs/screenshots/esp32-hardware.png)

---

## Future Enhancements

- **SMS / WhatsApp Alerts** â€” Integrate Twilio or WhatsApp Business API to push flood warnings to dam officials and downstream residents.
- **Drone Integration** â€” Use aerial drone imagery as input to the CV module for large reservoir surveying.
- **Multi-Dam Network** â€” Scale the platform to monitor a network of connected dams with a centralized command center.
- **Digital Twin** â€” Create a 3D simulation of the dam that updates in real time based on sensor data.
- **Rainfall Forecast Integration** â€” Pull weather forecast APIs (IMD / OpenWeatherMap) to factor predicted rainfall into the ML model for earlier warning.
- **Mobile App** â€” React Native app for field operators to monitor and control the dam from mobile devices offline and online.
- **MQTT Protocol** â€” Replace HTTP polling with MQTT for more efficient bidirectional IoT communication.
- **Edge ML** â€” Run a lightweight version of the flood prediction model directly on the ESP32 for offline operation during connectivity loss.
- **Energy Harvesting** â€” Solar-powered ESP32 deployment for remote dam sites without grid electricity.

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

This project is licensed under the **MIT License** â€” see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built to protect lives and infrastructure through intelligent, real-time dam automation.</strong><br/>
  <sub>Combining IoT Â· Machine Learning Â· Computer Vision for smarter water resource management</sub>
</div>



