import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, DollarSign } from 'lucide-react';

const TariffRates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addQuickLinkSubmission } = useAuth();
  const [formData, setFormData] = useState({
    consumerNumber: '',
    connectionType: '',
    averageUsage: '',
    mobileNumber: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send to manager approval
    addQuickLinkSubmission({
      type: 'Tariff Rate Inquiry',
      data: formData
    });
    
    toast({
      title: "Success",
      description: "Successfully submitted",
      variant: "default",
    });
    setFormData({ consumerNumber: '', connectionType: '', averageUsage: '', mobileNumber: '', email: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Tariff Rate Inquiry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="consumerNumber">Consumer Number</Label>
                <Input
                  id="consumerNumber"
                  name="consumerNumber"
                  value={formData.consumerNumber}
                  onChange={handleChange}
                  placeholder="Enter your consumer number"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="connectionType">Connection Type</Label>
                <Input
                  id="connectionType"
                  name="connectionType"
                  value={formData.connectionType}
                  onChange={handleChange}
                  placeholder="Domestic/Commercial/Industrial"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="averageUsage">Average Monthly Usage (Units)</Label>
                <Input
                  id="averageUsage"
                  name="averageUsage"
                  type="number"
                  value={formData.averageUsage}
                  onChange={handleChange}
                  placeholder="Enter average monthly usage"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Submit Inquiry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TariffRates;
