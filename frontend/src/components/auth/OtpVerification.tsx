
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, Info } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ email, onBack, onSuccess }) => {
  const { verifyOtp, register, loading } = useAuth();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await verifyOtp(email, otp);
      
      if (success) {
        // Check if it's an admin registration
        const tempUserData = localStorage.getItem('jbvnl_temp_reg_data');
        const isAdminSignup = tempUserData && JSON.parse(tempUserData).role === 'admin';
        
        if (isAdminSignup) {
          toast({
            title: "Request submitted!",
            description: "Your request is on hold. Manager approval required.",
          });
        } else {
          toast({
            title: "Registration Successful",
            description: "Your account has been created and is pending approval",
          });
        }
        onSuccess();
      }
    } catch (error: any) {
      console.error('Catching error in UI:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again",
        variant: "destructive",
      });
    }
  };

  const handleResendOtp = async () => {
    const tempRegData = localStorage.getItem('jbvnl_temp_reg_data');
    if (tempRegData) {
      const userData = JSON.parse(tempRegData);
      const success = await register(userData);
      if (success) {
        toast({
          title: "OTP Resent",
          description: `New OTP sent to ${email}`,
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-primary">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit verification code to<br />
          <span className="font-medium">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Full-Stack Mode</p>
              <p>Check the <strong>Browser Console</strong> (F12) or <strong>otp_debug.txt</strong> in project folder for your code.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              className="text-center text-lg tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-600" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>
          <Button
            variant="outline"
            onClick={handleResendOtp}
            className="text-primary hover:text-primary-600"
          >
            Resend Code
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Registration
        </Button>
      </CardContent>
    </Card>
  );
};

export default OtpVerification;
