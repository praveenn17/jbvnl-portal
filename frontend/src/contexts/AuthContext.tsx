import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: 'consumer' | 'manager';
    phone?: string;
    address?: string;
    consumerNumber?: string;
    employeeId?: string;
    department?: string;
  }) => Promise<boolean>;
  /** Verify OTP entered by the user against the server */
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  /** Resend OTP — enforces server-side cooldown */
  resendOtp: (email: string) => Promise<boolean>;
  /** Clear all OTP-pending state (called when user clicks "Back") */
  clearOtpPending: () => void;
  /** Manually refresh the list of pending users (for Admin Dashboard) */
  refreshPendingUsers: () => void;
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

    fetchPending();
    setLoading(false);
  }, []);

  const fetchPending = async (tokenOverride?: string, userRole?: string) => {
    const token = tokenOverride || localStorage.getItem('jbvnl_token');
    const role = userRole || user?.role || (() => {
      const saved = localStorage.getItem('jbvnl_user');
      return saved ? JSON.parse(saved).role : null;
    })();

    if (!token || (role !== 'admin' && role !== 'manager')) return;

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

  // ── Login ──────────────────────────────────────────────────────────────────
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
        throw new Error(data.message || 'Login failed');
      }

      const loggedUser: User = {
        id: data._id,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status,
        consumerNumber: data.consumerNumber,
        phone: data.phone,
        address: data.address,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      // Store preferences separately so they're accessible via (user as any).preferences
      const userWithPrefs = { ...loggedUser, preferences: data.preferences } as any;

      setUser(userWithPrefs);
      localStorage.setItem('jbvnl_user', JSON.stringify(userWithPrefs));
      localStorage.setItem('jbvnl_token', data.token);

      if (loggedUser.role === 'admin' || loggedUser.role === 'manager') {
        fetchPending(data.token, loggedUser.role);
      }

      return true;
    } catch (error) {
      throw error; // Re-throw so LoginTab can display the real message
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('jbvnl_token');
    if (!token) return;
    try {
      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user, ...data } as User;
        setUser(updatedUser);
        localStorage.setItem('jbvnl_user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  // ── Register (Step 1: send OTP) ────────────────────────────────────────────
  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'consumer' | 'manager';
    phone?: string;
    address?: string;
    consumerNumber?: string;
    employeeId?: string;
    department?: string;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      // Send OTP — backend checks if email is already registered
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      // If backend returned devOtp (dev mode), log it prominently so user can see it
      if (data.devOtp) {
        console.warn('');
        console.warn('%c╔══════════════════════════════════════╗', 'color: #f59e0b; font-weight: bold');
        console.warn('%c║  [DEV] YOUR OTP CODE IS BELOW:       ║', 'color: #f59e0b; font-weight: bold');
        console.warn(`%c║  OTP: ${data.devOtp}  (or use 111000)      ║`, 'color: #10b981; font-size: 16px; font-weight: bold');
        console.warn('%c╚══════════════════════════════════════╝', 'color: #f59e0b; font-weight: bold');
        console.warn('');
        // Also alert in console.table for easy copying
        console.table({ 'Your OTP': data.devOtp, 'Bypass OTP': '111000' });
      }

      // Store registration data temporarily so verifyOtp can submit it
      localStorage.setItem('jbvnl_temp_reg_data', JSON.stringify(userData));
      setOtpPendingEmail(userData.email);
      return true;
    } catch (error) {
      console.error('Registration/OTP error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ── Clear OTP pending state ────────────────────────────────────────────────
  const clearOtpPending = () => {
    localStorage.removeItem('jbvnl_temp_reg_data');
    setOtpPendingEmail(null);
  };

  // ── Verify OTP (Step 2: verify then register) ──────────────────────────────
  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    setLoading(true);
    try {
      // 1. Verify OTP with backend (now uses /verify-email endpoint)
      const otpResponse = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: otp.trim() }),
      });

      if (!otpResponse.ok) {
        const errorData = await otpResponse.json();
        throw new Error(errorData.message || 'OTP verification failed');
      }

      // 2. OTP verified — submit the full registration
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

      // If current logged-in user is admin, refresh pending users so the new
      // manager request appears in the admin approval panel immediately.
      const currentToken = localStorage.getItem('jbvnl_token');
      const savedUser = localStorage.getItem('jbvnl_user');
      const currentRole = savedUser ? JSON.parse(savedUser).role : null;
      if (currentToken && currentRole === 'admin') {
        fetchPending(currentToken, 'admin');
      }

      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ── Refresh pending users (callable from Admin Dashboard) ──────────────────
  const refreshPendingUsers = () => {
    const token = localStorage.getItem('jbvnl_token');
    fetchPending(token || undefined);
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const resendOtp = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }

      return true;
    } catch (error) {
      console.error('Resend OTP error:', error);
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
    refreshUser,
    register,
    verifyOtp,
    resendOtp,
    clearOtpPending,
    refreshPendingUsers,
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
