import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, RefreshCw, ShieldCheck, Clock } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ email, onBack, onSuccess }) => {
  const { verifyOtp, resendOtp, loading } = useAuth();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0); // seconds remaining
  const [resendDisabled, setResendDisabled] = useState(false);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await verifyOtp(email, otp);

      if (success) {
        const tempUserData = localStorage.getItem('jbvnl_temp_reg_data');
        const role = tempUserData ? JSON.parse(tempUserData).role : '';

        if (role === 'manager') {
          toast({
            title: 'Registration Submitted!',
            description:
              'Your manager account is pending admin approval. You will be able to login once approved.',
          });
        } else {
          toast({
            title: 'Email Verified!',
            description: 'Your account is active. You can now login.',
          });
        }
        onSuccess();
      }
    } catch (error: any) {
      console.error('OTP verify error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    try {
      await resendOtp(email);
      // Start 60-second cooldown
      setResendCooldown(60);
      setResendDisabled(true);
      toast({
        title: 'Code Resent',
        description: 'A new verification code has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        title: 'Resend Failed',
        description: error.message || 'Could not resend code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="glass-effect bg-card/60 border-primary/20 shadow-xl shadow-primary/10">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-primary drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
          Verify Your Email
        </CardTitle>
        <CardDescription>
          We've sent a 6-digit verification code to
          <br />
          <span className="font-semibold text-foreground">{email}</span>
          <br />
          <span className="text-xs text-muted-foreground mt-1 inline-block">
            Check your inbox (and spam folder). The code expires in 10 minutes.
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Info Banner ── */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium">Check your email</p>
            <p className="text-xs mt-0.5 text-blue-700 dark:text-blue-400">
              Enter the 6-digit code sent to <strong>{email}</strong>. If you don't see it, check your spam folder.
            </p>
          </div>
        </div>

        {/* ── OTP Input Form ── */}
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 6-digit code"
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              autoComplete="one-time-code"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Verify Email
              </span>
            )}
          </Button>
        </form>

        {/* ── Resend ── */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
          <Button
            variant="outline"
            onClick={handleResendOtp}
            disabled={resendDisabled || loading}
            className="gap-2"
          >
            {resendDisabled ? (
              <>
                <Clock className="h-4 w-4" />
                Resend in {resendCooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Resend Code
              </>
            )}
          </Button>
        </div>

        {/* ── Back ── */}
        <Button variant="ghost" onClick={onBack} className="w-full flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Registration
        </Button>
      </CardContent>
    </Card>
  );
};

export default OtpVerification;
