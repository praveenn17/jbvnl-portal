import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, User, MessageSquare, Calendar, Phone } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const ComplaintTracking: React.FC = () => {
  const navigate = useNavigate();
  const { complaintId } = useParams();

  const complaintDetails = {
    id: complaintId,
    title: 'Billing Discrepancy',
    description: 'Units calculation seems incorrect for this month. The meter reading shows 245 units but I was charged for 280 units.',
    category: 'billing',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-12',
    assignedTo: 'Priya Sharma - Senior Billing Officer',
    estimatedResolution: '2024-03-15',
    consumerNumber: 'JBVNL001',
    contactNumber: '+91 9876543210'
  };

  const trackingHistory = [
    {
      date: '2024-03-10 10:30 AM',
      status: 'Complaint Registered',
      description: 'Your complaint has been registered and assigned ticket number #' + complaintId,
      agent: 'System',
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />
    },
    {
      date: '2024-03-10 02:15 PM',
      status: 'Under Review',
      description: 'Complaint assigned to billing department for investigation',
      agent: 'Admin Team',
      icon: <Clock className="h-4 w-4 text-blue-500" />
    },
    {
      date: '2024-03-11 09:45 AM',
      status: 'Investigation Started',
      description: 'Billing officer is reviewing your meter readings and bill calculations',
      agent: 'Priya Sharma',
      icon: <MessageSquare className="h-4 w-4 text-purple-500" />
    },
    {
      date: '2024-03-12 11:20 AM',
      status: 'In Progress',
      description: 'Meter reading verification completed. Processing correction request.',
      agent: 'Priya Sharma',
      icon: <Clock className="h-4 w-4 text-orange-500" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Complaint Tracking</h1>
            <p className="text-muted-foreground">Track the status of your complaint #C{complaintId}</p>
          </div>
        </div>

        {/* Complaint Summary */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{complaintDetails.title}</CardTitle>
                <CardDescription className="mt-2">Complaint ID: #C{complaintId}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(complaintDetails.status)}>
                  {complaintDetails.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(complaintDetails.priority)}>
                  {complaintDetails.priority} priority
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Complaint Details</h4>
                  <p className="text-sm text-muted-foreground">{complaintDetails.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-muted-foreground capitalize">{complaintDetails.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">{new Date(complaintDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Assignment Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm">{complaintDetails.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm">{complaintDetails.contactNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm">Est. Resolution: {new Date(complaintDetails.estimatedResolution).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking History</CardTitle>
            <CardDescription>Follow the progress of your complaint resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {trackingHistory.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{item.status}</h4>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    <p className="text-xs text-primary mt-1">by {item.agent}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Investigation In Progress</h3>
              <p className="text-muted-foreground mb-4">
                Our billing team is currently reviewing your meter readings and will provide an update within 24 hours.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/consumer/form/register-complaint')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
                <Button onClick={() => window.open('tel:' + complaintDetails.contactNumber)}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintTracking;