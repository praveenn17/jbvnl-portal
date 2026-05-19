
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import NotificationDropdown from './NotificationDropdown';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border shadow-lg shadow-black/10 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src="/lovable-uploads/c59983aa-c865-4c97-85ff-9de45f1f7d68.png"
                alt="JBVNL Logo"
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">JBVNL Portal</h1>
                <p className="text-xs text-muted-foreground">Jharkhand Bijli Vitran Nigam Limited</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {user && (
              <>
                <NotificationDropdown />

                <div className="flex items-center space-x-2 text-sm">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{user.name}</span>
                  <span className="px-2.5 py-1 bg-primary/15 text-primary text-xs rounded-full font-semibold capitalize border border-primary/25">
                    {user.role}
                  </span>
                </div>

                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Settings className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={logout} title="Logout" className="text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
