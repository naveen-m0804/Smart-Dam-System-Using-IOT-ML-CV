import { UserX, ShieldAlert, ShieldCheck } from 'lucide-react';

interface HumanDetectionCardProps {
  humanDetected: boolean;
  confidence: number;
  lastAlertTimestamp: string;
  timestamp: string;
  valveState?: 'OPEN' | 'CLOSED';
}

// Helper to format alert timestamp into date and time parts
function formatAlertTime(timestamp: string): { date: string; time: string } | null {
  if (!timestamp || timestamp === 'None') return null;
  
  // Expected format: "01 Feb 2026, 07:59 AM IST"
  const parts = timestamp.split(', ');
  if (parts.length >= 2) {
    return {
      date: parts[0], // "01 Feb 2026"
      time: parts.slice(1).join(', ') // "07:59 AM IST"
    };
  }
  return { date: timestamp, time: '' };
}

export function HumanDetectionCard({ 
  humanDetected, 
  confidence, 
  lastAlertTimestamp, 
  timestamp,
  valveState = 'CLOSED'
}: HumanDetectionCardProps) {
  // Danger state: human detected (especially critical if valve is open)
  const isDanger = humanDetected === true;
  const isCritical = humanDetected === true && valveState === 'OPEN';

  // Format confidence - handle both 0-1 and 0-100 ranges
  const confidencePercent = confidence > 1 ? confidence : confidence * 100;
  const hasConfidence = confidence > 0;

  // Format last alert timestamp
  const alertTime = formatAlertTime(lastAlertTimestamp);

  return (
    <div className={`glass-card p-6 relative overflow-hidden transition-all duration-300 ${
      isCritical 
        ? 'shadow-[0_0_30px_hsl(0_72%_51%/0.6)] border-2 border-destructive bg-destructive/10' 
        : isDanger 
          ? 'shadow-[0_0_25px_hsl(0_72%_51%/0.4)] border-destructive/50 bg-destructive/5' 
          : 'shadow-[0_0_20px_hsl(142_71%_45%/0.3)]'
    }`}>
      {/* Alert Flash Overlay */}
      {isDanger && (
        <div className={`absolute inset-0 ${isCritical ? 'bg-destructive/25' : 'bg-destructive/15'} animate-pulse pointer-events-none`} />
      )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDanger ? 'bg-destructive/30' : 'bg-success/20'}`}>
            {isDanger ? (
              <ShieldAlert className="w-6 h-6 text-destructive" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-success" />
            )}
          </div>
          <h3 className="font-display text-lg font-semibold">Human Detection</h3>
        </div>
        <span className={`status-badge ${isDanger ? 'bg-destructive/30 text-destructive font-bold' : 'bg-success/20 text-success'}`}>
          {isCritical ? 'CRITICAL' : isDanger ? 'DANGER' : 'CLEAR'}
        </span>
      </div>

      {/* Detection Status */}
      <div className="flex items-center justify-center py-6 relative z-10">
        <div className="relative">
          {/* Warning rings when human detected */}
          {isDanger && (
            <>
              <div className="absolute -inset-4 rounded-full border-2 border-destructive/50 animate-ping" />
              <div className="absolute -inset-8 rounded-full border border-destructive/30 animate-ping" style={{ animationDelay: '300ms' }} />
            </>
          )}
          
          <div className={`
            w-28 h-28 rounded-full flex items-center justify-center
            ${isDanger 
              ? 'bg-destructive/30 border-4 border-destructive' 
              : 'bg-success/20 border-4 border-success'}
            transition-all duration-300
          `}>
            {isDanger ? (
              <UserX className="w-14 h-14 text-destructive animate-pulse" />
            ) : (
              <ShieldCheck className="w-14 h-14 text-success" />
            )}
          </div>
        </div>
      </div>

      {/* Status Info */}
      <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
        <div className={`text-center p-3 rounded-lg ${isDanger ? 'bg-destructive/20' : 'bg-secondary/50'}`}>
          <p className="text-xs text-muted-foreground">Status</p>
          <p className={`font-display font-bold text-sm ${isDanger ? 'text-destructive' : 'text-success'}`}>
            {isDanger ? 'DANGER' : 'SAFE'}
          </p>
        </div>
        <div className={`text-center p-3 rounded-lg ${isDanger ? 'bg-destructive/20' : 'bg-secondary/50'}`}>
          <p className="text-xs text-muted-foreground">Confidence</p>
          <p className={`font-display font-bold ${isDanger ? 'text-destructive' : 'text-foreground'}`}>
            {hasConfidence ? `${confidencePercent.toFixed(0)}%` : 'N/A'}
          </p>
        </div>
        <div className={`text-center p-3 rounded-lg ${isDanger ? 'bg-destructive/20' : 'bg-secondary/50'}`}>
          <p className="text-xs text-muted-foreground mb-1">Last Alert</p>
          {alertTime ? (
            <div className="font-display font-bold text-foreground">
              <p className="text-xs leading-tight">{alertTime.date}</p>
              <p className="text-xs leading-tight text-muted-foreground">{alertTime.time}</p>
            </div>
          ) : (
            <p className="font-display text-xs font-bold text-muted-foreground">None</p>
          )}
        </div>
      </div>

      {/* Safety Message */}
      {isDanger && (
        <div className={`mt-4 p-3 ${isCritical ? 'bg-destructive/30 border-destructive' : 'bg-destructive/20 border-destructive/50'} border rounded-lg relative z-10`}>
          <p className="text-sm text-destructive font-bold text-center">
            {isCritical 
              ? '🚨 CRITICAL: Human detected near open valve!'
              : '⚠️ Human detected - Valve operations blocked'}
          </p>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 text-xs text-muted-foreground relative z-10">
        Last Updated: {timestamp || 'N/A'}
      </div>
    </div>
  );
}