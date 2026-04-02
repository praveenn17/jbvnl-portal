
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, MessageSquare, Zap, Smartphone, Users, Shield } from 'lucide-react';

interface FeaturesGridProps {
  onFeatureClick: (featureName: string) => void;
}

const FeaturesGrid: React.FC<FeaturesGridProps> = ({ onFeatureClick }) => {
  const features = [
    {
      icon: FileText,
      title: "Bill Management",
      description: "Check bills, view history, and make secure online payments",
      color: "bg-primary"
    },
    {
      icon: MessageSquare,
      title: "Complaint System",
      description: "Register complaints and track resolution status",
      color: "bg-secondary"
    },
    {
      icon: Zap,
      title: "New Connections",
      description: "Apply for new electricity connections online",
      color: "bg-primary"
    },
    {
      icon: Smartphone,
      title: "WhatsApp Services",
      description: "Get updates and services via WhatsApp QR code",
      color: "bg-secondary"
    },
    {
      icon: Users,
      title: "Multi-User Access",
      description: "Separate portals for consumers, admins, and managers",
      color: "bg-primary"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Bank-grade security with real-time OTP verification",
      color: "bg-secondary"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <Card 
            key={index}
            className="hover-scale border-0 shadow-lg bg-white/80 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => onFeatureClick(feature.title)}
          >
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FeaturesGrid;
