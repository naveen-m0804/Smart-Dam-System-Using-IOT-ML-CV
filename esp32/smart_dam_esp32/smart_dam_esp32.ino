#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"
#include <ESP32Servo.h>
#include <ArduinoJson.h>
#include <time.h>

// ⚠️ Replace with your actual WiFi credentials before uploading to ESP32
#define WIFI_SSID   "your_wifi_ssid"
#define WIFI_PASS   "your_wifi_password"

// ========== BACKEND URL CONFIGURATION ==========
// Set USE_LOCAL_SERVER to true when running backend on your local machine
// Set USE_LOCAL_SERVER to false when using the Render cloud deployment
#define USE_LOCAL_SERVER false

// Local backend URL - change IP to your computer's local IP address
// Find your IP: Windows -> ipconfig, Linux/Mac -> ifconfig
#define LOCAL_BACKEND_URL  "http://192.168.1.100:5000"
// Cloud backend URL (Render deployment)
#define CLOUD_BACKEND_URL  "https://smart-dam-system-using-iot-ml-cv.onrender.com"

#define BACKEND_URL (USE_LOCAL_SERVER ? LOCAL_BACKEND_URL : CLOUD_BACKEND_URL)
#define DAM_HEIGHT_CM 40

// Intervals (ms)
#define POST_INTERVAL_MS 2000
#define SENSOR_INTERVAL_MS 2000
#define CONTROL_INTERVAL_MS 2500
#define HUMAN_INTERVAL_MS 4000
#define RAIN_INTERVAL_MS 20000
#define HTTP_TIMEOUT_MS 3000

#define DHTPIN 4
#define DHTTYPE DHT11
#define TRIG_PIN 5
#define ECHO_PIN 18
#define BUZZER_PIN 26
#define SERVO_PIN 14
#define VIBRATION_PIN 21

DHT dht(DHTPIN, DHTTYPE);
Servo valveServo;
const String BASE_URL = String(BACKEND_URL);

// ---------------- STATE ----------------
bool valveState = false;
float lastRainPercent = 0.0;
bool lastVibrationState = false;
bool humanDetected = false;
float humanConfidence = 0.0;
String controlMode = "AUTO";
String manualCommand = "NONE";

unsigned long lastPost = 0;
unsigned long lastRainFetch = 0;
unsigned long lastControlFetch = 0;
unsigned long lastHumanCheckFetch = 0;
unsigned long lastSensorRead = 0;

float currentTemp = NAN;
float currentHum = NAN;
float currentDist = NAN;
float currentPct = NAN;
bool currentVibration = false;

// ---------------- BUZZER ----------------
void setupBuzzer() { pinMode(BUZZER_PIN, OUTPUT); }

void beep(int ms) {
  tone(BUZZER_PIN, 2000);
  delay(ms);
  noTone(BUZZER_PIN);
}

// ---------------- UTILS ----------------
String nowIso() {
  time_t now = time(nullptr);
  struct tm *tm_info = gmtime(&now);
  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", tm_info);
  return String(buf);
}

bool ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  WiFi.disconnect();
  WiFi.reconnect();
  return false;
}

bool beginRequest(HTTPClient &http, const String &path) {
  if (!ensureWiFi()) return false;
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.setReuse(true);
  return http.begin(BASE_URL + path);
}

// ---------------- LOG ALERT ----------------
void logAlert(String type, JsonDocument &doc) {
  String json;
  serializeJson(doc, json);
  HTTPClient http;
  if (beginRequest(http, "/api/alerts/" + type)) {
    http.addHeader("Content-Type", "application/json");
    http.POST(json);
    http.end();
  }
}

// ---------------- SENSORS ----------------
bool checkVibration() {
  bool current = digitalRead(VIBRATION_PIN);
  if (current && !lastVibrationState) {
    Serial.println("*** VIBRATION ***");
    beep(200);

    DynamicJsonDocument doc(256);
    doc["level"] = "HIGH";
    doc["timestamp"] = nowIso();
    doc["nodeId"] = "main";
    logAlert("vibration", doc);
  }
  lastVibrationState = current;
  return current;
}

float measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long d = pulseIn(ECHO_PIN, HIGH, 30000);
  if (d == 0) return -1;
  return min((d * 0.0343f) / 2.0f, (float)DAM_HEIGHT_CM);
}

float calcWaterPercent(float dist) {
  if (dist < 0) return 100;
  return ((DAM_HEIGHT_CM - dist) / DAM_HEIGHT_CM) * 100.0f;
}

// ---------------- BACKEND FETCH ----------------
void fetchRainPrediction() {
  if (millis() - lastRainFetch < RAIN_INTERVAL_MS) return;
  lastRainFetch = millis();

  HTTPClient http;
  if (beginRequest(http, "/api/rainfall")) {
    if (http.GET() == 200) {
      DynamicJsonDocument doc(256);
      deserializeJson(doc, http.getString());
      lastRainPercent = doc["percent"];
    }
    http.end();
  }
}

