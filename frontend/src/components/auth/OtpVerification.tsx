
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, Key, RefreshCw } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ email, onBack, onSuccess }) => {
  const { verifyOtp, resendOtp, loading, latestOtp } = useAuth();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit OTP',
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await verifyOtp(email, otp);

      if (success) {
        const tempUserData = localStorage.getItem('jbvnl_temp_reg_data');
        const role = tempUserData ? JSON.parse(tempUserData).role : '';

        // BUG #10 FIX: Toast now reflects actual backend behaviour.
        // Managers start as 'pending' and need admin approval.
        // Consumers and Admins are auto-approved and can login immediately.
        // Developer bypass (111000) also auto-approves managers.
        if (role === 'manager' && otp !== '111000') {
          toast({
            title: 'Registration Submitted!',
            description:
              'Your manager account is pending admin approval. You will be able to login once approved.',
          });
        } else {
          toast({
            title: 'Registration Successful!',
            description: 'Your account is active. You can now login.',
          });
        }
        onSuccess();
      }
    } catch (error: any) {
      console.error('OTP verify error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP. Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      const success = await resendOtp(email);
      if (success) {
        toast({
          title: 'OTP Resent',
          description: 'New verification code generated. Check the green banner above.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Resend Failed',
        description: error.message || 'Could not resend OTP. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUseBypass = () => {
    setOtp('111000');
    toast({
      title: 'Bypass OTP Applied',
      description: 'Developer bypass 111000 filled in. Click Verify Email to continue.',
    });
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
          A 6-digit verification code has been generated for
          <br />
          <span className="font-medium">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Green OTP Banner (shown when OTP is available) ── */}
        {latestOtp ? (
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Key className="h-5 w-5 text-green-700" />
              <p className="font-bold text-green-800 text-sm">Your Verification Code</p>
            </div>
            <p className="text-3xl font-mono font-extrabold text-green-700 tracking-widest text-center py-2 select-all">
              {latestOtp}
            </p>
            <p className="text-xs text-green-600 text-center mb-2">
              Select and copy the code above, or click Auto-fill
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-green-400 text-green-700 hover:bg-green-100"
              onClick={() => setOtp(latestOtp)}
            >
              Auto-fill this code
            </Button>
          </div>
        ) : (
          /* ── Yellow Bypass Banner (shown when no OTP in state) ── */
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Developer Bypass Available</p>
              <p className="text-xs">
                Use{' '}
                <code className="bg-yellow-100 px-1 rounded font-mono font-bold">111000</code> to
                skip email verification
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-yellow-400 text-yellow-700 hover:bg-yellow-100 whitespace-nowrap"
              onClick={handleUseBypass}
            >
              Use Bypass
            </Button>
          </div>
        )}

        {/* ── OTP Input Form ── */}
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
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>

        {/* ── Resend ── */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
          <Button
            variant="outline"
            onClick={handleResendOtp}
            className="text-primary hover:text-primary-600 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Resend Code
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
