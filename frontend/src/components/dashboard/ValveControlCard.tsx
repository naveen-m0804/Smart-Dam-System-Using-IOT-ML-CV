import { Settings2, Power, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface ValveControlCardProps {
  state: 'OPEN' | 'CLOSED';
  mode: 'AUTO' | 'MANUAL';
  reason: string;
  timestamp: string;
  onModeChange: (mode: 'AUTO' | 'MANUAL') => void;
  onValveCommand: (command: 'OPEN' | 'CLOSE') => void;
  humanDetected: boolean;
}

export function ValveControlCard({ 
  state, 
  mode, 
  reason, 
  timestamp, 
  onModeChange, 
  onValveCommand,
  humanDetected 
}: ValveControlCardProps) {
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isOpen = state === 'OPEN';

  const handleModeToggle = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    await onModeChange(mode === 'AUTO' ? 'MANUAL' : 'AUTO');
    setIsLoading(false);
  };

  const handleValveCommand = async (command: 'OPEN' | 'CLOSE') => {
    if (!isAdmin || mode !== 'MANUAL' || humanDetected) return;
    setIsLoading(true);
    await onValveCommand(command);
    setIsLoading(false);
  };

  return (
    <div className={`glass-card p-6 ${isOpen ? 'shadow-[0_0_20px_hsl(38_92%_50%/0.3)]' : 'shadow-[0_0_20px_hsl(142_71%_45%/0.3)]'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOpen ? 'bg-warning/20' : 'bg-success/20'}`}>
            <Settings2 className={`w-6 h-6 ${isOpen ? 'text-warning' : 'text-success'}`} />
          </div>
          <h3 className="font-display text-lg font-semibold">Valve Control</h3>
        </div>
        <span className={`status-badge ${isOpen ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
          {state}
        </span>
      </div>

      {/* Valve Visualization */}
      <div className="flex items-center justify-center py-6">
        <div className="relative">
          <div className={`
            w-32 h-32 rounded-full flex items-center justify-center
            ${isOpen 
              ? 'bg-warning/20 border-4 border-warning' 
              : 'bg-success/20 border-4 border-success'}
            transition-all duration-500
          `}>
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${isOpen ? 'bg-warning' : 'bg-success'}
              transition-all duration-500
            `}>
              <Power className={`w-8 h-8 ${isOpen ? 'text-warning-foreground rotate-0' : 'text-success-foreground rotate-180'} transition-transform duration-500`} />
            </div>
          </div>
          
          {/* Flow indicator */}
          {isOpen && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-4 bg-water rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${mode === 'AUTO' ? 'text-primary' : 'text-muted-foreground'}`}>AUTO</span>
          <Switch 
            checked={mode === 'MANUAL'} 
            onCheckedChange={handleModeToggle}
            disabled={!isAdmin || isLoading}
          />
          <span className={`text-xs ${mode === 'MANUAL' ? 'text-primary' : 'text-muted-foreground'}`}>MANUAL</span>
        </div>
      </div>

      {/* Manual Control Buttons */}
      {mode === 'MANUAL' && isAdmin && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            variant="outline"
            className={`${!isOpen ? 'border-warning text-warning hover:bg-warning/20' : 'border-muted'}`}
            onClick={() => handleValveCommand('OPEN')}
            disabled={isLoading || humanDetected || isOpen}
          >
            Open Valve
          </Button>
          <Button
            variant="outline"
            className={`${isOpen ? 'border-success text-success hover:bg-success/20' : 'border-muted'}`}
            onClick={() => handleValveCommand('CLOSE')}
            disabled={isLoading || !isOpen}
          >
            Close Valve
          </Button>
        </div>
      )}

      {/* Human Detection Warning */}
      {humanDetected && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-destructive">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Valve locked - Human detected</span>
          </div>
        </div>
      )}

      {/* Non-admin notice */}
      {!isAdmin && (
        <div className="p-3 bg-secondary/50 border border-border rounded-lg mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Admin access required for control</span>
          </div>
        </div>
      )}

      {/* Reason */}
      <div className="text-center p-2 bg-secondary/30 rounded-lg">
        <p className="text-xs text-muted-foreground">Last Action: {reason}</p>
      </div>

      {/* Timestamp */}
      <div className="mt-4 text-xs text-muted-foreground">
        Last Updated: {timestamp || 'N/A'}
      </div>
    </div>
  );
}