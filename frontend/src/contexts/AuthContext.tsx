
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: { 
    name: string;
    email: string;
    password: string;
    role: 'consumer' | 'admin' | 'manager';
    phone?: string;
    address?: string;
    consumerNumber?: string;
  }) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
  pendingUsers: User[];
  quickLinkSubmissions: Record<string, unknown>[];
  addQuickLinkSubmission: (data: Record<string, unknown>) => void;
  updateUserStatus: (userId: string, status: 'approved' | 'rejected' | 'hold') => void;
  otpPendingEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [quickLinkSubmissions, setQuickLinkSubmissions] = useState<Record<string, unknown>[]>([]);
  const [otpPendingEmail, setOtpPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('jbvnl_user');
    const savedSubmissions = localStorage.getItem('jbvnl_quick_submissions');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedSubmissions) {
      setQuickLinkSubmissions(JSON.parse(savedSubmissions));
    }
    
    // Fetch pending users if user is manager or admin
    const fetchPending = async () => {
      const token = localStorage.getItem('jbvnl_token');
      if (token) {
        try {
          const response = await fetch('/api/auth/users/pending', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setPendingUsers(data.map((u: any) => ({
              id: u._id,
              email: u.email,
              name: u.name,
              role: u.role,
              status: u.status,
              createdAt: u.createdAt
            })));
          }
        } catch (error) {
          console.error('Failed to fetch pending users:', error);
        }
      }
    };

    fetchPending();
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw the specific backend message if available
        throw new Error(data.message || 'Login failed');
      }
      
      const loggedUser: User = {
        id: data._id,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status,
        createdAt: new Date().toISOString(), // This should ideally come from backend
      };
      
      setUser(loggedUser);
      localStorage.setItem('jbvnl_user', JSON.stringify(loggedUser));
      localStorage.setItem('jbvnl_token', data.token);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof Error && (error.message === 'access_denied' || error.message === 'admin_not_approved')) {
        throw error;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { 
    name: string;
    email: string;
    password: string;
    role: 'consumer' | 'admin' | 'manager';
    phone?: string;
    address?: string;
    consumerNumber?: string;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Attempting to register and send OTP to:', userData.email);
      // 1. Send OTP to backend first
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email }),
      });

      console.log('OTP Response status:', response.status);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('OTP sending failed:', data);
        return false;
      }

      if (data.debugOtp) {
        console.log('%c-----------------------------------------', 'color: green; font-weight: bold');
        console.log(`%cDEBUG OTP RECEIVED: ${data.debugOtp}`, 'color: green; font-weight: bold; font-size: 14px');
        console.log('%c-----------------------------------------', 'color: green; font-weight: bold');
      }

      // 2. Store registration data temporarily
      localStorage.setItem('jbvnl_temp_reg_data', JSON.stringify(userData));
      setOtpPendingEmail(userData.email);
      console.log('OTP sent and UI state updated');
      return true;
    } catch (error) {
      console.error('Registration/OTP error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    setLoading(true);
    console.log(`Verifying OTP for ${email}: ${otp}`);
    try {
      // 1. Verify OTP with backend
      const otpResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: otp.trim() }),
      });

      if (!otpResponse.ok) {
        const errorData = await otpResponse.json();
        console.error('%c[OTP ERROR]', 'color: red; font-weight: bold', {
          status: otpResponse.status,
          message: errorData.message
        });
        return false;
      }

      console.log('%c[OTP SUCCESS]', 'color: green; font-weight: bold', 'Bypass or Real OTP accepted');

      // 2. If OTP is valid, proceed with registration
      const tempRegData = localStorage.getItem('jbvnl_temp_reg_data');
      if (tempRegData) {
        const userData = JSON.parse(tempRegData);
        
        console.log('OTP verified, proceeding to final registration for:', userData.email);
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        const regData = await response.json();

        if (!response.ok) {
          console.error('Final registration failed:', regData);
          // Throw a specific error so the UI can show a better message
          throw new Error(regData.message || 'Registration failed after OTP verification');
        }

        console.log('Registration successful!');
        localStorage.removeItem('jbvnl_temp_reg_data');
        setOtpPendingEmail(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('OTP verification or Registration process failed:', error);
      // Re-throw the error so the component can catch the message
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addQuickLinkSubmission = (data: Record<string, unknown>) => {
    const submission = {
      id: Date.now().toString(),
      ...data,
      submittedAt: new Date().toISOString(),
    };
    
    const updatedSubmissions = [...quickLinkSubmissions, submission];
    setQuickLinkSubmissions(updatedSubmissions);
    localStorage.setItem('jbvnl_quick_submissions', JSON.stringify(updatedSubmissions));
  };

  // Note: These would also need to be moved to the backend in Phase 4
  const updateUserStatus = async (userId: string, status: 'approved' | 'rejected' | 'hold') => {
    const token = localStorage.getItem('jbvnl_token');
    try {
      const response = await fetch(`/api/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jbvnl_user');
    localStorage.removeItem('jbvnl_token');
  };

  const value = {
    user,
    login,
    logout,
    register,
    verifyOtp,
    isAuthenticated: !!user,
    loading,
    pendingUsers,
    quickLinkSubmissions,
    addQuickLinkSubmission,
    updateUserStatus,
    otpPendingEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
