import { LayoutDashboard, FileText, Lock } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function Navigation() {
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', requiresAdmin: false },
    { to: '/logs', icon: FileText, label: 'Sensor Logs', requiresAdmin: true },
  ];

  // Filter nav items based on admin status - hide logs for guests
  const visibleItems = navItems.filter(item => !item.requiresAdmin || isAdmin);

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="glass-card px-2 py-2 flex items-center gap-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200
              ${isActive
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}