import { useState, useEffect } from 'react';
import { Settings, Check, X, Loader2, Wifi, WifiOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_URL_KEY = 'dam_api_url_v2';
const ENV_API_URL = import.meta.env.VITE_API_URL as string | undefined;
const RENDER_API_URL = 'https://smart-dam-system-using-iot-ml-cv.onrender.com';

function detectDefaultApiUrl(): string {
  if (ENV_API_URL) return ENV_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return 'http://localhost:5000';
    }
  }
  return RENDER_API_URL;
}

const DEFAULT_API_URL = detectDefaultApiUrl();

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  return localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL;
}

export function setApiBaseUrl(url: string): void {
  localStorage.setItem(API_URL_KEY, url);
  window.dispatchEvent(new CustomEvent('api-url-changed', { detail: url }));
}

interface ApiSettingsModalProps {
  onUrlChange?: () => void;
}

export function ApiSettingsModal({ onUrlChange }: ApiSettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(getApiBaseUrl());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [serverEnv, setServerEnv] = useState<string>('');

  useEffect(() => {
    setUrl(getApiBaseUrl());
  }, [open]);

  const testConnection = async () => {
    setTestStatus('testing');
    setErrorMessage('');
    setServerEnv('');
    
    try {
      const response = await fetch(`${url}/api/ping`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok') {
          setTestStatus('success');
          setServerEnv(data.environment || 'unknown');
        } else {
          setTestStatus('error');
          setErrorMessage('Unexpected response from server');
        }
      } else {
        setTestStatus('error');
        setErrorMessage(`HTTP ${response.status}`);
      }
    } catch (err) {
      setTestStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const handleSave = () => {
    setApiBaseUrl(url);
    setOpen(false);
    onUrlChange?.();
  };

  const handleReset = () => {
    localStorage.removeItem(API_URL_KEY);
    setUrl(detectDefaultApiUrl());
    setTestStatus('idle');
    setServerEnv('');
  };

  const isLocal = url.includes('localhost') || url.includes('127.0.0.1');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">API Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Current Environment Indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            isLocal 
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
          }`}>
            {isLocal ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span>Mode: {isLocal ? 'Local (localhost)' : 'Cloud (Render)'}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-url">Backend API URL</Label>
            <Input
              id="api-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTestStatus('idle');
                setServerEnv('');
              }}
              placeholder="https://smart-dam-system-using-iot-ml-cv.onrender.com"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL where your Flask backend is running
            </p>
          </div>

          {/* Connection Test */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={testStatus === 'testing'}
            >
              {testStatus === 'testing' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Test Connection
            </Button>
            
            {testStatus === 'success' && (
              <div className="flex items-center gap-2 text-success">
                <Check className="w-4 h-4" />
                <span className="text-sm">Connected! ({serverEnv})</span>
              </div>
            )}
            
            {testStatus === 'error' && (
              <div className="flex items-center gap-2 text-destructive">
                <X className="w-4 h-4" />
                <span className="text-sm">{errorMessage || 'Failed'}</span>
              </div>
            )}
          </div>

          {/* Common URLs */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick presets:</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '☁️ Render (Cloud)', url: RENDER_API_URL },
                { label: '🏠 localhost:5000', url: 'http://localhost:5000' },
                { label: '🏠 127.0.0.1:5000', url: 'http://127.0.0.1:5000' },
              ].map((preset) => (
                <Button
                  key={preset.url}
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setUrl(preset.url);
                    setTestStatus('idle');
                    setServerEnv('');
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
            Reset to Auto
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save & Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
