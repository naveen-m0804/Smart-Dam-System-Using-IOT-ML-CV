import { CloudRain } from 'lucide-react';

interface RainfallCardProps {
  percent: number;
  rainLabel: string;
  timestamp: string;
}

export function RainfallCard({ percent, rainLabel, timestamp }: RainfallCardProps) {
  const getStatus = () => {
    if (percent > 75) return 'critical';
    if (percent > 50) return 'warning';
    if (percent > 25) return 'primary';
    return 'safe';
  };

  const status = getStatus();

  const statusStyles = {
    critical: {
      glow: 'shadow-[0_0_20px_hsl(0_72%_51%/0.3)]',
      bg: 'bg-destructive/20',
      text: 'text-destructive',
      badge: 'bg-destructive/20 text-destructive',
      bar: 'bg-gradient-to-r from-destructive/80 to-destructive',
    },
    warning: {
      glow: 'shadow-[0_0_20px_hsl(38_92%_50%/0.3)]',
      bg: 'bg-warning/20',
      text: 'text-warning',
      badge: 'bg-warning/20 text-warning',
      bar: 'bg-gradient-to-r from-warning/80 to-warning',
    },
    primary: {
      glow: 'shadow-[0_0_20px_hsl(187_85%_53%/0.3)]',
      bg: 'bg-primary/20',
      text: 'text-primary',
      badge: 'bg-primary/20 text-primary',
      bar: 'bg-gradient-to-r from-primary/80 to-primary',
    },
    safe: {
      glow: 'shadow-[0_0_20px_hsl(142_71%_45%/0.3)]',
      bg: 'bg-success/20',
      text: 'text-success',
      badge: 'bg-success/20 text-success',
      bar: 'bg-gradient-to-r from-success/80 to-success',
    },
  };

  const styles = statusStyles[status];

  return (
    <div className={`glass-card p-6 ${styles.glow}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${styles.bg}`}>
            <CloudRain className={`w-6 h-6 ${styles.text}`} />
          </div>
          <h3 className="font-display text-lg font-semibold">Rainfall Prediction</h3>
        </div>
        <span className={`status-badge ${styles.badge}`}>
          {rainLabel}
        </span>
      </div>

      {/* Percentage Display */}
      <div className="text-center mb-6">
        <span className="font-display text-5xl font-bold text-gradient">
          {Math.round(percent)}%
        </span>
        <p className="text-sm text-muted-foreground mt-1">Probability</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-4 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full ${styles.bar} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>

      {/* Rain drops animation for high probability */}
      {percent > 50 && (
        <div className="absolute top-0 right-0 w-20 h-20 opacity-30 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-3 bg-primary rounded-full animate-pulse"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 text-xs text-muted-foreground">
        Last Updated: {timestamp || 'N/A'}
      </div>
    </div>
  );
}