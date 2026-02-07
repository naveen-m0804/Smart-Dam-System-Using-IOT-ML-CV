// Dynamic API URL from localStorage
const DEFAULT_API_URL = 'https://smart-dam-system-using-iot-ml-cv.onrender.com';

function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  const url = localStorage.getItem('dam_api_url_v2') || DEFAULT_API_URL;
  console.log('Using API URL:', url);
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

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Health check
  health: () => fetchApi<{ status: string; service: string }>('/'),

  // Location
  getLocation: () => fetchApi<{ latitude: number; longitude: number; name: string }>('/api/location'),

  // Weather
  getWeather: () => fetchApi<WeatherData>('/api/weather'),

  // Rainfall prediction
  getRainfall: () => fetchApi<RainfallPrediction>('/api/rainfall'),

  // Sensor readings
  getReadings: () => fetchApi<SensorReading[]>('/api/readings'),

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

  // Human detection
  getHumanDetectionStatus: () => fetchApi<HumanDetectionStatus>('/api/human-detection/status'),

  // Alert logs
  getAlertLogs: (type: string) => fetchApi<AlertLog[]>(`/api/alerts/${type}/logs`),
};

export default api;
