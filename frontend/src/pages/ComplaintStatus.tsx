import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, MessageSquare } from 'lucide-react';

const ComplaintStatus = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addQuickLinkSubmission } = useAuth();
  const [formData, setFormData] = useState({
    consumerNumber: '',
    complaintType: '',
    description: '',
    mobileNumber: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send to manager approval
    addQuickLinkSubmission({
      type: 'Complaint Registration',
      data: formData
    });
    
    toast({
      title: "Success",
      description: "Successfully submitted",
      variant: "default",
    });
    setFormData({ consumerNumber: '', complaintType: '', description: '', mobileNumber: '', email: '' });
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
            <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Register Complaint</CardTitle>
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
                <Label htmlFor="complaintType">Complaint Type</Label>
                <Input
                  id="complaintType"
                  name="complaintType"
                  value={formData.complaintType}
                  onChange={handleChange}
                  placeholder="Power outage/Billing issue/etc."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your complaint"
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
                Submit Complaint
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintStatus;
