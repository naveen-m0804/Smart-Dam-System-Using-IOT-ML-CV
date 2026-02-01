import { Radio } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VibrationCardProps {
  isVibrating: boolean;
  lastAlertTimestamp: string;
  timestamp: string;
}

export function VibrationCard({ isVibrating, lastAlertTimestamp, timestamp }: VibrationCardProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isVibrating) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVibrating]);

  return (
    <div className={`glass-card p-6 ${isVibrating ? 'shadow-[0_0_20px_hsl(0_72%_51%/0.3)]' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isVibrating ? 'bg-destructive/20' : 'bg-success/20'}`}>
            <Radio className={`w-6 h-6 ${isVibrating ? 'text-destructive' : 'text-success'}`} />
          </div>
          <h3 className="font-display text-lg font-semibold">Vibration Alert</h3>
        </div>
        <span className={`status-badge ${isVibrating ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'}`}>
          {isVibrating ? 'DETECTED' : 'NORMAL'}
        </span>
      </div>

      {/* Status Visualization */}
      <div className="flex items-center justify-center py-6">
        <div className="relative">
          {/* Pulsing rings for vibration */}
          {isVibrating && (
            <>
              <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-destructive/30 animate-ping" style={{ animationDelay: '150ms' }} />
            </>
          )}
          
          <div className={`
            w-24 h-24 rounded-full flex items-center justify-center
            ${isVibrating 
              ? 'bg-destructive/20 border-2 border-destructive animate-pulse' 
              : 'bg-success/20 border-2 border-success'}
          `}>
            <Radio 
              className={`w-10 h-10 ${isVibrating ? 'text-destructive' : 'text-success'} ${pulse ? 'animate-bounce' : ''}`} 
            />
          </div>
        </div>
      </div>

      {/* Status Info */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-center p-3 bg-secondary/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className={`font-display font-bold ${isVibrating ? 'text-destructive' : 'text-success'}`}>
            {isVibrating ? 'ACTIVE' : 'STABLE'}
          </p>
        </div>
        <div className="text-center p-3 bg-secondary/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Last Alert</p>
          <p className="font-display text-xs font-bold text-foreground">
            {lastAlertTimestamp || 'None'}
          </p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-4 text-xs text-muted-foreground">
        Last Updated: {timestamp || 'N/A'}
      </div>
    </div>
  );
}