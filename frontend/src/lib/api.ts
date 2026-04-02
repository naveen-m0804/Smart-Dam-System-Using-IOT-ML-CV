// Dynamic API URL: localStorage override → Vite env → auto-detect
const ENV_API_URL = import.meta.env.VITE_API_URL as string | undefined;
const RENDER_API_URL = 'https://smart-dam-system-using-iot-ml-cv.onrender.com';

/**
 * Determine the default API URL.
 * Priority:
 *  1. VITE_API_URL env variable (set during build or in .env)
 *  2. If frontend is served from localhost in dev mode → use '' (relative URL, Vite proxy handles it)
 *  3. If frontend is served from localhost in production → use http://localhost:5000
 *  4. Otherwise → use Render cloud URL
 */
function detectDefaultApiUrl(): string {
  if (ENV_API_URL) return ENV_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      // In Vite dev mode, use relative URL so Vite proxy handles /api/* calls
      if (import.meta.env.DEV) return '';
      return 'http://localhost:5000';
    }
  }
  return RENDER_API_URL;
}

const DEFAULT_API_URL = detectDefaultApiUrl();

function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  const url = localStorage.getItem('dam_api_url_v2') || DEFAULT_API_URL;
  return url;
}

export interface SensorReading {
  _id: string;
  temp: number;
  humidity: number;
  distance: number;
  percent: number;
  rain_prediction: number;
  vibration: boolean;
  valve_state: string;
  human_detected: boolean;
  timestamp: string;
  source?: string;
}

export interface WeatherData {
  locationName: string;
  temperature: number | null;
  humidity: number | null;
  cloud: number | null;
  rain_prob: number | null;
  windspeed: number | null;
  wind_direction: number | null;
  sunshine: number | null;
  time: string;
}

export interface RainfallPrediction {
  percent: number;
  rainLabel: string;
  timestamp: string;
}

export interface ValveStatus {
  state: 'OPEN' | 'CLOSED';
  reason: string;
  timestamp: string;
  mode: 'AUTO' | 'MANUAL';
}

export interface HumanDetectionStatus {
  humanDetected: boolean;
  lastChecked: string;
  confidence: number;
  detectorRunning: boolean;
  disabled?: boolean;
}

export interface DashboardStats {
  currentReading: {
    temperature: number;
    humidity: number;
    waterLevel: number;
    valveState: string;
    timestamp: string;
  };
  statistics: {
    totalReadings: number;
    totalAlerts: number;
    vibrationAlerts: number;
    waterLevelAlerts: number;
    humanDetectionAlerts: number;
  };
}

export interface AlertLog {
  _id: string;
  type: string;
  level?: string;
  distanceCm?: number;
  percent?: number;
  detected?: boolean;
  nodeId?: string;
  timestamp: string;
}

export interface ManualSensorInput {
  temp: number;
  humidity: number;
  distance?: number;
  percent?: number;
  vibration?: boolean;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Health check (use /api/ping so it works with Vite proxy too)
  health: () => fetchApi<{ status: string; service: string; environment: string }>('/api/ping'),

  // Debug connection info
  debugConnection: () => fetchApi<{
    backend: string;
    mongodb: string;
    environment: string;
    mongo_host: string;
    db_name: string;
  }>('/api/debug/connection'),

  // Location
  getLocation: () => fetchApi<{ latitude: number; longitude: number; name: string }>('/api/location'),

  // Weather
  getWeather: () => fetchApi<WeatherData>('/api/weather'),

  // Rainfall prediction
  getRainfall: () => fetchApi<RainfallPrediction>('/api/rainfall'),

  // Sensor readings
  getReadings: () => fetchApi<SensorReading[]>('/api/readings'),

  // Post sensor reading (same endpoint ESP32 uses)
  postReading: (data: ManualSensorInput) =>
    fetchApi<{ success: boolean }>('/api/readings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Manual sensor input (local testing endpoint)
  postManualSensor: (data: ManualSensorInput) =>
    fetchApi<{ success: boolean; message: string }>('/api/sensor/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard stats
  getDashboardStats: () => fetchApi<DashboardStats>('/api/dashboard/stats'),

  // Valve status
  getValveStatus: () => fetchApi<ValveStatus>('/api/valve/status'),

  // Valve control (admin only)
  setValveControl: (mode: 'AUTO' | 'MANUAL', command: 'OPEN' | 'CLOSE' | 'NONE', userId: string) =>
    fetchApi<{ success: boolean }>('/api/valve/control', {
      method: 'POST',
      body: JSON.stringify({ mode, command, userRole: 'admin', userId }),
    }),

  // Update valve status (PUT — used by ESP32, can also be called manually)
  updateValveStatus: (state: 'OPEN' | 'CLOSED', reason: string) =>
    fetchApi<{ success: boolean }>('/api/valve/status', {
      method: 'PUT',
      body: JSON.stringify({ state, reason }),
    }),

  // Human detection
  getHumanDetectionStatus: () => fetchApi<HumanDetectionStatus>('/api/human-detection/status'),

  // Post alert
  postAlert: (type: string, data: Record<string, unknown>) =>
    fetchApi<{ success: boolean }>(`/api/alerts/${type}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Alert logs
  getAlertLogs: (type: string) => fetchApi<AlertLog[]>(`/api/alerts/${type}/logs`),

  // Get current API base URL (utility)
  getCurrentBaseUrl: () => getApiBaseUrl(),
};

export default api;
