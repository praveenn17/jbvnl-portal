import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, Calendar, MapPin, User, Filter } from 'lucide-react';

const ActiveComplaints: React.FC = () => {
  const navigate = useNavigate();
  
  const [complaints] = useState([
    {
      id: '1',
      consumerNumber: 'JBVNL001',
      consumerName: 'Rajesh Kumar',
      title: 'Power Outage in Sector 5',
      description: 'Frequent power cuts affecting the entire sector for the past 3 days',
      category: 'power_outage',
      status: 'open',
      priority: 'high',
      createdAt: '2024-03-12T10:30:00Z',
      updatedAt: '2024-03-12T10:30:00Z',
      location: 'Sector 5, Ranchi',
      assignedTo: 'Tech Team A'
    },
    {
      id: '2',
      consumerNumber: 'JBVNL002',
      consumerName: 'Priya Sharma',
      title: 'Billing Issue - Overcharged',
      description: 'Incorrect meter reading calculation resulting in 40% higher bill',
      category: 'billing',
      status: 'in_progress',
      priority: 'medium',
      createdAt: '2024-03-10T14:15:00Z',
      updatedAt: '2024-03-11T09:20:00Z',
      location: 'Hatia, Ranchi',
      assignedTo: 'Billing Team'
    },
    {
      id: '3',
      consumerNumber: 'JBVNL003',
      consumerName: 'Amit Singh',
      title: 'Voltage Fluctuation',
      description: 'High voltage issues damaging appliances, need stabilizer',
      category: 'technical',
      status: 'open',
      priority: 'urgent',
      createdAt: '2024-03-11T16:45:00Z',
      updatedAt: '2024-03-11T16:45:00Z',
      location: 'Kanke, Ranchi',
      assignedTo: 'Field Engineer'
    },
    {
      id: '4',
      consumerNumber: 'JBVNL004',
      consumerName: 'Sunita Devi',
      title: 'New Connection Delay',
      description: 'Applied for new connection 2 months ago, no response',
      category: 'connection',
      status: 'pending',
      priority: 'medium',
      createdAt: '2024-03-08T11:00:00Z',
      updatedAt: '2024-03-09T10:30:00Z',
      location: 'Doranda, Ranchi',
      assignedTo: 'Connection Team'
    },
    {
      id: '5',
      consumerNumber: 'JBVNL005',
      consumerName: 'Vikash Yadav',
      title: 'Meter Reading Error',
      description: 'Meter showing incorrect readings, needs replacement',
      category: 'meter',
      status: 'assigned',
      priority: 'high',
      createdAt: '2024-03-09T13:20:00Z',
      updatedAt: '2024-03-10T08:15:00Z',
      location: 'Bariatu, Ranchi',
      assignedTo: 'Meter Team'
    }
  ]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const urgentComplaints = complaints.filter(c => c.priority === 'urgent').length;
  const highPriorityComplaints = complaints.filter(c => c.priority === 'high').length;
  const oldestComplaint = complaints.reduce((oldest, current) => 
    new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Active Complaints</h1>
            <p className="text-muted-foreground">Monitor and manage consumer complaints with detailed tracking</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Active</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{complaints.length}</div>
              <p className="text-xs text-muted-foreground">Complaints pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{urgentComplaints}</div>
              <p className="text-xs text-muted-foreground">Need immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{highPriorityComplaints}</div>
              <p className="text-xs text-muted-foreground">Escalated issues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oldest Issue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{getTimeAgo(oldestComplaint.createdAt)}</div>
              <p className="text-xs text-muted-foreground">Needs resolution</p>
            </CardContent>
          </Card>
        </div>

        {/* Complaints List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Complaint Details & Status
                </CardTitle>
                <CardDescription>
                  Comprehensive complaint tracking with real-time status updates
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter & Sort
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {complaint.title}
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">{complaint.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: #{complaint.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{complaint.consumerName}</p>
                        <p className="text-xs text-muted-foreground">{complaint.consumerNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-xs text-muted-foreground">{complaint.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Reported</p>
                        <p className="text-xs text-muted-foreground">{getTimeAgo(complaint.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Assigned To</p>
                        <p className="text-xs text-muted-foreground">{complaint.assignedTo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{complaint.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Last updated: {getTimeAgo(complaint.updatedAt)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/complaint-details/${complaint.id}`)}
                      >
                        View Full Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        Contact Consumer
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/admin/update-complaint/${complaint.id}`)}
                      >
                        Update Status
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActiveComplaints;