
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Zap, Users, Shield, Clock } from 'lucide-react';

const LearnMore = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-primary hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/lovable-uploads/c59983aa-c865-4c97-85ff-9de45f1f7d68.png" 
                alt="JBVNL Logo" 
                className="w-24 h-24 mr-4"
              />
              <div className="text-left">
                <h1 className="text-4xl font-bold text-gray-900">About JBVNL</h1>
                <p className="text-xl text-gray-600">Jharkhand Bijli Vitran Nigam Limited</p>
              </div>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">Empowering Jharkhand with Modern Electricity Services</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Jharkhand Bijli Vitran Nigam Limited (JBVNL) stands as the premier electricity distribution company serving the state of Jharkhand, India. Established with a vision to provide reliable, efficient, and affordable electricity to every corner of the state, JBVNL has been instrumental in transforming the power sector landscape of Jharkhand since its inception.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Our comprehensive digital portal represents a significant leap forward in customer service excellence, offering seamless online solutions for bill payments, new connection applications, complaint registrations, and service management. Through innovative technology integration, we have revolutionized the way customers interact with electricity services, making processes more transparent, efficient, and user-friendly.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                JBVNL serves millions of consumers across diverse sectors including residential, commercial, and industrial segments. Our commitment extends beyond mere electricity supply; we focus on sustainable energy practices, grid modernization, and renewable energy integration. The organization continuously invests in infrastructure development, smart grid technologies, and digital transformation initiatives to ensure uninterrupted power supply and enhanced customer experience.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                With a dedicated workforce of skilled professionals and a robust network spanning urban and rural areas, JBVNL remains committed to powering Jharkhand's growth story. Our 24/7 customer support, advanced metering infrastructure, and proactive maintenance programs demonstrate our unwavering dedication to service excellence and customer satisfaction.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Reliable Supply</h3>
                <p className="text-sm text-gray-600">99.9% uptime guarantee</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Customer First</h3>
                <p className="text-sm text-gray-600">24/7 support available</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Secure Platform</h3>
                <p className="text-sm text-gray-600">Bank-grade security</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Quick Service</h3>
                <p className="text-sm text-gray-600">Instant online solutions</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-primary-600 text-white px-8 py-3 text-lg"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;
