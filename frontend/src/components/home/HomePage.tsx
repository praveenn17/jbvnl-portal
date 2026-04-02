
import React from 'react';
import HeroSection from './HeroSection';
import FeaturesGrid from './FeaturesGrid';
import CallToAction from './CallToAction';
import Footer from './Footer';
import { useToast } from '@/hooks/use-toast';

interface HomePageProps {
  onLoginClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick }) => {
  const { toast } = useToast();

  const handleFeatureClick = (featureName: string) => {
    toast({
      title: "First Login",
      description: `Please login to access ${featureName}`,
      variant: "default",
    });
    onLoginClick();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <HeroSection onLoginClick={onLoginClick} />
      <div className="container mx-auto px-4">
        <FeaturesGrid onFeatureClick={handleFeatureClick} />
      </div>
      <CallToAction onLoginClick={onLoginClick} />
      <Footer />
    </div>
  );
};

export default HomePage;
