import { Droplets, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WaterLevelCardProps {
  percent: number;
  timestamp: string;
  valveState?: 'OPEN' | 'CLOSED';
  valveMode?: 'AUTO' | 'MANUAL';
}

export function WaterLevelCard({ percent, timestamp, valveState = 'CLOSED', valveMode = 'AUTO' }: WaterLevelCardProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(percent);
    }, 100);
    return () => clearTimeout(timer);
  }, [percent]);

  const getStatus = () => {
    if (percent > 75) return 'critical';
    if (percent > 50) return 'warning';
    return 'safe';
  };

  const getStatusText = () => {
    if (percent > 75) return 'CRITICAL';
    if (percent > 50) return 'MODERATE';
    return 'SAFE';
  };

  const status = getStatus();
  const statusText = getStatusText();

  const statusStyles = {
    critical: {
      glow: 'shadow-[0_0_20px_hsl(0_72%_51%/0.3)]',
      bg: 'bg-destructive/20',
      text: 'text-destructive',
      badge: 'bg-destructive/20 text-destructive',
    },
    warning: {
      glow: 'shadow-[0_0_20px_hsl(38_92%_50%/0.3)]',
      bg: 'bg-warning/20',
      text: 'text-warning',
      badge: 'bg-warning/20 text-warning',
    },
    safe: {
      glow: 'shadow-[0_0_20px_hsl(142_71%_45%/0.3)]',
      bg: 'bg-success/20',
      text: 'text-success',
      badge: 'bg-success/20 text-success',
    },
  };

  const styles = statusStyles[status];
  const isValveOpen = valveState === 'OPEN';

  return (
    <div className={`glass-card p-6 relative overflow-hidden ${styles.glow}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${styles.bg}`}>
            <Droplets className={`w-6 h-6 ${styles.text}`} />
          </div>
          <h3 className="font-display text-lg font-semibold">Water Level</h3>
        </div>
        <span className={`status-badge ${styles.badge}`}>
          {statusText}
        </span>
      </div>

      {/* Water Tank Visualization */}
      <div className="relative h-40 w-full bg-secondary/50 rounded-xl overflow-hidden border border-border">
        {/* Water fill with wave animation */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
          style={{
            height: `${animatedPercent}%`,
          }}
        >
          {/* Animated water gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, 
                hsl(199 89% 58% / 0.7) 0%, 
                hsl(199 89% 48%) 50%, 
                hsl(199 89% 38%) 100%)`,
            }}
          />
          
          {/* Wave animation layer 1 */}
          <div className="absolute inset-x-0 top-0 h-6 overflow-hidden">
            <svg 
              viewBox="0 0 120 28" 
              preserveAspectRatio="none" 
              className="w-[200%] h-full animate-[wave_3s_ease-in-out_infinite]"
            >
              <path
                d="M0 14 Q 15 0, 30 14 T 60 14 T 90 14 T 120 14 V 28 H 0 Z"
                fill="hsl(199 89% 58% / 0.6)"
              />
            </svg>
          </div>
          
          {/* Wave animation layer 2 */}
          <div className="absolute inset-x-0 top-1 h-5 overflow-hidden">
            <svg 
              viewBox="0 0 120 28" 
              preserveAspectRatio="none" 
              className="w-[200%] h-full animate-[wave_2.5s_ease-in-out_infinite_reverse]"
              style={{ animationDelay: '-0.5s' }}
            >
              <path
                d="M0 14 Q 15 28, 30 14 T 60 14 T 90 14 T 120 14 V 28 H 0 Z"
                fill="hsl(199 89% 68% / 0.4)"
              />
            </svg>
          </div>

          {/* Floating bubbles */}
          {animatedPercent > 10 && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute bottom-2 left-[20%] w-2 h-2 bg-white/30 rounded-full animate-[float_2s_ease-in-out_infinite]" />
              <div className="absolute bottom-4 left-[50%] w-1.5 h-1.5 bg-white/20 rounded-full animate-[float_2.5s_ease-in-out_infinite_0.5s]" />
              <div className="absolute bottom-1 left-[70%] w-1 h-1 bg-white/25 rounded-full animate-[float_1.8s_ease-in-out_infinite_0.3s]" />
            </div>
          )}
        </div>

        {/* Level markers */}
        <div className="absolute inset-y-0 right-2 flex flex-col justify-between py-2 text-xs text-muted-foreground">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Percentage display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-background/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            <span className="font-display text-3xl font-bold text-foreground">
              {Math.round(animatedPercent)}%
            </span>
            <p className="text-xs text-muted-foreground">Water Level</p>
          </div>
        </div>
      </div>

      {/* Valve Status */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className={`flex items-center gap-2 p-3 rounded-lg ${isValveOpen ? 'bg-warning/20' : 'bg-success/20'}`}>
          <Settings2 className={`w-4 h-4 ${isValveOpen ? 'text-warning' : 'text-success'}`} />
          <div>
            <p className="text-xs text-muted-foreground">Valve</p>
            <p className={`font-semibold text-sm ${isValveOpen ? 'text-warning' : 'text-success'}`}>
              {valveState}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
          <div className={`w-2 h-2 rounded-full ${valveMode === 'AUTO' ? 'bg-primary' : 'bg-warning'}`} />
          <div>
            <p className="text-xs text-muted-foreground">Mode</p>
            <p className="font-semibold text-sm text-foreground">{valveMode}</p>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-4 text-xs text-muted-foreground">
        Last Updated: {timestamp || 'N/A'}
      </div>
    </div>
  );
}