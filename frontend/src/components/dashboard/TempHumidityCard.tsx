import { Thermometer, Droplet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface TempHumidityCardProps {
  temperature: number;
  humidity: number;
  timestamp: string;
  history?: { temp: number; humidity: number; time: string }[];
}

export function TempHumidityCard({ temperature, humidity, timestamp, history = [] }: TempHumidityCardProps) {
  const getTempStatus = () => {
    if (temperature > 35) return 'critical';
    if (temperature > 30) return 'warning';
    return 'safe';
  };

  const getHumidityStatus = () => {
    if (humidity > 80) return 'water';
    if (humidity > 60) return 'primary';
    return 'safe';
  };

  const tempStatus = getTempStatus();
  const humidityStatus = getHumidityStatus();

  const tempColors = {
    critical: 'text-destructive',
    warning: 'text-warning',
    safe: 'text-success',
  };

  const humidityColors = {
    water: 'text-water',
    primary: 'text-primary',
    safe: 'text-success',
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-warning/20">
          <Thermometer className="w-6 h-6 text-warning" />
        </div>
        <h3 className="font-display text-lg font-semibold">Temperature & Humidity</h3>
      </div>

      {/* Values Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-secondary/50 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Thermometer className={`w-5 h-5 ${tempColors[tempStatus]}`} />
            <span className="text-sm text-muted-foreground">Temp</span>
          </div>
          <span className={`font-display text-3xl font-bold ${tempColors[tempStatus]}`}>
            {temperature?.toFixed(1) || '--'}°C
          </span>
        </div>

        <div className="text-center p-4 bg-secondary/50 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Droplet className={`w-5 h-5 ${humidityColors[humidityStatus]}`} />
            <span className="text-sm text-muted-foreground">Humidity</span>
          </div>
          <span className={`font-display text-3xl font-bold ${humidityColors[humidityStatus]}`}>
            {humidity?.toFixed(1) || '--'}%
          </span>
        </div>
      </div>

      {/* Mini Chart */}
      {history.length > 0 && (
        <div className="h-24 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history.slice(-10)}>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 8%)',
                  border: '1px solid hsl(222 30% 18%)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(210 40% 96%)' }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="hsl(38 92% 50%)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="hsl(199 89% 48%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 text-xs text-muted-foreground">
        Last Updated: {timestamp || 'N/A'}
      </div>
    </div>
  );
}