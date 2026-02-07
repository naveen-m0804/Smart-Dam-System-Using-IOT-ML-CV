import { Activity, LogIn, LogOut, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { LoginModal } from './LoginModal';

export function Header() {
  const { isLoggedIn, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 rounded-none">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-water flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-gradient">SMART DAM</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Automation System</p>
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Admin</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Guest</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowLogin(true)}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
