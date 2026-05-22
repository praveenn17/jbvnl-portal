import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { LoginData } from './types';

interface LoginTabProps {
  onSuccess: () => void;
}

const LoginTab: React.FC<LoginTabProps> = ({ onSuccess }) => {
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotVerifiedMsg, setEmailNotVerifiedMsg] = useState<string | null>(null);

  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
    role: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailNotVerifiedMsg(null);

    if (!loginData.email || !loginData.password || !loginData.role) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const normalizedEmail = loginData.email.toLowerCase().trim();

    try {
      const success = await login(normalizedEmail, loginData.password, loginData.role);

      if (success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to JBVNL Portal',
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error('Login error:', error);

      const msg: string = error.message || 'Invalid credentials or unauthorized access.';
      let errorTitle = 'Login Failed';
      let errorDesc = msg;

      // Special handling for unverified email — show inline banner too
      if (msg.toLowerCase().includes('verify your email') || msg.includes('EMAIL_NOT_VERIFIED')) {
        errorTitle = 'Email Not Verified';
        errorDesc = 'Please verify your email before logging in. Check your inbox for the verification code.';
        setEmailNotVerifiedMsg(errorDesc);
      } else if (msg.toLowerCase().includes('pending')) {
        errorTitle = 'Account Pending';
      } else if (msg.toLowerCase().includes('invalid email') || msg.toLowerCase().includes('invalid email, password, or role')) {
        errorTitle = 'Login Failed';
        errorDesc = msg; // Will be the generic message from the backend
      }

      toast({
        title: errorTitle,
        description: errorDesc,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="glass-effect bg-card/60 border-primary/20 shadow-xl shadow-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">Login to JBVNL</CardTitle>
        <CardDescription>
          Access your electricity services portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Not Verified inline banner */}
          {emailNotVerifiedMsg && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{emailNotVerifiedMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="login-role">Login As</Label>
            <Select
              value={loginData.role}
              onValueChange={(value: 'consumer' | 'admin' | 'manager') => {
                setEmailNotVerifiedMsg(null);
                setLoginData({ ...loginData, role: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-foreground border-border">
                <SelectItem value="consumer">Consumer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                value={loginData.email}
                onChange={(e) => {
                  setEmailNotVerifiedMsg(null);
                  setLoginData({ ...loginData, email: e.target.value });
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginTab;
