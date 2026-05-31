import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SessionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only poll if user is authenticated
    if (!user) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const checkSessionStatus = async () => {
      const token = localStorage.getItem('jbvnl_token');
      if (!token) return;

      try {
        const response = await fetch('/api/auth/session-status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
          const data = await response.json();
          // Check for specific SESSION_TERMINATED code from our middleware
          if (data.code === 'SESSION_TERMINATED') {
            handleSessionTerminated(data.message);
          } else {
            // General expiration (like tokenVersion increment from password reset)
            handleSessionTerminated(data.message || 'Session expired. Please login again.');
          }
        }
      } catch (error) {
        // Silently fail network errors during polling (don't log out if offline temporarily)
        console.warn('Session poll failed:', error);
      }
    };

    const handleSessionTerminated = async (message: string) => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      // We must call the server to clear cookies/session if needed,
      // but in this case the server session is ALREADY invalid.
      // So we just clear local state.
      await logout();
      
      toast({
        title: 'Session Terminated',
        description: message,
        variant: 'destructive',
      });
      
      navigate('/');
    };

    // Run immediately once
    checkSessionStatus();

    // Then poll every 5 seconds (5000ms) as requested
    pollingIntervalRef.current = setInterval(checkSessionStatus, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [user, logout, toast, navigate]);

  return <>{children}</>;
};

export default SessionGuard;
