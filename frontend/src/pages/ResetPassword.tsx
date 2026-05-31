import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PageState = 'form' | 'loading' | 'success' | 'invalid_token';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

const getRequirements = (pw: string): PasswordRequirement[] => [
  { label: 'At least 8 characters',       met: pw.length >= 8 },
  { label: 'At least 1 uppercase letter',  met: /[A-Z]/.test(pw) },
  { label: 'At least 1 lowercase letter',  met: /[a-z]/.test(pw) },
  { label: 'At least 1 number',            met: /[0-9]/.test(pw) },
  { label: 'At least 1 special character', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw) },
];

const strengthLabel = (metCount: number): { label: string; color: string } => {
  if (metCount <= 1) return { label: 'Very Weak',  color: 'bg-red-500' };
  if (metCount === 2) return { label: 'Weak',       color: 'bg-orange-500' };
  if (metCount === 3) return { label: 'Fair',       color: 'bg-yellow-500' };
  if (metCount === 4) return { label: 'Strong',     color: 'bg-blue-500' };
  return               { label: 'Very Strong', color: 'bg-green-500' };
};

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [pageState, setPageState]         = useState<PageState>('form');
  const [errorMsg, setErrorMsg]           = useState('');

  // Redirect to login after success
  useEffect(() => {
    if (pageState === 'success') {
      const timer = setTimeout(() => navigate('/'), 4000);
      return () => clearTimeout(timer);
    }
  }, [pageState, navigate]);

  // Validate that token param is present; show error if not
  useEffect(() => {
    if (!token || token.length < 10) {
      setPageState('invalid_token');
    }
  }, [token]);

  const requirements = getRequirements(newPassword);
  const metCount     = requirements.filter((r) => r.met).length;
  const strength     = strengthLabel(metCount);
  const allMet       = metCount === requirements.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!allMet) {
      setErrorMsg('Please meet all password requirements before submitting.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setPageState('loading');

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Expired / invalid token → special state
        if (res.status === 400 && data.message?.toLowerCase().includes('invalid or has expired')) {
          setPageState('invalid_token');
          return;
        }
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        setPageState('form');
        return;
      }

      setPageState('success');
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setPageState('form');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden animate-fade-in">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-5xl glass-effect bg-black/40 rounded-3xl border border-white/5 overflow-hidden flex flex-col md:flex-row shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] z-10">

        {/* ── Left Branding Pane ── */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-black/60 to-transparent border-r border-white/5 w-1/2 relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay" />

          <div className="relative z-10">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors -ml-1 mb-8 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Portal
            </button>

            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-primary/20 rounded-2xl border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                <Zap className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),1)]" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                  JBVNL <span className="text-primary">Smart </span>
                  <span className="text-secondary">Portal</span>
                </h1>
              </div>
            </div>

            <p className="text-xl text-gray-300 font-light leading-relaxed mb-8">
              Set a new secure password for your account.
            </p>

            {/* Password tips */}
            <div className="space-y-3">
              {[
                'Use a mix of uppercase, lowercase, numbers and symbols',
                'Avoid common words or patterns',
                'All sessions will be signed out after reset',
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-3 text-gray-400 text-sm">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 text-sm text-gray-500 font-medium">
            <p>Jharkhand Bijli Vitran Nigam Limited</p>
            <p className="mt-1">© {new Date().getFullYear()} Official Electricity Services</p>
          </div>
        </div>

        {/* ── Right Form Pane ── */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">

          {/* Mobile back */}
          <button
            onClick={() => navigate('/')}
            className="md:hidden flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Mobile branding */}
          <div className="md:hidden flex flex-col items-center mb-8 text-center">
            <Zap className="w-10 h-10 text-primary mb-3 drop-shadow-[0_0_8px_rgba(var(--primary),1)]" />
            <h1 className="text-xl font-bold text-white mb-1">JBVNL Portal</h1>
            <p className="text-muted-foreground text-sm">Set New Password</p>
          </div>

          <div className="w-full max-w-sm mx-auto">

            {/* ── SUCCESS STATE ── */}
            {pageState === 'success' && (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your password has been updated successfully. All active sessions have been
                    signed out. Redirecting you to login in a moment…
                  </p>
                </div>
                <div className="bg-green-950/30 border border-green-700/30 rounded-xl p-4">
                  <p className="text-green-400 text-xs">
                    You will be redirected to the login page automatically in 4 seconds.
                  </p>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate('/')}>
                  Go to Login Now
                </Button>
              </div>
            )}

            {/* ── INVALID TOKEN STATE ── */}
            {pageState === 'invalid_token' && (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-500/15 border border-red-500/30 mx-auto">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Link Invalid or Expired</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    This password reset link is either invalid, has already been used, or has
                    expired (links are valid for 15 minutes only).
                  </p>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/forgot-password')}
                >
                  Request a New Link
                </Button>
                <button
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => navigate('/')}
                >
                  Back to Login
                </button>
              </div>
            )}

            {/* ── FORM / LOADING STATE ── */}
            {(pageState === 'form' || pageState === 'loading') && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Set New Password</h2>
                  <p className="text-muted-foreground text-sm">
                    Choose a strong password for your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="rp-new" className="text-sm font-medium">
                      New Password <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="rp-new"
                        type={showNew ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="pl-10 pr-10"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(''); }}
                        disabled={pageState === 'loading'}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setShowNew(!showNew)}
                        tabIndex={-1}
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password strength bar */}
                    {newPassword.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Strength</span>
                          <span className={`font-semibold ${
                            metCount <= 2 ? 'text-red-400' :
                            metCount === 3 ? 'text-yellow-400' :
                            metCount === 4 ? 'text-blue-400' : 'text-green-400'
                          }`}>{strength.label}</span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                i <= metCount ? strength.color : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Requirements checklist */}
                        <ul className="space-y-1 mt-2">
                          {requirements.map((req) => (
                            <li key={req.label} className="flex items-center gap-2 text-xs">
                              {req.met
                                ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                                : <XCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              }
                              <span className={req.met ? 'text-green-400' : 'text-muted-foreground'}>
                                {req.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="rp-confirm" className="text-sm font-medium">
                      Confirm Password <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="rp-confirm"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        className={`pl-10 pr-10 ${
                          confirmPassword && newPassword !== confirmPassword
                            ? 'border-red-500/50 focus:border-red-500'
                            : confirmPassword && newPassword === confirmPassword
                            ? 'border-green-500/50 focus:border-green-500'
                            : ''
                        }`}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                        disabled={pageState === 'loading'}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setShowConfirm(!showConfirm)}
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-400">Passwords do not match.</p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && (
                      <p className="text-xs text-green-400">Passwords match ✓</p>
                    )}
                  </div>

                  {/* Inline error */}
                  {errorMsg && (
                    <div className="flex items-start gap-2 bg-red-950/30 border border-red-700/40 rounded-lg p-3 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    id="rp-submit"
                    className="w-full bg-primary hover:bg-primary/90 font-semibold"
                    disabled={pageState === 'loading' || !allMet || newPassword !== confirmPassword}
                  >
                    {pageState === 'loading' ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating Password…
                      </span>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
