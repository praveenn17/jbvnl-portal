
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Bill, Complaint } from '../../types';
import {
  Calendar, CreditCard, FileText, MessageSquare, Plus, AlertCircle,
  CheckCircle, Clock, User, Settings, Power, Edit, Shield, Smartphone, Wifi,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// ── Mock data ────────────────────────────────────────────────────────────────

const sixMonthBills = [
  { month: 'Oct', amount: 1650, units: 165 },
  { month: 'Nov', amount: 1920, units: 192 },
  { month: 'Dec', amount: 2340, units: 234 },
  { month: 'Jan', amount: 2100, units: 210 },
  { month: 'Feb', amount: 1890, units: 189 },
  { month: 'Mar', amount: 2450, units: 245 },
];

const INITIAL_BILLS: Bill[] = [
  {
    id: '1',
    consumerNumber: 'JBVNL001',
    billNumber: 'BILL001',
    billingPeriod: 'March 2024',
    dueDate: '2024-04-15',
    amount: 2450,
    status: 'pending',
    units: 245,
    createdAt: '2024-03-01',
  },
  {
    id: '2',
    consumerNumber: 'JBVNL001',
    billNumber: 'BILL002',
    billingPeriod: 'February 2024',
    dueDate: '2024-03-15',
    amount: 1890,
    status: 'paid',
    units: 189,
    createdAt: '2024-02-01',
  },
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: '1',
    consumerNumber: 'JBVNL001',
    title: 'Billing Discrepancy',
    description: 'Units calculation seems incorrect for this month',
    category: 'billing',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-12',
  },
];

// ── Component ────────────────────────────────────────────────────────────────

import { mockApi } from '../../lib/mockApi';

const ConsumerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bills, setBills] = useState<Bill[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (user?.consumerNumber || (user as any)?.consumerNumber) {
        const cNum = user.consumerNumber || (user as any).consumerNumber;
        const [billsData, complaintsData] = await Promise.all([
          mockApi.getBills(cNum),
          mockApi.getComplaints(cNum)
        ]);
        setBills(billsData);
        setComplaints(complaintsData);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const pendingBill = bills.find(b => b.status === 'pending');
  const hasPendingBills = !!pendingBill;

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplaintStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  // ── Pay bill handler ───────────────────────────────────────────────────────

  const handlePayBill = (billId: string) => {
    navigate('/consumer/payment', { state: { billId } });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Consumer Info Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Welcome, {user?.name ?? 'Consumer'}
          </h1>
          <p className="text-muted-foreground">
            Consumer Number: JBVNL001 &bull; Category: Consumer
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/consumer/six-months')}>
            <Calendar className="h-4 w-4 mr-2" />
            6 Months Overview
          </Button>
          <Button variant="outline" onClick={() => navigate('/consumer/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Consumer Basic Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Consumer Details</CardTitle>
          <CardDescription>Your basic information and connection details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">+91 9876543210</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">123 Main Street, Ranchi, Jharkhand</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={() => navigate('/consumer/profile')}>
              <User className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Bill</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {pendingBill ? `₹${pendingBill.amount.toLocaleString()}` : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingBill ? `Due: ${new Date(pendingBill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'No pending bills'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Consumed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBill?.units ?? '—'}</div>
            <p className="text-xs text-muted-foreground">
              {pendingBill ? pendingBill.billingPeriod : 'Latest month'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {complaints.filter(c => c.status !== 'resolved').length}
            </div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasPendingBills ? 'text-yellow-600' : 'text-green-600'}`}>
              {hasPendingBills ? 'Due' : 'Up to Date'}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasPendingBills ? 'Payment pending' : 'All bills paid'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button onClick={() => navigate('/consumer/form/new-connection')} className="h-16 bg-primary hover:bg-primary/90">
          <Plus className="h-5 w-5 mr-2" />
          Apply for New Connection
        </Button>
        <Button onClick={() => navigate('/consumer/form/disable-connection')} variant="outline" className="h-16">
          <Power className="h-5 w-5 mr-2" />
          Disable Connection
        </Button>
        <Button onClick={() => navigate('/consumer/form/register-complaint')} variant="outline" className="h-16">
          <MessageSquare className="h-5 w-5 mr-2" />
          Register Complaint
        </Button>
        <Button onClick={() => navigate('/consumer/form/edit-details')} variant="outline" className="h-16">
          <Edit className="h-5 w-5 mr-2" />
          Edit Details
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="bills" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bills">My Bills</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="profile">Connection Info</TabsTrigger>
        </TabsList>

        {/* ── Bills Tab ─────────────────────────────────────────────────────── */}
        <TabsContent value="bills" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-lg font-semibold">Billing History</h3>
              <p className="text-sm text-muted-foreground">Manage your electricity bills and payments</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/consumer/six-months')} className="bg-primary hover:bg-primary/90">
                <Calendar className="h-4 w-4 mr-2" />
                View 6 Months History
              </Button>
              <Button onClick={() => navigate('/consumer/form/billing-concern')} variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Raise Concern
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {bills.map((bill) => (
              <Card key={bill.id} className="hover-scale">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{bill.billingPeriod}</CardTitle>
                      <CardDescription>Bill No: {bill.billNumber}</CardDescription>
                    </div>
                    <Badge className={getBillStatusColor(bill.status)}>{bill.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-xl font-bold text-primary">₹{bill.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Units</p>
                      <p className="text-lg font-semibold">{bill.units}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="text-lg font-semibold">{new Date(bill.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 items-end">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/consumer/bill-details/${bill.id}`)}>
                        View Details
                      </Button>
                      {bill.status === 'pending' && (
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90" onClick={() => handlePayBill(bill.id)}>
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Complaints Tab ────────────────────────────────────────────────── */}
        <TabsContent value="complaints" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">My Complaints</h3>
              <p className="text-sm text-muted-foreground">Track and manage your service complaints</p>
            </div>
          </div>

          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="hover-scale">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getComplaintStatusIcon(complaint.status)}
                        {complaint.title}
                      </CardTitle>
                      <CardDescription>{complaint.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{complaint.category}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Priority: <Badge variant="secondary">{complaint.priority}</Badge></span>
                      <span className="text-sm">Status: <Badge>{complaint.status}</Badge></span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/consumer/complaint-tracking/${complaint.id}`)}>
                      Track Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Analytics Tab (NEW) ───────────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Usage Analytics</h3>
            <p className="text-sm text-muted-foreground">Your consumption and billing trends over the last 6 months</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Bill Amount Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Bill Amount (₹)</CardTitle>
                <CardDescription>Oct 2023 – Mar 2024</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sixMonthBills} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                      contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Units Consumed Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Units Consumed (kWh)</CardTitle>
                <CardDescription>Consumption trend over 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sixMonthBills} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="unitsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value} kWh`, 'Units']}
                      contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="units"
                      stroke="hsl(var(--primary))"
                      fill="url(#unitsGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Monthly Bill', value: `₹${Math.round(sixMonthBills.reduce((s, b) => s + b.amount, 0) / sixMonthBills.length).toLocaleString()}` },
              { label: 'Avg Units/Month', value: `${Math.round(sixMonthBills.reduce((s, b) => s + b.units, 0) / sixMonthBills.length)} kWh` },
              { label: 'Highest Bill', value: `₹${Math.max(...sixMonthBills.map(b => b.amount)).toLocaleString()}` },
              { label: 'Lowest Bill', value: `₹${Math.min(...sixMonthBills.map(b => b.amount)).toLocaleString()}` },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-primary mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Connection Info Tab ───────────────────────────────────────────── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Connection Information</CardTitle>
              <CardDescription>Your electricity connection details and technical specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Consumer Number', value: 'JBVNL001' },
                  { label: 'Connection Type', value: 'Residential' },
                  { label: 'Sanctioned Load', value: '5 KW' },
                  { label: 'Tariff Category', value: 'LT-1A' },
                  { label: 'Meter Number', value: 'MTR123456' },
                  { label: 'Connection Date', value: '15-Jan-2020' },
                  { label: 'Supply Voltage', value: '230V Single Phase' },
                  { label: 'Billing Cycle', value: 'Monthly' },
                ].map(item => (
                  <div key={item.label}>
                    <label className="text-sm font-medium text-muted-foreground">{item.label}</label>
                    <p className="text-lg font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <Button onClick={() => navigate('/consumer/profile')} className="bg-primary hover:bg-primary/90">
                  Update Profile
                </Button>
                <Button variant="outline" onClick={() => navigate('/consumer/form/edit-details')}>
                  Request Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Services Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Available Services</h3>
          <p className="text-sm text-muted-foreground">Access JBVNL online services and raise concerns</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Power Quality Monitoring', desc: 'Report voltage fluctuations and power quality issues', form: 'service-concern' },
            { icon: Smartphone, title: 'SMS Alert Service', desc: 'Get bill reminders and outage notifications via SMS', form: 'service-concern' },
            { icon: Wifi, title: 'Online Bill Service', desc: 'Digital bill delivery and payment notifications', form: 'service-concern' },
          ].map(({ icon: Icon, title, desc, form }) => (
            <Card key={title} className="hover-scale cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {title}
                </CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/consumer/form/${form}`)}>
                  Raise Concern
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
