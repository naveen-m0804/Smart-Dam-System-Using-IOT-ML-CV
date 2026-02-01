import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { LogTable } from '@/components/LogTable';
import { ReadingsTable } from '@/components/ReadingsTable';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import api, { type AlertLog, type SensorReading } from '@/lib/api';
import { RefreshCw, Droplets, Activity, UserX, Thermometer } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Logs = () => {
  const { isAdmin } = useAuth();
  const [waterLogs, setWaterLogs] = useState<AlertLog[]>([]);
  const [vibrationLogs, setVibrationLogs] = useState<AlertLog[]>([]);
  const [humanLogs, setHumanLogs] = useState<AlertLog[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [waterData, vibrationData, humanData, readingsData] = await Promise.allSettled([
        api.getAlertLogs('waterlevel'),
        api.getAlertLogs('vibration'),
        api.getAlertLogs('human'),
        api.getReadings(),
      ]);

      if (waterData.status === 'fulfilled') setWaterLogs(waterData.value);
      if (vibrationData.status === 'fulfilled') setVibrationLogs(vibrationData.value);
      if (humanData.status === 'fulfilled') setHumanLogs(humanData.value);
      if (readingsData.status === 'fulfilled') setReadings(readingsData.value);

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container mx-auto px-4 pt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">Sensor Logs</h2>
            <p className="text-sm text-muted-foreground">Historical data & alerts (newest first)</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Last update: {lastUpdate || 'Loading...'}</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="readings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50 p-1 rounded-lg mb-6">
            <TabsTrigger 
              value="readings" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Thermometer className="w-4 h-4" />
              <span className="hidden sm:inline">Readings</span>
            </TabsTrigger>
            <TabsTrigger 
              value="water" 
              className="flex items-center gap-2 data-[state=active]:bg-water data-[state=active]:text-water-foreground"
            >
              <Droplets className="w-4 h-4" />
              <span className="hidden sm:inline">Water</span>
            </TabsTrigger>
            <TabsTrigger 
              value="vibration" 
              className="flex items-center gap-2 data-[state=active]:bg-warning data-[state=active]:text-warning-foreground"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Vibration</span>
            </TabsTrigger>
            <TabsTrigger 
              value="human" 
              className="flex items-center gap-2 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
            >
              <UserX className="w-4 h-4" />
              <span className="hidden sm:inline">Human</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="readings" className="mt-0">
            <ReadingsTable readings={readings} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="water" className="mt-0">
            <LogTable logs={waterLogs} type="waterlevel" isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="vibration" className="mt-0">
            <LogTable logs={vibrationLogs} type="vibration" isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="human" className="mt-0">
            <LogTable logs={humanLogs} type="human" isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </main>

      <Navigation />
    </div>
  );
};

export default Logs;