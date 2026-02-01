import { useEffect, useState, useCallback } from 'react';
import { WaterLevelCard } from '@/components/dashboard/WaterLevelCard';
import { RainfallCard } from '@/components/dashboard/RainfallCard';
import { TempHumidityCard } from '@/components/dashboard/TempHumidityCard';
import { VibrationCard } from '@/components/dashboard/VibrationCard';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { HumanDetectionCard } from '@/components/dashboard/HumanDetectionCard';
import { ValveControlCard } from '@/components/dashboard/ValveControlCard';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import api, { 
  type SensorReading, 
  type WeatherData, 
  type RainfallPrediction, 
  type ValveStatus, 
  type HumanDetectionStatus,
  type DashboardStats,
  type AlertLog
} from '@/lib/api';
import { RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [rainfall, setRainfall] = useState<RainfallPrediction | null>(null);
  const [valveStatus, setValveStatus] = useState<ValveStatus | null>(null);
  const [humanDetection, setHumanDetection] = useState<HumanDetectionStatus | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vibrationLastAlert, setVibrationLastAlert] = useState<string>('');
  const [humanLastAlert, setHumanLastAlert] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [readingsData, weatherData, rainfallData, valveData, humanData, statsData, vibrationLogs, humanLogs] = await Promise.allSettled([
        api.getReadings(),
        api.getWeather(),
        api.getRainfall(),
        api.getValveStatus(),
        api.getHumanDetectionStatus(),
        api.getDashboardStats(),
        api.getAlertLogs('vibration'),
        api.getAlertLogs('human'),
      ]);

      if (readingsData.status === 'fulfilled') setReadings(readingsData.value);
      if (weatherData.status === 'fulfilled') setWeather(weatherData.value);
      if (rainfallData.status === 'fulfilled') setRainfall(rainfallData.value);
      if (valveData.status === 'fulfilled') setValveStatus(valveData.value);
      if (humanData.status === 'fulfilled') setHumanDetection(humanData.value);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      
      // Get latest alert timestamps
      if (vibrationLogs.status === 'fulfilled' && vibrationLogs.value.length > 0) {
        setVibrationLastAlert(vibrationLogs.value[0].timestamp);
      }
      if (humanLogs.status === 'fulfilled' && humanLogs.value.length > 0) {
        setHumanLastAlert(humanLogs.value[0].timestamp);
      }

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to fetch data. Backend may be offline.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleModeChange = async (mode: 'AUTO' | 'MANUAL') => {
    try {
      await api.setValveControl(mode, 'NONE', 'admin');
      await fetchData();
    } catch (err) {
      console.error('Mode change error:', err);
    }
  };

  const handleValveCommand = async (command: 'OPEN' | 'CLOSE') => {
    try {
      await api.setValveControl('MANUAL', command, 'admin');
      await fetchData();
    } catch (err) {
      console.error('Valve command error:', err);
    }
  };

  const latestReading = readings[0];
  const readingHistory = readings.slice(0, 20).map(r => ({
    temp: r.temp,
    humidity: r.humidity,
    time: r.timestamp?.split(',')[1]?.trim() || '',
  })).reverse();

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20">
        {/* Status Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">System Dashboard</h2>
            <p className="text-sm text-muted-foreground">Real-time monitoring & control</p>
          </div>
          <div className="flex items-center gap-4">
            {error && (
              <span className="text-sm text-destructive">{error}</span>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Last update: {lastUpdate || 'Loading...'}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Water Level */}
          <WaterLevelCard 
            percent={stats?.currentReading.waterLevel || latestReading?.percent || 0}
            timestamp={stats?.currentReading.timestamp || latestReading?.timestamp || ''}
            valveState={valveStatus?.state || 'CLOSED'}
            valveMode={valveStatus?.mode || 'AUTO'}
          />

          {/* Rainfall Prediction */}
          <RainfallCard 
            percent={rainfall?.percent || 0}
            rainLabel={rainfall?.rainLabel || 'NO'}
            timestamp={rainfall?.timestamp || ''}
          />

          {/* Temperature & Humidity */}
          <TempHumidityCard 
            temperature={stats?.currentReading.temperature || latestReading?.temp || 0}
            humidity={stats?.currentReading.humidity || latestReading?.humidity || 0}
            timestamp={stats?.currentReading.timestamp || latestReading?.timestamp || ''}
            history={readingHistory}
          />

          {/* Vibration */}
          <VibrationCard 
            isVibrating={latestReading?.vibration || false}
            lastAlertTimestamp={vibrationLastAlert}
            timestamp={latestReading?.timestamp || ''}
          />

          {/* Weather */}
          <WeatherCard 
            weather={weather}
            timestamp={weather?.time || ''}
          />

          {/* Human Detection - Use both API status AND latest reading for reliability */}
          <HumanDetectionCard 
            humanDetected={humanDetection?.humanDetected || latestReading?.human_detected || false}
            confidence={humanDetection?.confidence || 0}
            lastAlertTimestamp={humanLastAlert}
            timestamp={humanDetection?.lastChecked || latestReading?.timestamp || ''}
            valveState={valveStatus?.state || 'CLOSED'}
          />

          {/* Valve Control - Full Width - Only for Admin */}
          {isAdmin && (
            <div className="md:col-span-2 lg:col-span-3">
              <ValveControlCard 
                state={valveStatus?.state || 'CLOSED'}
                mode={valveStatus?.mode || 'AUTO'}
                reason={valveStatus?.reason || 'BOOT'}
                timestamp={valveStatus?.timestamp || ''}
                onModeChange={handleModeChange}
                onValveCommand={handleValveCommand}
                humanDetected={humanDetection?.humanDetected || false}
              />
            </div>
          )}
        </div>
      </main>

      <Navigation />
    </div>
  );
};

export default Dashboard;