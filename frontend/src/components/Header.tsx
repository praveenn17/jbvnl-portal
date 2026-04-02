
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Settings, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src="/lovable-uploads/c59983aa-c865-4c97-85ff-9de45f1f7d68.png"
                alt="JBVNL Logo"
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">JBVNL Portal</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Jharkhand Bijli Vitran Nigam Limited</p>
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
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600" />
              )}
            </Button>

            {user && (
              <>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>

                <div className="flex items-center space-x-2 text-sm">
                  <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{user.name}</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium capitalize">
                    {user.role}
                  </span>
                </div>

                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={logout} title="Logout">
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
