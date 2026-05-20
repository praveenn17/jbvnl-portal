import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Hash, CheckCircle2, XCircle, Briefcase, Building2 } from 'lucide-react';
import { RegisterData } from './types';
import OtpVerification from './OtpVerification';

// ── Password strength rules ────────────────────────────────────────────────────
interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'At least one uppercase letter (A–Z)', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'At least one lowercase letter (a–z)', test: (pw) => /[a-z]/.test(pw) },
  { label: 'At least one number (0–9)', test: (pw) => /[0-9]/.test(pw) },
  { label: 'At least one special character (!@#$…)', test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw) },
];

const COMMON_PASSWORDS = [
  'password', 'password1', 'password123', '12345678', '123456789',
  'admin123', 'admin@123', 'demo1234', 'demo@123', 'demo123',
  'qwerty123', 'letmein1', 'welcome1', 'jbvnl123', 'jbvnl@123',
];

const validatePasswordStrength = (pw: string): string | null => {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(pw)) return `Password must meet all requirements below.`;
  }
  if (COMMON_PASSWORDS.includes(pw.toLowerCase())) {
    return 'This password is too common. Please choose a stronger one.';
  }
  return null;
};

// ── Register Tab Component ─────────────────────────────────────────────────────
const RegisterTab: React.FC = () => {
  const { register, loading, otpPendingEmail, clearOtpPending } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [registerData, setRegisterData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    address: '',
    consumerNumber: '',
    employeeId: '',
    department: '',
  });

  // ── Client-side validation ─────────────────────────────────────────────────
  const validateForm = (): string | null => {
    const { name, email, password, confirmPassword, role, consumerNumber, address, employeeId, department, phone } = registerData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword || !role || !phone.trim()) {
      return 'Please fill in all required fields.';
    }

    if (role === 'consumer') {
      if (!consumerNumber?.trim()) return 'Consumer number is required for consumers.';
      if (!address?.trim()) return 'Address is required for consumers.';
    }

    if (role === 'manager') {
      if (!employeeId?.trim()) return 'Employee ID is required for managers.';
      if (!department?.trim()) return 'Department is required for managers.';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    const pwError = validatePasswordStrength(password);
    if (pwError) return pwError;
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await register({
        name: registerData.name.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password,
        role: registerData.role as 'consumer' | 'manager',
        phone: registerData.phone,
        address: registerData.role === 'consumer' ? registerData.address : undefined,
        consumerNumber: registerData.role === 'consumer' ? registerData.consumerNumber : undefined,
        employeeId: registerData.role === 'manager' ? registerData.employeeId : undefined,
        department: registerData.role === 'manager' ? registerData.department : undefined,
      });

      if (success) {
        setShowOtpVerification(true);
        toast({
          title: 'Verification Code Sent',
          description: `Check your inbox at ${registerData.email} for the 6-digit code.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleOtpSuccess = () => {
    setShowOtpVerification(false);
    setRegisterData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      phone: '',
      address: '',
      consumerNumber: '',
      employeeId: '',
      department: '',
    });
  };

  const handleBackFromOtp = () => {
    setShowOtpVerification(false);
    clearOtpPending();
  };

  if (showOtpVerification && otpPendingEmail) {
    return (
      <OtpVerification
        email={otpPendingEmail}
        onBack={handleBackFromOtp}
        onSuccess={handleOtpSuccess}
      />
    );
  }

  const password = registerData.password;

  return (
    <Card className="glass-effect bg-card/60 border-primary/20 shadow-xl shadow-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">Create Account</CardTitle>
        <CardDescription>
          Register for JBVNL services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="register-role">Register As</Label>
            <Select
              value={registerData.role}
              onValueChange={(value: string) => setRegisterData({ ...registerData, role: value as 'consumer' | 'manager' | '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-foreground border-border">
                <SelectItem value="consumer">Consumer</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                {/* Admin cannot self-register — use seedAdmin.js */}
              </SelectContent>
            </Select>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Password + Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
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
              {/* Password strength checklist */}
              {(passwordFocused || password.length > 0) && (
                <ul className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                        {passed
                          ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Match indicator */}
              {registerData.confirmPassword.length > 0 && (
                <p className={`text-xs flex items-center gap-1 mt-1 ${registerData.password === registerData.confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {registerData.password === registerData.confirmPassword
                    ? <><CheckCircle2 className="h-3.5 w-3.5" /> Passwords match</>
                    : <><XCircle className="h-3.5 w-3.5" /> Passwords do not match</>}
                </p>
              )}
            </div>
          </div>

          {/* Phone (Always visible) */}
          <div className="space-y-2">
            <Label htmlFor="register-phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-phone"
                type="tel"
                placeholder="Enter your phone number"
                className="pl-10"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Conditional Fields: Consumer */}
          {registerData.role === 'consumer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="register-consumer-number">Consumer Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-consumer-number"
                    type="text"
                    placeholder="Enter consumer number"
                    className="pl-10"
                    value={registerData.consumerNumber}
                    onChange={(e) => setRegisterData({ ...registerData, consumerNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-address"
                    type="text"
                    placeholder="Enter your address"
                    className="pl-10"
                    value={registerData.address}
                    onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {/* Conditional Fields: Manager */}
          {registerData.role === 'manager' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="register-employee-id">Employee ID</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-employee-id"
                    type="text"
                    placeholder="Enter employee ID"
                    className="pl-10"
                    value={registerData.employeeId}
                    onChange={(e) => setRegisterData({ ...registerData, employeeId: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-department">Department / Team</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select
                    value={registerData.department}
                    onValueChange={(value) => setRegisterData({ ...registerData, department: value })}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select department/team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical Team">Technical Team</SelectItem>
                      <SelectItem value="Billing Team">Billing Team</SelectItem>
                      <SelectItem value="Meter Department">Meter Department</SelectItem>
                      <SelectItem value="Field Inspection Team">Field Inspection Team</SelectItem>
                      <SelectItem value="Emergency Response Team">Emergency Response Team</SelectItem>
                      <SelectItem value="Connection Team">Connection Team</SelectItem>
                      <SelectItem value="Customer Support">Customer Support</SelectItem>
                      <SelectItem value="Admin Operations">Admin Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Sending Verification Code...' : 'Create Account & Send Code'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterTab;
