import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Zap, ArrowLeft, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Role = 'consumer' | 'manager';
type PageState = 'form' | 'loading' | 'success' | 'error';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [pageState, setPageState] = useState<PageState>('form');
  const [errorMsg, setErrorMsg] = useState('');

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    if (!isValidEmail(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!role) {
      setErrorMsg('Please select your account role.');
      return;
    }

    setPageState('loading');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), role }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setErrorMsg(data.message || 'Too many requests. Please try again later.');
        setPageState('error');
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        setPageState('error');
        return;
      }

      // Always show success to prevent email enumeration
      setPageState('success');
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setPageState('error');
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
              Forgot your password?<br />
              No worries — we'll send a secure reset link to your inbox.
            </p>

            {/* Security badge */}
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
              <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold mb-1">Secured Reset Flow</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Reset links expire in 15 minutes and are single-use. Admin accounts cannot use this flow.
                </p>
              </div>
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
            <p className="text-muted-foreground text-sm">Account Recovery</p>
          </div>

          <div className="w-full max-w-sm mx-auto">

            {/* ── SUCCESS STATE ── */}
            {pageState === 'success' && (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    If an account exists for <span className="text-primary font-medium">{email}</span>,
                    a password reset link has been sent. The link expires in{' '}
                    <strong className="text-white">15 minutes</strong>.
                  </p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-left">
                  <p className="text-amber-400 text-xs font-medium mb-1">Didn't receive it?</p>
                  <p className="text-gray-400 text-xs">
                    Check your spam/junk folder. If the problem persists,
                    wait a few minutes and try again.
                  </p>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/')}
                >
                  Back to Login
                </Button>
                <button
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => { setPageState('form'); setErrorMsg(''); }}
                >
                  Try a different email
                </button>
              </div>
            )}

            {/* ── ERROR STATE ── */}
            {pageState === 'error' && (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-500/15 border border-red-500/30 mx-auto">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Request Failed</h2>
                  <p className="text-muted-foreground text-sm">{errorMsg}</p>
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => { setPageState('form'); setErrorMsg(''); }}
                >
                  Try Again
                </Button>
                <button
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => navigate('/')}
                >
                  Back to Login
                </button>
              </div>
            )}

            {/* ── FORM STATE ── */}
            {(pageState === 'form' || pageState === 'loading') && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Forgot Password</h2>
                  <p className="text-muted-foreground text-sm">
                    Enter your registered email and account type to receive a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                  {/* Role selector */}
                  <div className="space-y-2">
                    <Label htmlFor="fp-role" className="text-sm font-medium">
                      Account Type <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={role}
                      onValueChange={(val: Role) => setRole(val)}
                      disabled={pageState === 'loading'}
                    >
                      <SelectTrigger id="fp-role">
                        <SelectValue placeholder="Select your account type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-foreground border-border">
                        <SelectItem value="consumer">Consumer</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Admin accounts cannot use this recovery flow.
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="fp-email" className="text-sm font-medium">
                      Registered Email <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fp-email"
                        type="email"
                        placeholder="Enter your registered email"
                        className="pl-10"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                        disabled={pageState === 'loading'}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  {/* Inline error */}
                  {errorMsg && pageState === 'form' && (
                    <div className="flex items-start gap-2 bg-red-950/30 border border-red-700/40 rounded-lg p-3 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    id="fp-submit"
                    className="w-full bg-primary hover:bg-primary/90 font-semibold"
                    disabled={pageState === 'loading'}
                  >
                    {pageState === 'loading' ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Reset Link…
                      </span>
                    ) : (
                      'Send Reset Link'
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

export default ForgotPassword;
