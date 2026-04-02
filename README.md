# 🌊 Smart Dam System — IoT + ML + Computer Vision

> An intelligent, automated dam monitoring and control platform that combines ESP32-based IoT sensors, Machine Learning rainfall prediction, and Computer Vision human detection — with a real-time web dashboard for remote monitoring and automated gate control.

**🔗 Live Demo:** [damflow.vercel.app](https://damflow.vercel.app)

---

   ![architecture_diagram_1775017570574](https://github.com/user-attachments/assets/994ffede-3f83-41d3-b6ea-a69fde83fbb7)


## 📌 Table of Contents

1. [Abstract](#abstract)
2. [Problem Statement](#problem-statement)
3. [System Architecture](#system-architecture)
4. [Key Features](#key-features)
5. [Technology Stack](#technology-stack)
6. [Module Breakdown](#module-breakdown)
   - [IoT Layer — ESP32](#1-iot-layer--esp32)
   - [ML Layer — Rainfall Prediction](#2-ml-layer--rainfall-prediction)
   - [CV Layer — Human Detection for Safety](#3-cv-layer--human-detection-for-safety)
   - [Backend — API Hub](#4-backend--api-hub)
   - [Frontend — Dashboard](#5-frontend--dashboard)
7. [Hardware Components](#hardware-components)
8. [Folder Structure](#folder-structure)
9. [Getting Started](#getting-started)
10. [Environment Variables](#environment-variables)
11. [API Overview](#api-overview)

---

## Abstract

The Smart Dam System integrates Internet of Things (IoT), Machine Learning (ML), and Computer Vision (CV) to automate dam operations safely. Traditional dam management relies on manual inspections, which causes delays during critical events like unexpected rains or sudden water level spikes, and poses severe safety risks to operators or nearby civilians.

This system replaces the manual workflow. An ESP32 pushes live local environmental and telemetry data (water level, temperature, humidity, structural vibration) to a centralized Python Flask server. A Machine Learning model predicts expected rainfall utilizing both sensor data and API-based weather forecasts. A Computer Vision module powered by YOLOv8 monitors the dam area for human presence to act as a safety kill-switch, preventing automated gates from opening and endangering people nearby.

Data is presented on a dynamic React-based dashboard where operators can monitor everything remotely, ensuring a proactive and safety-first approach to dam water regulation.

---

## Problem Statement

Dam management faces several critical challenges:

- **Manual Monitoring Risk** — Relying on manual gauge readings is slow and dangerous during extreme weather.
- **Reactive Operation** — Gate operations often occur too late, worsening downstream flooding.
- **Safety Hazards** — Automated gates can pose severe risks to humans near the spillway or operation zone if triggered without visual clearance.
- **Lack of Predictive Weather** — Without localized predictive ML modeling, preemptive water discharge is difficult.

This system tackles these issues through automated IoT telemetry, predictive ML insights, and AI-driven visual safety validation.

---

## System Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│                        PHYSICAL LAYER (Hardware)                 │
│  Ultrasonic Sensor · DHT11 · Vibration Sensor · Servo Motor      │
│                    ESP32 Microcontroller                         │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP (WiFi)
┌────────────────────────────▼─────────────────────────────────────┐
│                     BACKEND (Python Flask)                       │
│    REST API  ·  Threshold Alerts  · MongoDB Integration          │
│                                                                  │
│  ┌──────────────────────┐              ┌──────────────────────┐  │
│  │     ML SERVICE       │              │     CV SERVICE       │  │
│  │                      │              │                      │  │
│  │ Scikit-Learn Model   │              │ YOLOv8 Model         │  │
│  │ Rainfall Prediction  │              │ Human Detection      │  │
│  │ (Sensors + Weather)  │              │ Safety Override      │  │
│  └──────────────────────┘              └──────────────────────┘  │
└──────┬───────────────────────────────────────────────────────────┘
       │                                          
┌──────▼───────────────────────────────────────────────────────────┐
│                   FRONTEND DASHBOARD (React + TypeScript)        │
│    Real-Time Telemetry · Historical Charts · Gate Control        │
│    Active Alerts · Human Detection Status                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 📡 IoT Real-Time Monitoring
- ESP32 continuously collects water level, temperature, humidity, and vibration data.
- Automatically controls the gate servo based on defined water level percentage thresholds.
- Issues loud on-site buzzer alerts for structural vibrations or human detection.

### 🤖 Machine Learning Rainfall Prediction
- Scikit-learn model evaluates ambient conditions (Temperature & Humidity from ESP32 + Windspeed & Cloud Cover from Open-Meteo API).
- Predicts rainfall percentage and labels risk levels proactively.

### 👁️ Computer Vision Safety Override
- Utilizes the **YOLOv8** object detection model for continuous monitoring.
- Identifies humans loitering near the dam gate.
- If a human is detected, it overrides auto-open commands and locks the gate for safety (`HUMAN_SAFETY` lock), while sounding the hardware buzzer.

### 📊 Real-Time Web Dashboard
- Fully responsive dashboard built with React, Vite, and Tailwind CSS.
- Live telemetry panel (Water level, temperature, humidity, gate state).
- Graphical representation of historical sensor trends.
- Manual remote-override for gate control (Admin only).

---

## Technology Stack

### Frontend
- **React.js & Vite** — Component-based UI library & fast bundler.
- **TypeScript** — Strictly-typed code for robust frontend integration.
- **Tailwind CSS & Shadcn/UI** — Modern utility-first styling and accessible design.
- **Recharts** — Real-time tracking graphs.

### Backend
- **Python (Flask)** — Lightweight, highly performant RESTful server.
- **MongoDB (PyMongo)** — NoSQL time-series sensor data and alert logging.
- **Scikit-Learn** — Machine learning for the rainfall prediction inference.
- **Ultralytics (YOLOv8)** — Core CV engine for human presence detection.
- **Open-Meteo API** — Supplementary weather conditions ingestion.

### IoT — ESP32
- **C++ (Arduino framework)** — Firmware logic.
- **HTTPClient** — Sending sensor frames to the Flask server.
- **Hardware Integration** — DHT11, Ultrasonic (HC-SR04), Vibration sensor, Servo.

---

## Module Breakdown

### 1. IoT Layer — ESP32
The local ESP32 controller manages hardware connectivity:
- Calculates water depth using ultrasonic signals.
- Reads ambient temperature and humidity heavily necessary for ML predictions.
- Listens for structural vibration events to warn against mechanical failure.
- Receives automated or user-triggered override commands via API polling to actuate the gate servo.

### 2. ML Layer — Rainfall Prediction
Rather than depending exclusively on inaccurate physical rain sensors, the system integrates Python-based ML modeling. By blending local physical telemetry (temperature, humidity) with cloud API weather metrics (cloud cover, windspeed, pressure), it yields a localized `RainLabel` probability which dictates automated gate responses alongside current water levels.

### 3. CV Layer — Human Detection for Safety
A background Python thread continuously runs a YOLO object detector (powered by `yolov8n.pt`). If a person is detected in the operational zone, a flag is set on the backend. The ESP32 reads this flag and enters a hard-lock `HUMAN_SAFETY` status, refusing to open the spillway gate even if the water levels demand it, in strictly preventing accidental tragedies.

### 4. Backend — API Hub
Built entirely on Flask and PyMongo. 
- Normalizes incoming sensor data.
- Aggregates external weather APIs.
- Coordinates ML and CV inferences logic cleanly alongside REST API traffic.
- Tracks granular history in MongoDB for deep analytical querying by the React interface.

### 5. Frontend — Dashboard
A sleek, dark-themed control center built using Vite and Tailwind. Polling real-time API routes to display metrics dynamically on modern charts, allowing remote admin operators to override system choices or assess structural logs without leaving their desks.

---

## Hardware Components

| Component | Purpose |
|---|---|
| **ESP32 DevKit** | Primary WiFi-enabled MCU orchestrating sensors. |
| **Ultrasonic Sensor (HC-SR04)** | Tracks the active water level based on distance. |
| **DHT11 Sensor** | Records ambient temperature & humidity. |
| **Vibration Sensor** | Detects structural anomalies or shock. |
| **Servo Motor (SG90/MG996R)** | Actuates the dam gate (Valve Open/Closed). |
| **Active Buzzer** | Audio alarm for high water, human detection, or vibration. |

---

## Folder Structure

```text
Smart-Dam-System-Using-IOT-ML-CV/
│
├── esp32/
│   └── smart_dam_esp32/
│       └── smart_dam_esp32.ino       # Main Arduino sketch C++ code
│
├── backend/
│   ├── app.py                        # Flask server entry point & API routes
│   ├── config.py                     # Backend settings & env mapping
│   ├── requirements.txt              # PyPI dependencies
│   ├── models/                       # Scikit-learn trained models
│   ├── utils/
│   │   ├── human_detection.py        # YOLOv8 implementation wrapper
│   │   └── rainfall_predictor.py     # ML prediction script
│   └── yolov8n.pt                    # YOLO model weights
│
├── frontend/
│   ├── package.json                  # React + Vite deps
│   ├── vite.config.ts                # Vite config
│   ├── index.html
│   └── src/                          # React source (Pages, Components, API bindings)
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+ 
- MongoDB (Running locally or via Atlas)
- Arduino IDE with ESP32 board support

### 1. Flash the ESP32
1. Open Arduino IDE and add the ESP32 board index.
2. Install `ArduinoJson`, `DHT sensor library`, `ESP32Servo`.
3. Open `esp32/smart_dam_esp32/smart_dam_esp32.ino`.
4. Update definitions for your Wi-Fi and backend IP:
```cpp
#define WIFI_SSID   "your_wifi_ssid"
#define WIFI_PASS   "your_wifi_password"
#define BACKEND_URL "http://YOUR_LOCAL_IP:5000"
```
5. Compile and upload to ESP32.

### 2. Set Up Python Backend
```bash
cd backend
python -m venv venv
# Activate venv: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)

pip install -r requirements.txt

# Ensure MongoDB is running locally on port 27017, then:
python app.py
```

### 3. Set Up React Frontend
```bash
cd frontend
npm install
npm run dev
# The dashboard is now accessible at http://localhost:5173 
```

---

## Environment Variables

### Backend `.env`
Create a `.env` in the `backend/` directory:
```env
MONGO_URI=mongodb://localhost:27017/
DB_NAME=smart_dam_db
MODEL_PATH=models/rainfall_model.pkl
DETECTION_INTERVAL=3
ENABLE_HUMAN_DETECTION=true
CORS_ORIGINS=*
DAM_LATITUDE=12.9631
DAM_LONGITUDE=79.9424
PORT=5000
```

### Frontend `.env`
Create a `.env` in the `frontend/` directory (Optional, defaults generally work):
```env
VITE_API_URL=http://localhost:5000
```

---

## API Overview

### ESP32 Telemetry
- `POST /api/readings` - Accepts JSON payload arrays of `temp`, `humidity`, `percent` (water level), `vibration` states from ESP32.
- `GET /api/valve/control` - Returns current gate override mode (`AUTO` vs `OPEN`/`CLOSE`).

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Fetches the latest core metrics and alert counts.
- `GET /api/readings` - Fetches historical telemetry for plotting charts.
- `GET /api/rainfall` - Prompts the ML model to predict rainfall % using current state.
- `GET /api/human-detection/status` - Returns YOLOv8 confidence tracking.

---

<div align="center">
  <strong>Built to protect lives and infrastructure through intelligent, real-time dam automation.</strong><br/>
  <sub>Combining IoT · Machine Learning · Computer Vision for smarter water resource management</sub>
</div>
