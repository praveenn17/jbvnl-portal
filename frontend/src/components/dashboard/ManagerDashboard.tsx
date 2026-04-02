import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, TrendingUp, Settings, CheckCircle, Clock, XCircle, UserCheck, DollarSign, FileBarChart, Key, AlertTriangle } from 'lucide-react';

import { mockApi } from '../../lib/mockApi';

const ManagerDashboard: React.FC = () => {
  const { pendingUsers, updateUserStatus, user } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, totalUsers: 0, pendingComplaints: 0 });

  React.useEffect(() => {
    const fetchStats = async () => {
      const data = await mockApi.getManagerStats();
      setStats(data);
    };
    fetchStats();
  }, []);

  const handleAdminApproval = (adminId: string, action: 'approve' | 'reject' | 'hold') => {
    console.log(`${action} admin:`, adminId);
    if (action === 'approve') {
      updateUserStatus(adminId, 'approved');
    } else if (action === 'reject') {
      updateUserStatus(adminId, 'rejected');
    } else {
      updateUserStatus(adminId, 'hold');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Manager Info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name || 'Manager'}</h1>
              <p className="text-blue-100 text-lg">System Manager Dashboard</p>
              <Badge variant="secondary" className="mt-3 bg-white/20 text-white border-white/30">
                Manager Level Access
              </Badge>
            </div>
            <div className="text-right">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
                alt="Manager Avatar" 
                className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card 
            className="hover-scale cursor-pointer bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg"
            onClick={() => navigate('/manager/admin-management')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Admins</CardTitle>
              <UserCheck className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">10</div>
              <p className="text-sm opacity-90">{pendingUsers.filter(u => u.role === 'admin').length} pending approval</p>
            </CardContent>
          </Card>

          <Card className="hover-scale bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Users</CardTitle>
              <Users className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-sm opacity-90">Consumers across Bihar</p>
            </CardContent>
          </Card>

          <Card 
            className="hover-scale cursor-pointer bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg"
            onClick={() => navigate('/manager/revenue-details')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Revenue</CardTitle>
              <DollarSign className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{(stats.revenue / 100000).toFixed(1)}L</div>
              <p className="text-sm opacity-90">Total Revenue | Click for details</p>
            </CardContent>
          </Card>

          <Card 
            className="hover-scale cursor-pointer bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg"
            onClick={() => navigate('/manager/reports-analytics')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Analytics</CardTitle>
              <FileBarChart className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Reports</div>
              <p className="text-sm opacity-90">Click for insights</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="hover-scale cursor-pointer bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg"
            onClick={() => navigate('/manager/admin-dashboard-access')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Access Admin Dashboard
              </CardTitle>
              <CardDescription className="text-indigo-100">
                Enter admin reference to access specific dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">Reference: FEUCC007 (Demo)</p>
            </CardContent>
          </Card>

          <Card 
            className="hover-scale cursor-pointer bg-gradient-to-br from-teal-500 to-green-600 text-white border-0 shadow-lg"
            onClick={() => navigate('/manager/security-settings')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-teal-100">
                Configure security policies and protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">System Security: 94.5%</p>
            </CardContent>
          </Card>

          <Card 
            className="hover-scale cursor-pointer bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0 shadow-lg"
            onClick={() => navigate('/manager/system-parameters')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Parameters
              </CardTitle>
              <CardDescription className="text-cyan-100">
                Manage operational configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">Uptime: 99.98%</p>
            </CardContent>
          </Card>
        </div>

        {/* Settings Dialog */}
        <div className="fixed bottom-6 right-6">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full shadow-lg bg-white hover:bg-gray-50"
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Manager Settings</DialogTitle>
                <DialogDescription>
                  Configure your manager dashboard preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="flex flex-col space-y-1">
                    <span>Push Notifications</span>
                    <span className="text-sm text-muted-foreground">Receive alerts for critical events</span>
                  </Label>
                  <Switch id="notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-approve" className="flex flex-col space-y-1">
                    <span>Auto-approve Consumers</span>
                    <span className="text-sm text-muted-foreground">Automatically approve consumer registrations</span>
                  </Label>
                  <Switch id="auto-approve" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-reports" className="flex flex-col space-y-1">
                    <span>Weekly Email Reports</span>
                    <span className="text-sm text-muted-foreground">Send summary reports via email</span>
                  </Label>
                  <Switch id="email-reports" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                    <span>Maintenance Mode</span>
                    <span className="text-sm text-muted-foreground">Enable system maintenance mode</span>
                  </Label>
                  <Switch id="maintenance-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="debug-logging" className="flex flex-col space-y-1">
                    <span>Debug Logging</span>
                    <span className="text-sm text-muted-foreground">Enable detailed system logs</span>
                  </Label>
                  <Switch id="debug-logging" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Admin Approval Section */}
        <Tabs defaultValue="admin-approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="admin-approvals" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Admin Approvals
            </TabsTrigger>
            <TabsTrigger value="consumer-approvals" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Consumer Approvals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin-approvals" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                  Admin Approval Requests
                </CardTitle>
                <CardDescription>
                  Review and approve admin user registrations. Once approved, admins can access the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {pendingUsers.filter(user => user.role === 'admin').map((admin) => (
                    <Card key={admin.id} className="hover-scale bg-gradient-to-r from-orange-50 to-red-50 border-0">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {admin.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <CardTitle className="text-xl flex items-center gap-2">
                                {getStatusIcon(admin.status)}
                                {admin.name}
                              </CardTitle>
                              <CardDescription className="text-base">{admin.email}</CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">Admin Request</Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              Applied: {new Date(admin.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-6">
                            <span className="text-sm">Status: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{admin.status}</Badge></span>
                            <span className="text-sm">Role: <Badge className="bg-blue-100 text-blue-800">Administrator</Badge></span>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handleAdminApproval(admin.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                              onClick={() => handleAdminApproval(admin.id, 'hold')}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Hold
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAdminApproval(admin.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {pendingUsers.filter(user => user.role === 'admin').length === 0 && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-green-700 font-medium">No pending admin approvals</p>
                        <p className="text-green-600 text-sm mt-1">All admin requests have been processed</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consumer-approvals" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-green-500" />
                  Consumer Registrations
                </CardTitle>
                <CardDescription>
                  Review and approve consumer registrations for the JBVNL system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {pendingUsers.filter(user => user.role === 'consumer').map((consumer) => (
                    <Card key={consumer.id} className="hover-scale bg-gradient-to-r from-green-50 to-blue-50 border-0">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {consumer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <CardTitle className="text-xl flex items-center gap-2">
                                {getStatusIcon(consumer.status)}
                                {consumer.name}
                              </CardTitle>
                              <CardDescription className="text-base">{consumer.email}</CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Consumer Request</Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              Applied: {new Date(consumer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-6">
                            <span className="text-sm">Status: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{consumer.status}</Badge></span>
                            <span className="text-sm">Role: <Badge className="bg-green-100 text-green-800">Consumer</Badge></span>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handleAdminApproval(consumer.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAdminApproval(consumer.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve Consumer
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {pendingUsers.filter(user => user.role === 'consumer').length === 0 && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-green-700 font-medium">No pending consumer registrations</p>
                        <p className="text-green-600 text-sm mt-1">All consumer requests have been processed</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>

  );
};

export default ManagerDashboard;
