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
  // BUG #8 FIX: Dedicated resend function that only re-sends OTP without
  // touching localStorage or re-running the full registration flow.
  resendOtp: (email: string) => Promise<boolean>;
  // BUG #2 FIX: Exposed so RegisterTab can clear pending state on back.
  clearOtpPending: () => void;
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
    const savedUser = localStorage.getItem('jbvnl_user');
    const savedSubmissions = localStorage.getItem('jbvnl_quick_submissions');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedSubmissions) {
      setQuickLinkSubmissions(JSON.parse(savedSubmissions));
    }

    // BUG #5 FIX: Only fetch pending users if the logged-in user is admin or
    // manager. Calling this endpoint for consumers always returned 401.
    const fetchPending = async () => {
      const token = localStorage.getItem('jbvnl_token');
      const savedUserRaw = localStorage.getItem('jbvnl_user');
      if (!token || !savedUserRaw) return;

      const savedUserParsed = JSON.parse(savedUserRaw);
      if (savedUserParsed.role !== 'admin' && savedUserParsed.role !== 'manager') return;

      try {
        const response = await fetch('/api/auth/users/pending', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPendingUsers(
            data.map((u: any) => ({
              id: u._id,
              email: u.email,
              name: u.name,
              role: u.role,
              status: u.status,
              createdAt: u.createdAt,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch pending users:', error);
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
        // BUG #4 FIX: Always throw the backend error message so the LoginTab
        // can display it properly. Previously only 2 specific strings were
        // re-thrown and all other messages (e.g. role mismatch) were swallowed.
        throw new Error(data.message || 'Login failed');
      }

      const loggedUser: User = {
        id: data._id,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status,
        // BUG #7 FIX: Use real createdAt from backend, not login timestamp.
        createdAt: data.createdAt || new Date().toISOString(),
      };

      setUser(loggedUser);
      localStorage.setItem('jbvnl_user', JSON.stringify(loggedUser));
      localStorage.setItem('jbvnl_token', data.token);
      return true;
    } catch (error) {
      // BUG #4 FIX: Always re-throw so the LoginTab catch block can display
      // the real backend message in the toast.
      throw error;
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
      // Send OTP first — backend also checks if email already exists here
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Surface the real backend message (e.g. "email already exists")
        throw new Error(data.message || 'Failed to send OTP');
      }

      // Store registration data temporarily — consumed by verifyOtp()
      localStorage.setItem('jbvnl_temp_reg_data', JSON.stringify(userData));
      setOtpPendingEmail(userData.email);
      return true;
    } catch (error) {
      console.error('Registration/OTP error:', error);
      throw error; // Re-throw so RegisterTab can show the real message
    } finally {
      setLoading(false);
    }
  };

  // BUG #2 FIX: clearOtpPending cleans up ALL OTP-related state when the
  // user clicks "Back" from the OTP screen. Previously handleBackFromOtp only
  // hid the UI but left stale data in localStorage and context state, causing
  // the old email's data to be submitted on the next attempt.
  const clearOtpPending = () => {
    localStorage.removeItem('jbvnl_temp_reg_data');
    setOtpPendingEmail(null);
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    setLoading(true);
    try {
      // 1. Verify OTP with backend
      const otpResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: otp.trim() }),
      });

      if (!otpResponse.ok) {
        const errorData = await otpResponse.json();
        throw new Error(errorData.message || 'OTP verification failed');
      }

      // 2. OTP verified — proceed with final registration
      const tempRegData = localStorage.getItem('jbvnl_temp_reg_data');
      if (!tempRegData) {
        throw new Error('Registration data missing. Please start over.');
      }

      const userData = JSON.parse(tempRegData);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const regData = await response.json();

      if (!response.ok) {
        throw new Error(regData.message || 'Registration failed after OTP verification');
      }

      // Clean up temp state
      localStorage.removeItem('jbvnl_temp_reg_data');
      setOtpPendingEmail(null);
      return true;
    } catch (error) {
      // Re-throw so OtpVerification component can show the message
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // BUG #8 FIX: Dedicated resendOtp — only sends OTP, does NOT overwrite
  // localStorage or re-run the full registration flow.
  const resendOtp = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      return true;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
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

  const updateUserStatus = async (userId: string, status: 'approved' | 'rejected' | 'hold') => {
    const token = localStorage.getItem('jbvnl_token');
    try {
      const response = await fetch(`/api/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
    resendOtp,
    clearOtpPending,
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
