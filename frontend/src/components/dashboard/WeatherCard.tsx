import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSun, 
  CloudFog, 
  Wind, 
  Droplets,
  Compass
} from 'lucide-react';
import type { WeatherData } from '@/lib/api';

interface WeatherCardProps {
  weather: WeatherData | null;
  timestamp: string;
}

export function WeatherCard({ weather, timestamp }: WeatherCardProps) {
  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="w-16 h-16 text-muted-foreground" />;

    const cloud = weather.cloud || 0;
    const rainProb = weather.rain_prob || 0;
    const sunshine = weather.sunshine || 0;

    if (rainProb > 60) {
      return <CloudRain className="w-16 h-16 text-water" />;
    }
    if (cloud > 70) {
      return <CloudFog className="w-16 h-16 text-muted-foreground" />;
    }
    if (cloud > 40) {
      return <CloudSun className="w-16 h-16 text-warning" />;
    }
    if (sunshine > 500) {
      return <Sun className="w-16 h-16 text-warning" />;
    }
    return <Cloud className="w-16 h-16 text-muted-foreground" />;
  };

  const getWeatherCondition = () => {
    if (!weather) return 'Loading...';

    const cloud = weather.cloud || 0;
    const rainProb = weather.rain_prob || 0;
    const sunshine = weather.sunshine || 0;

    if (rainProb > 60) return 'Rainy';
    if (cloud > 70) return 'Foggy';
    if (cloud > 40) return 'Partly Cloudy';
    if (sunshine > 500) return 'Sunny';
    return 'Cloudy';
  };

  const getWindDirection = (degrees: number | null | undefined) => {
    if (degrees === null || degrees === undefined) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/20">
          <Cloud className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold">Weather</h3>
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {getWeatherIcon()}
          <div>
            <p className="font-display text-2xl font-bold">{getWeatherCondition()}</p>
            <p className="text-sm text-muted-foreground">{weather?.locationName || 'Dam Location'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl font-bold text-primary">
            {weather?.temperature?.toFixed(1) || '--'}°C
          </p>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
          <Droplets className="w-4 h-4 text-water" />
          <div>
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="font-semibold">{weather?.humidity ?? '--'}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
          <Cloud className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Cloud Cover</p>
            <p className="font-semibold">{weather?.cloud ?? '--'}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
          <Wind className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Wind</p>
            <p className="font-semibold">{weather?.windspeed ?? '--'} km/h</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
          <Compass className="w-4 h-4 text-warning" />
          <div>
            <p className="text-xs text-muted-foreground">Direction</p>
            <p className="font-semibold">{getWindDirection(weather?.wind_direction)}</p>
          </div>
        </div>
      </div>

      {/* Rain Probability */}
      <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Rain Probability</span>
          <span className="font-semibold text-water">{weather?.rain_prob ?? 0}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-water/80 to-water transition-all duration-500"
            style={{ width: `${weather?.rain_prob ?? 0}%` }}
          />
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-4 text-xs text-muted-foreground">
        Last Updated: {timestamp || 'N/A'}
      </div>
    </div>
  );
}