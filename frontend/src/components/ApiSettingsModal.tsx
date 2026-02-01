import { useState, useEffect } from 'react';
import { Settings, Check, X, Loader2 } from 'lucide-react';
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

const API_URL_KEY = 'dam_api_url';
const DEFAULT_API_URL = 'https://smart-dam-project-backend.onrender.com';

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  return localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL;
}

export function setApiBaseUrl(url: string): void {
  localStorage.setItem(API_URL_KEY, url);
  // Dispatch event so other components know the URL changed
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

  useEffect(() => {
    setUrl(getApiBaseUrl());
  }, [open]);

  const testConnection = async () => {
    setTestStatus('testing');
    setErrorMessage('');
    
    try {
      const response = await fetch(`${url}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok') {
          setTestStatus('success');
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
          <div className="space-y-2">
            <Label htmlFor="api-url">Backend API URL</Label>
            <Input
              id="api-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTestStatus('idle');
              }}
              placeholder="https://smart-dam-project-backend.onrender.com"
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
                <span className="text-sm">Connected!</span>
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
                'https://smart-dam-project-backend.onrender.com',
                'http://localhost:5000',
                'http://127.0.0.1:5000',
              ].map((preset) => (
                <Button
                  key={preset}
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setUrl(preset);
                    setTestStatus('idle');
                  }}
                >
                  {preset.replace('http://', '')}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save & Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}