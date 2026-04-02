
import React from 'react';
import { Button } from '@/components/ui/button';
import LoginForm from '../auth/LoginForm';
import { Zap } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack, onSuccess }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden animate-fade-in">
      
      {/* Decorative background orbital glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Panel */}
      <div className="relative w-full max-w-5xl glass-effect bg-black/40 rounded-3xl border border-white/5 overflow-hidden flex flex-col md:flex-row shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] z-10">
        
        {/* Left Branding Pane */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-black/60 to-transparent border-r border-white/5 w-1/2 relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay" />
          
          <div className="relative z-10">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-muted-foreground hover:text-primary hover:bg-white/5 -ml-4 mb-8 transition-all"
            >
              ← Back to Portal
            </Button>

            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-primary/20 rounded-2xl border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                <img 
                  src="/lovable-uploads/c59983aa-c865-4c97-85ff-9de45f1f7d68.png" 
                  alt="JBVNL Logo" 
                  className="w-12 h-12 object-contain hidden" // Fallback hidden if image fails, use lucide icon instead since the image looks out of place
                />
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
              Experience the future of electricity management. <br />
              Secure, lightning-fast, and designed entirely around your needs.
            </p>
          </div>

          <div className="relative z-10 text-sm text-gray-500 font-medium">
            <p>Jharkhand Bijli Vitran Nigam Limited</p>
            <p className="mt-1">© {new Date().getFullYear()} Official Electricity Services</p>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          
          {/* Mobile Back Button */}
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="md:hidden text-muted-foreground hover:text-primary self-start -ml-2 mb-6"
          >
            ← Back
          </Button>

          {/* Mobile Branding (hidden on desktop) */}
          <div className="md:hidden flex flex-col items-center mb-10 text-center">
            <Zap className="w-12 h-12 text-primary mb-4 drop-shadow-[0_0_8px_rgba(var(--primary),1)]" />
            <h1 className="text-2xl font-bold text-white mb-2">JBVNL Portal</h1>
            <p className="text-muted-foreground">Log in to manage your services</p>
          </div>

          <div className="w-full max-w-sm mx-auto">
            <LoginForm onSuccess={onSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