void fetchHumanDetection() {
  if (millis() - lastHumanCheckFetch < HUMAN_INTERVAL_MS) return;
  lastHumanCheckFetch = millis();

  HTTPClient http;
  if (beginRequest(http, "/api/human-detection/status")) {
    if (http.GET() == 200) {
      DynamicJsonDocument doc(256);
      deserializeJson(doc, http.getString());

      bool prev = humanDetected;
      humanDetected = doc["humanDetected"];
      humanConfidence = doc["confidence"];

      if (humanDetected && !prev) {
        Serial.println("*** HUMAN DETECTED ***");
        beep(150); delay(50); beep(150);

        DynamicJsonDocument alert(256);
        alert["detected"] = true;
        alert["confidence"] = humanConfidence;
        alert["timestamp"] = nowIso();
        alert["nodeId"] = "main";
        logAlert("human", alert);
      }
    }
    http.end();
  }
}

void fetchControl() {
  if (millis() - lastControlFetch < CONTROL_INTERVAL_MS) return;
  lastControlFetch = millis();

  HTTPClient http;
  if (beginRequest(http, "/api/valve/control")) {
    if (http.GET() == 200) {
      DynamicJsonDocument doc(256);
      deserializeJson(doc, http.getString());
      controlMode = doc["mode"].as<String>();
      manualCommand = doc["manualCommand"].as<String>();
    }
    http.end();
  }
}

// ---------------- SERVO ----------------
void setValve(bool open, String reason) {
  if (valveState == open) return;

  if (humanDetected && open) {
    Serial.println("*** BLOCKED BY HUMAN ***");
    beep(300);
    return;
  }

  valveState = open;
  valveServo.write(open ? 90 : 0);

  if (open) { beep(100); delay(50); beep(100); }
  else { beep(200); }

  delay(600);

  DynamicJsonDocument doc(256);
  doc["state"] = valveState ? "OPEN" : "CLOSED";
  doc["reason"] = reason;
  doc["timestamp"] = nowIso();

  HTTPClient http;
  if (beginRequest(http, "/api/valve/status")) {
    http.addHeader("Content-Type", "application/json");
    String json;
    serializeJson(doc, json);
    http.PUT(json);
    http.end();
  }
}

// ---------------- AUTO LOGIC ----------------
void autoControl(float pct) {
  if (humanDetected && valveState) {
    setValve(false, "HUMAN_SAFETY");
    return;
  }

  if (pct > 75) setValve(true, "HIGH_WATER");
  else if (lastRainPercent > 90 && pct > 60) setValve(true, "RAIN_PREDICTION");
  else if (pct < 45) setValve(false, "SAFE_LEVEL");
}

// ---------------- POST ----------------
void postReading(float temp, float hum, float dist, float pct, bool vibration) {
  if (!ensureWiFi()) return;
  if (isnan(temp) || isnan(hum)) return;

  DynamicJsonDocument doc(512);
  doc["temp"] = temp;
  doc["humidity"] = hum;
  doc["distance"] = dist;
  doc["percent"] = pct;
  doc["rain_prediction"] = lastRainPercent;
  doc["vibration"] = vibration;
  doc["valve_state"] = valveState ? "OPEN" : "CLOSED";
  doc["human_detected"] = humanDetected;
  doc["human_confidence"] = humanConfidence;
  doc["timestamp"] = nowIso();

  String json;
  serializeJson(doc, json);
  HTTPClient http;
  if (beginRequest(http, "/api/readings")) {
    http.addHeader("Content-Type", "application/json");
    http.POST(json);
    http.end();
  }
}

// ---------------- SETUP ----------------
void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(VIBRATION_PIN, INPUT_PULLUP);

  dht.begin();
  setupBuzzer();

  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);

  valveServo.setPeriodHertz(50);
  valveServo.attach(SERVO_PIN, 500, 2400);
  valveServo.write(0);
  valveState = false;

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);

  configTime(0, 0, "pool.ntp.org");
  beep(100); delay(100); beep(100);
}

// ---------------- LOOP ----------------
void loop() {
  unsigned long now = millis();
  currentVibration = checkVibration();

  if (now - lastSensorRead >= SENSOR_INTERVAL_MS) {
    currentTemp = dht.readTemperature();
    currentHum = dht.readHumidity();
    currentDist = measureDistance();
    currentPct = calcWaterPercent(currentDist);
    lastSensorRead = now;
  }

  fetchRainPrediction();
  fetchHumanDetection();
  fetchControl();

  Serial.printf("[DATA] T:%.1f H:%.1f D:%.1f W:%.1f R:%.1f V:%s H:%s(%.2f) VALVE:%s MODE:%s\n",
              currentTemp, currentHum, currentDist, currentPct, lastRainPercent,
              currentVibration ? "Y" : "N",
              humanDetected ? "Y" : "N",
              humanConfidence,
              valveState ? "OPEN" : "CLOSED",
              controlMode.c_str());

  if (!isnan(currentPct)) {
    if (controlMode == "AUTO") autoControl(currentPct);
    else {
      if (manualCommand == "OPEN") setValve(true, "MANUAL");
      if (manualCommand == "CLOSE") setValve(false, "MANUAL");
    }
  }

  if (now - lastPost > POST_INTERVAL_MS) {
    postReading(currentTemp, currentHum, currentDist, currentPct, currentVibration);
    lastPost = now;
  }

  delay(10);
}
