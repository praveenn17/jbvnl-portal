
import React from 'react';
import { Button } from '@/components/ui/button';

interface CallToActionProps {
  onLoginClick: () => void;
}

const CallToAction: React.FC<CallToActionProps> = ({ onLoginClick }) => {
  return (
    <section className="bg-primary text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of satisfied customers using JBVNL's digital services
        </p>
        <Button 
          onClick={onLoginClick}
          className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
        >
          Access Your Account
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
