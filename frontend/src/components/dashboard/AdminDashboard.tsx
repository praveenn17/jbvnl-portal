
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, Complaint } from '../../types';
import { Users, UserCheck, AlertTriangle, TrendingUp, CheckCircle, Clock, XCircle, Settings, Eye } from 'lucide-react';
import AdminSettings from './AdminSettings';
import ApprovalDetailsModal from './ApprovalDetailsModal';
import AuditLogs from './AuditLogs';

// ── Component ────────────────────────────────────────────────────────────────

import { mockApi } from '../../lib/mockApi';

const AdminDashboard: React.FC = () => {
  const { pendingUsers, updateUserStatus, user, refreshPendingUsers } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ 
    revenue: 0, 
    totalUsers: 0, 
    activeComplaints: 0,
    monthlyRevenue: [],
    complaintsByCategory: [] 
  });
  const [loading, setLoading] = useState(true);
  const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsData, statsData, messagesData] = await Promise.all([
          mockApi.getComplaints(),
          mockApi.getDashboardStats(),
          mockApi.getAdminMessages().catch(() => []) // Handle errors gracefully
        ]);
        setComplaints(complaintsData);
        setStats(statsData);
        setMessages(messagesData);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Auto-refresh pending users every 30 seconds so new manager requests appear
    const intervalId = setInterval(() => refreshPendingUsers(), 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleMarkMessageRead = async (id: string) => {
    try {
      await mockApi.markMessageRead(id);
      setMessages(messages.map(m => m._id === id ? { ...m, status: 'read' } : m));
      toast({ title: 'Success', description: 'Message marked as read' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to mark message as read', variant: 'destructive' });
    }
  };

  const handleCloseMessage = async (id: string) => {
    try {
      await mockApi.closeMessage(id);
      setMessages(messages.map(m => m._id === id ? { ...m, status: 'closed' } : m));
      toast({ title: 'Success', description: 'Message closed' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to close message', variant: 'destructive' });
    }
  };

  const displayPendingUsers = pendingUsers.slice(0, 15);

  const handleUserApproval = (userId: string, action: 'approve' | 'reject' | 'view') => {
    if (action === 'view') {
      const u = pendingUsers.find(p => p.id === userId);
      if (u) setSelectedUserForModal(u);
      return;
    }
    if (action === 'approve') {
      updateUserStatus(userId, 'approved');
      toast({ title: 'User Approved', description: 'Registration request accepted successfully.' });
    } else {
      updateUserStatus(userId, 'rejected');
      toast({ title: 'User Rejected', description: 'Registration request rejected.' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':   return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:       return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':  return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default:         return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const hasRevenueData = stats.monthlyRevenue && stats.monthlyRevenue.some((d: any) => d.revenue > 0);
  const hasComplaintData = stats.complaintsByCategory && stats.complaintsByCategory.some((d: any) => d.value > 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name ?? 'Admin'}</p>
        </div>
        <Badge variant="outline" className="text-sm border-primary/40 text-primary">Category: Admin</Badge>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="hover-scale cursor-pointer border-l-4 border-l-secondary" onClick={() => navigate('/admin/pending-approvals')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            <UserCheck className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer border-l-4 border-l-destructive" onClick={() => navigate('/admin/active-complaints')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Complaints</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{complaints.filter(c => c.status !== 'resolved').length}</div>
            <p className="text-xs text-muted-foreground mt-1">{complaints.length} total</p>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer border-l-4 border-l-emerald-400" onClick={() => navigate('/admin/revenue-details')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">₹{(stats.revenue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground mt-1">Total collected revenue</p>
          </CardContent>
        </Card>

        <Card className="hover-scale border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Consumers</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered consumers</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Content Tabs */}
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="approvals">User Approvals</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="auditLogs">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* ── Messages Tab (NEW) ─────────────────────────────────────────────── */}
        <TabsContent value="messages" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Manager Messages</h3>
            <p className="text-sm text-muted-foreground">Internal communications from system managers</p>
          </div>
          {messages.length === 0 ? (
            <Card className="border-dashed border-2 border-border">
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-foreground font-medium">No messages</p>
                <p className="text-muted-foreground text-sm mt-1">Inbox is empty</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {messages.map((msg: any) => (
                <Card key={msg._id} className={`hover-scale ${msg.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {msg.subject}
                          {msg.status === 'unread' && <Badge className="bg-blue-500">New</Badge>}
                        </CardTitle>
                        <CardDescription>
                          From: {msg.senderName} ({msg.senderEmail}) - {new Date(msg.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="capitalize">{msg.priority} Priority</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4 bg-muted/50 p-4 rounded-md whitespace-pre-wrap">{msg.message}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Category: <Badge variant="secondary" className="capitalize">{msg.category}</Badge></span>
                        <span className="text-sm">Status: <Badge variant="outline" className="capitalize">{msg.status}</Badge></span>
                      </div>
                      <div className="flex gap-2">
                        {msg.status === 'unread' && (
                          <Button size="sm" variant="outline" onClick={() => handleMarkMessageRead(msg._id)}>Mark as Read</Button>
                        )}
                        {msg.status !== 'closed' && (
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleCloseMessage(msg._id)}>Close Message</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── User Approvals Tab ─────────────────────────────────────────────── */}
        <TabsContent value="approvals" className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Pending User Approvals
                {displayPendingUsers.length > 0 && (
                  <Badge className="ml-2">{ displayPendingUsers.length}</Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">Review and approve new user registrations</p>
            </div>
            <Button variant="outline" size="sm" onClick={refreshPendingUsers}>
              ↻ Refresh List
            </Button>
          </div>

          {displayPendingUsers.length === 0 ? (
            <Card className="border-dashed border-2 border-border">
              <CardContent className="pt-8 pb-8 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-foreground font-medium">No pending approvals</p>
                <p className="text-muted-foreground text-sm mt-1">All caught up!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {displayPendingUsers.map((u) => (
                <Card key={u.id} className="hover-scale">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getStatusIcon(u.status)}
                          {u.name}
                        </CardTitle>
                        <CardDescription>{u.email}</CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{u.role}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied: {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Status: <Badge variant="secondary">{u.status}</Badge></span>
                        <span className="text-sm">Role: <Badge>{u.role}</Badge></span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleUserApproval(u.id, 'view')}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleUserApproval(u.id, 'reject')}>
                          Reject
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUserApproval(u.id, 'approve')}>
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Complaints Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="complaints" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Complaint Management</h3>
            <p className="text-sm text-muted-foreground">Monitor and resolve consumer complaints</p>
          </div>
          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id || complaint._id} className="hover-scale">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{complaint.title}</CardTitle>
                      <CardDescription>Consumer: {complaint.consumerNumber}</CardDescription>
                      <p className="text-sm text-muted-foreground mt-1">{complaint.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Category: <Badge variant="outline">{complaint.category}</Badge></span>
                      <span className="text-sm">Status: <Badge variant="secondary">{complaint.status}</Badge></span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate('/admin/active-complaints')}>View Details</Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => navigate('/admin/active-complaints')}>Update Status</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Analytics Tab (NEW) ────────────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Analytics & Reports</h3>
            <p className="text-sm text-muted-foreground">Revenue trends and complaint distribution</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Revenue Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Revenue (₹ Millions)</CardTitle>
                <CardDescription>Oct 2023 – Mar 2024</CardDescription>
              </CardHeader>
              <CardContent className="h-60 flex items-center justify-center">
                {!hasRevenueData ? (
                  <div className="text-muted-foreground text-sm flex flex-col items-center">
                    <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
                    No revenue data available yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyRevenue || []} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(215, 20%, 65%)' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 20%, 65%)' }} />
                      <Tooltip
                        formatter={(value: number) => [`₹${value}M`, 'Revenue']}
                        contentStyle={{ borderRadius: 8, border: '1px solid hsl(217, 33%, 28%)', background: 'hsl(217, 33%, 17%)', color: '#f8fafc' }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Complaints by Category Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Complaints by Category</CardTitle>
                <CardDescription>Distribution of active complaints</CardDescription>
              </CardHeader>
              <CardContent className="h-60 flex items-center justify-center">
                {!hasComplaintData ? (
                  <div className="text-muted-foreground text-sm flex flex-col items-center">
                    <AlertTriangle className="h-8 w-8 mb-2 opacity-20" />
                    No complaint category data available yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.complaintsByCategory || []}
                        cx="45%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {(stats.complaintsByCategory || []).map((entry: any, index: number) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value}`, 'Complaints']}
                        contentStyle={{ borderRadius: 8, border: '1px solid hsl(217, 33%, 28%)', background: 'hsl(217, 33%, 17%)', color: '#f8fafc' }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'New Registrations', value: '180', color: 'text-primary' },
                  { label: 'Bills Generated', value: '12,456', color: 'text-sky-400' },
                  { label: 'Payments Received', value: '11,890', color: 'text-emerald-400' },
                  { label: 'Complaints Resolved', value: '89%', color: 'text-amber-400' },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-4 rounded-lg bg-muted/40">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <AdminSettings />
        </TabsContent>

        <TabsContent value="auditLogs">
          <AuditLogs />
        </TabsContent>
      </Tabs>
      
      <ApprovalDetailsModal 
        user={selectedUserForModal} 
        onClose={() => setSelectedUserForModal(null)} 
      />
    </div>
  );
};

export default AdminDashboard;