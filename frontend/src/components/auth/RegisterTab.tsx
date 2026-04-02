import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Hash } from 'lucide-react';
import { RegisterData } from './types';
import OtpVerification from './OtpVerification';

const RegisterTab: React.FC = () => {
  const { register, loading, otpPendingEmail } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  
  const [registerData, setRegisterData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    address: '',
    consumerNumber: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword || !registerData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }



    const success = await register({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      role: registerData.role as 'consumer' | 'admin' | 'manager',
      phone: registerData.phone,
      address: registerData.address,
      consumerNumber: registerData.consumerNumber,
    });
    
    if (success) {
      setShowOtpVerification(true);
      if (registerData.role === 'admin') {
        toast({
          title: "Registration submitted!",
          description: "Please check your email for the OTP to verify your account.",
        });
      } else {
        toast({
          title: "OTP Sent",
          description: "Please check your email for verification code",
        });
      }
    } else {
      toast({
        title: "Registration Failed",
        description: "Please try again later",
        variant: "destructive",
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
    });
  };

  const handleBackFromOtp = () => {
    setShowOtpVerification(false);
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
          <div className="space-y-2">
            <Label htmlFor="register-role">Register As</Label>
            <Select 
              value={registerData.role} 
              onValueChange={(value: string) => setRegisterData({ ...registerData, role: value as 'consumer' | 'admin' | 'manager' | '' })}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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

            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                />
              </div>
            </div>

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

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-600" 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterTab;
