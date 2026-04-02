import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Users, ArrowRight, Sparkles, Star } from 'lucide-react';

interface HeroSectionProps {
  onLoginClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onLoginClick }) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30"></div>
      </div>

      {/* Floating Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-green-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-blue-400/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-purple-400/20 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
            {/* Main Content */}
            <div className="text-white space-y-8 animate-fade-in">
              <div className="flex flex-col items-center space-y-4 mb-6">
                <img 
                  src="/lovable-uploads/c59983aa-c865-4c97-85ff-9de45f1f7d68.png" 
                  alt="JBVNL Logo" 
                  className="w-20 h-20 shadow-xl rounded-2xl animate-bounce"
                />
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                    <span className="text-yellow-400 font-semibold">JBVNL Digital</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                      JBVNL Portal
                    </span>
                  </h1>
                  <p className="text-xl text-blue-100 mt-2">Jharkhand Bijli Vitran Nigam Limited</p>
                </div>
              </div>

              <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
                Experience seamless electricity services with our advanced digital platform. 
                Manage bills, track consumption, and stay connected 24/7.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={onLoginClick}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover-scale transition-all duration-300"
                >
                  Access Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/learn-more')}
                  className="border-2 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400 px-8 py-4 text-lg rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  Learn More
                </Button>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">56K+</div>
                  <div className="text-blue-200 text-sm">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">99.9%</div>
                  <div className="text-blue-200 text-sm">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">24/7</div>
                  <div className="text-blue-200 text-sm">Support</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;