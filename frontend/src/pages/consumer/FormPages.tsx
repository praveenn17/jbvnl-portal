import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle, Plus, Power, MessageSquare, Edit, AlertCircle } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/lib/mockApi';

const FormPages: React.FC = () => {
  const navigate = useNavigate();
  const { formType } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Initialize formData from location state if available (e.g. billNumber)
  const [formData, setFormData] = useState<Record<string, any>>(location.state || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getFormConfig = () => {
    switch (formType) {
      case 'new-connection':
        return {
          title: 'Apply for New Connection',
          description: 'Submit an application for a new electricity connection',
          icon: <Plus className="h-6 w-6 text-primary" />,
          fields: [
            { name: 'applicantName', label: 'Applicant Name', type: 'text', value: user?.name || '', required: true },
            { name: 'email', label: 'Email Address', type: 'email', value: user?.email || '', required: true },
            { name: 'phone', label: 'Phone Number', type: 'tel', value: user?.phone || '', required: true },
            { name: 'address', label: 'Installation Address', type: 'textarea', value: user?.address || '', required: true },
            { name: 'connectionType', label: 'Connection Type', type: 'select', options: ['Residential', 'Commercial', 'Industrial'], required: true },
            { name: 'loadRequired', label: 'Load Required (KW)', type: 'number', required: true },
            { name: 'purpose', label: 'Purpose of Connection', type: 'textarea', required: true }
          ]
        };
      case 'disable-connection':
        return {
          title: 'Disable Connection Request',
          description: 'Request to temporarily or permanently disable your electricity connection',
          icon: <Power className="h-6 w-6 text-red-500" />,
          fields: [
            { name: 'consumerNumber', label: 'Consumer Number', type: 'text', value: user?.consumerNumber || 'JBVNL001', disabled: true },
            { name: 'disableType', label: 'Disable Type', type: 'select', options: ['Temporary', 'Permanent'], required: true },
            { name: 'reason', label: 'Reason for Disabling', type: 'textarea', required: true },
            { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
            { name: 'contactNumber', label: 'Contact Number', type: 'tel', required: true },
            { name: 'alternateAddress', label: 'Alternate Contact Address', type: 'textarea' }
          ]
        };
      case 'register-complaint':
        return {
          title: 'Register Complaint',
          description: 'Submit a complaint regarding electricity services',
          icon: <MessageSquare className="h-6 w-6 text-orange-500" />,
          fields: [
            { name: 'consumerNumber', label: 'Consumer Number', type: 'text', value: user?.consumerNumber || 'JBVNL001', disabled: true },
            { name: 'complaintType', label: 'Complaint Type', type: 'select', options: ['Billing Issue', 'Power Outage', 'Meter Problem', 'Connection Issue', 'Other'], required: true },
            { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'], required: true },
            { name: 'title', label: 'Complaint Title', type: 'text', required: true },
            { name: 'description', label: 'Detailed Description', type: 'textarea', required: true },
            { name: 'contactNumber', label: 'Contact Number', type: 'tel', value: user?.phone || '', required: true },
            { name: 'preferredTime', label: 'Preferred Contact Time', type: 'time' }
          ]
        };
      case 'edit-details':
        return {
          title: 'Edit Consumer Details',
          description: 'Update your personal and contact information',
          icon: <Edit className="h-6 w-6 text-blue-500" />,
          fields: [
            { name: 'consumerNumber', label: 'Consumer Number', type: 'text', value: user?.consumerNumber || 'JBVNL001', disabled: true },
            { name: 'name', label: 'Full Name', type: 'text', value: user?.name || '', required: true },
            { name: 'email', label: 'Email Address', type: 'email', value: user?.email || '', required: true, disabled: true },
            { name: 'phone', label: 'Phone Number', type: 'tel', value: user?.phone || '', required: true },
            { name: 'address', label: 'Address', type: 'textarea', value: user?.address || '', required: true },
            { name: 'alternatePhone', label: 'Alternate Phone Number', type: 'tel' },
            { name: 'emergencyContact', label: 'Emergency Contact', type: 'text' }
          ]
        };
      case 'billing-concern':
        return {
          title: 'Raise Billing Concern',
          description: 'Report issues or concerns related to your electricity bill',
          icon: <AlertCircle className="h-6 w-6 text-yellow-500" />,
          fields: [
            { name: 'consumerNumber', label: 'Consumer Number', type: 'text', value: user?.consumerNumber || 'JBVNL001', disabled: true },
            { name: 'billNumber', label: 'Bill Number', type: 'text', value: formData.billNumber || '', required: true },
            { name: 'billingPeriod', label: 'Billing Period', type: 'text', required: true },
            { name: 'concernType', label: 'Type of Concern', type: 'select', options: ['Incorrect Units', 'Overcharging', 'Meter Reading Error', 'Late Fee Dispute', 'Other'], required: true },
            { name: 'description', label: 'Detailed Description', type: 'textarea', required: true },
            { name: 'expectedAmount', label: 'Expected Correct Amount', type: 'number' },
            { name: 'contactNumber', label: 'Contact Number', type: 'tel', value: user?.phone || '', required: true }
          ]
        };
      case 'service-concern':
        return {
          title: 'Service Concern',
          description: 'Report concerns about JBVNL services',
          icon: <AlertCircle className="h-6 w-6 text-purple-500" />,
          fields: [
            { name: 'consumerNumber', label: 'Consumer Number', type: 'text', value: user?.consumerNumber || 'JBVNL001', disabled: true },
            { name: 'serviceType', label: 'Service Type', type: 'select', options: ['Power Quality Monitoring', 'SMS Alert Service', 'Online Bill Service'], required: true },
            { name: 'issueType', label: 'Issue Type', type: 'select', options: ['Service Not Working', 'Technical Problem', 'Feature Request', 'General Inquiry'], required: true },
            { name: 'description', label: 'Describe Your Concern', type: 'textarea', required: true },
            { name: 'contactNumber', label: 'Contact Number', type: 'tel', required: true },
            { name: 'preferredResolution', label: 'Preferred Resolution', type: 'textarea' }
          ]
        };
      default:
        return {
          title: 'Form',
          description: 'Submit your request',
          icon: <MessageSquare className="h-6 w-6" />,
          fields: []
        };
    }
  };

  const formConfig = getFormConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalData: Record<string, any> = {};
      const missingFields: string[] = [];
      
      formConfig.fields.forEach(field => {
        const val = formData[field.name] !== undefined ? formData[field.name] : field.value;
        finalData[field.name] = val;
        if (field.required && (!val || String(val).trim() === '')) {
          missingFields.push(field.label);
        }
      });

      if (missingFields.length > 0) {
        setIsSubmitting(false);
        toast({
          title: "Required Fields Missing",
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      if (formType === 'register-complaint') {
        const categoryMap: any = {
          'billing issue': 'billing',
          'power outage': 'power_outage',
          'meter problem': 'meter',
          'connection issue': 'connection',
          'other': 'other'
        };
        const cat = finalData.complaintType ? categoryMap[finalData.complaintType.toLowerCase()] : 'other';
        await mockApi.fileComplaint({
          consumerNumber: user?.consumerNumber || 'UNKNOWN',
          title: finalData.title,
          description: finalData.description,
          category: cat || 'other',
          priority: finalData.priority || 'medium',
          preferredTime: finalData.preferredTime,
          contactNumber: finalData.contactNumber,
        });
      } else if (formType === 'billing-concern') {
        await mockApi.fileComplaint({
          consumerNumber: user?.consumerNumber || 'UNKNOWN',
          title: `Billing Concern - Bill ${finalData.billNumber}`,
          description: `Concern: ${finalData.concernType}\nDetails: ${finalData.description}\nExpected Amount: ${finalData.expectedAmount}`,
          category: 'billing',
          priority: 'medium',
          contactNumber: finalData.contactNumber,
        });
      } else if (formType === 'edit-details') {
        await mockApi.updateMyProfile({
          name: finalData.name || user?.name,
          phone: finalData.phone || user?.phone,
          address: finalData.address || user?.address,
        });
        if ((useAuth as any)().refreshUser) {
           await (useAuth as any)().refreshUser();
        }
      } else {
        const typeMap: any = {
          'new-connection': 'NEW_CONNECTION',
          'disable-connection': 'DISABLE_CONNECTION',
          'service-concern': 'OTHER', // Default or specific mapping
        };
        
        let requestType = typeMap[formType || ''] || 'OTHER';
        if (formType === 'service-concern') {
           const mapService: any = {
             'power quality monitoring': 'POWER_QUALITY',
             'sms alert service': 'SMS_ALERT_SERVICE',
             'online bill service': 'ONLINE_BILL_SERVICE'
           };
           requestType = finalData.serviceType ? mapService[finalData.serviceType.toLowerCase()] : 'OTHER';
        }

        await mockApi.createServiceRequest({
          requestType,
          title: formConfig.title,
          description: finalData.description || finalData.reason || finalData.purpose || 'Service Request submitted via portal',
          phone: finalData.phone || finalData.contactNumber,
          address: finalData.address || finalData.alternateAddress,
          metadata: finalData,
        });
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Request Submitted Successfully",
        description: "Your request has been sent and recorded.",
      });
    } catch (error: any) {
      setIsSubmitting(false);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit request",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Request Received Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your request has been submitted and sent to all administrators. You will receive an update via email and SMS.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full"
              >
                View Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            {formConfig.icon}
            <div>
              <h1 className="text-3xl font-bold text-primary">{formConfig.title}</h1>
              <p className="text-muted-foreground">{formConfig.description}</p>
            </div>
          </div>
        </div>

        
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Please fill in all required fields to submit your request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formConfig.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      defaultValue={field.value || ''}
                      disabled={field.disabled}
                      required={field.required}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <Select required={field.required} onValueChange={(value) => handleInputChange(field.name, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option.toLowerCase()}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      defaultValue={field.value || ''}
                      disabled={field.disabled}
                      required={field.required}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormPages;