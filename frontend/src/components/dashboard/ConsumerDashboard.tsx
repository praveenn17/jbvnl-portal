
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Bill, Complaint } from '../../types';
import {
  Calendar, CreditCard, FileText, MessageSquare, Plus, AlertCircle,
  CheckCircle, Clock, User, Settings, Power, Edit, Shield, Smartphone, Wifi,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '../../lib/mockApi';
import { generateMockBills, deriveBillAnalytics } from '@/pages/consumer/SixMonthsDetails';

// ── Component ────────────────────────────────────────────────────────────────

const ConsumerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bills,      setBills]      = useState<Bill[]>([]);
  const [sixMonthDs, setSixMonthDs] = useState<Bill[]>([]); // shared 6-month dataset
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats,      setStats]      = useState<any>(null);
  const [loading,    setLoading]    = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const cNum = user?.consumerNumber || (user as any)?.consumerNumber || '0000';
      try {
        const [billsData, complaintsData, statsData] = await Promise.all([
          mockApi.getBills(cNum),
          mockApi.getComplaints(cNum),
          mockApi.getDashboardStats().catch(() => null),
        ]);
        setBills(billsData);
        setComplaints(complaintsData);
        setStats(statsData);

        // Build the shared 6-month dataset (same logic as SixMonthsDetails)
        const sorted = billsData.sort(
          (a: Bill, b: Bill) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        const recent = sorted.slice(-6);
        setSixMonthDs(recent.length > 0 ? recent : generateMockBills(cNum));
      } catch {
        // Fallback to mock data on error
        const mock = generateMockBills(cNum);
        setBills(mock);
        setSixMonthDs(mock);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // ── Chart data: map 6-month dataset to chart format ────────────────────────
  const chartData = sixMonthDs.map(b => ({
    month:  new Date(b.dueDate).toLocaleString('en-IN', { month: 'short' }),
    amount: b.amount,
    units:  b.units,
  }));

  // ── Analytics: single source of truth ─────────────────────────────────────
  const analytics = deriveBillAnalytics(sixMonthDs);

  // Latest bill (most recent, by sorted order)
  const latestBill = sixMonthDs.length > 0 ? sixMonthDs[sixMonthDs.length - 1] : null;


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
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <User className="h-6 w-6 text-primary" />
            Welcome, {user?.name ?? 'Consumer'}
          </h1>
          <p className="text-muted-foreground">
            Consumer Number: {user?.consumerNumber || '—'} &bull; Category: Consumer
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
              <p className="font-medium">{user?.phone || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{user?.address || '—'}</p>
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
            {loading ? (
             <div className="animate-pulse h-8 bg-muted rounded w-1/2"></div>
            ) : (() => {
              // Use latest bill from shared 6-month dataset as source of truth
              const amt = latestBill?.amount ?? 0;
              const billStatus = latestBill?.status ?? 'paid';
              return (
                <>
                  <div className="text-2xl font-bold text-primary">
                    ₹{amt.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {billStatus === 'pending' || billStatus === 'overdue' ? 'Payment due' : 'Latest paid bill'}
                  </p>
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Consumed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
               <div className="animate-pulse h-8 bg-muted rounded w-1/2"></div>
            ) : (() => {
              const units = latestBill?.units ?? analytics.averageUnits;
              return (
                <>
                  <div className="text-2xl font-bold">{units} kWh</div>
                  <p className="text-xs text-muted-foreground">Latest month reading</p>
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="animate-pulse h-8 bg-muted rounded w-1/4"></div>
            ) : (() => {
              const active = stats?.activeComplaints ?? complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length;
              return (
                <>
                  <div className="text-2xl font-bold text-secondary">
                    {active}
                  </div>
                  <p className="text-xs text-muted-foreground">{active > 0 ? 'In Progress' : 'No active complaints'}</p>
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="animate-pulse h-8 bg-muted rounded w-2/3"></div>
            ) : (() => {
              // Payment status based on latest bill from shared dataset
              const pStatus = latestBill
                ? (latestBill.status === 'paid' ? 'Up to Date' : 'Payment Due')
                : 'Up to Date';
              return (
                <>
                  <div className={`text-2xl font-bold ${
                    pStatus === 'Payment Due' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {pStatus}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pStatus === 'Payment Due' ? 'Payment required' : 'All bills paid'}
                  </p>
                </>
              );
            })()}
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
            {bills.length > 0 ? bills.map((bill) => (
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
                      <Button variant="outline" size="sm" onClick={() => navigate(`/consumer/bill-details/${bill._id || bill.id}`)}>
                        View Details
                      </Button>
                      {bill.status === 'pending' && (
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90" onClick={() => handlePayBill(bill._id || bill.id)}>
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-10 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground mb-4">You have no bills history available.</p>
                <Button variant="outline" onClick={() => navigate('/consumer/form/billing-concern')}>Raise Billing Concern</Button>
              </div>
            )}
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
            {complaints.length > 0 ? complaints.map((complaint: any) => (
              <Card key={complaint._id || complaint.id} className="hover-scale">
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
                    <Button variant="outline" size="sm" onClick={() => navigate(`/consumer/complaint-tracking/${complaint._id || complaint.id}`)}>
                      Track Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-10 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground mb-4">You haven't registered any complaints.</p>
                <Button variant="outline" onClick={() => navigate('/consumer/form/register-complaint')}>Register New Complaint</Button>
              </div>
            )}
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
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(215, 20%, 65%)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 20%, 65%)' }} />
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                      contentStyle={{ borderRadius: 8, border: '1px solid hsl(217, 33%, 28%)', background: 'hsl(217, 33%, 17%)', color: '#f8fafc' }}
                      labelStyle={{ color: '#94a3b8' }}
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
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="unitsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(215, 20%, 65%)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'hsl(215, 20%, 65%)' }} />
                    <Tooltip
                      formatter={(value: number) => [`${value} kWh`, 'Units']}
                      contentStyle={{ borderRadius: 8, border: '1px solid hsl(217, 33%, 28%)', background: 'hsl(217, 33%, 17%)', color: '#f8fafc' }}
                      labelStyle={{ color: '#94a3b8' }}
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

          {/* Summary stats row — driven by shared analytics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Monthly Bill',  value: `₹${analytics.averageAmount.toLocaleString()}` },
              { label: 'Avg Units/Month',   value: `${analytics.averageUnits} kWh` },
              { label: 'Highest Bill',      value: `₹${analytics.highestBill.amount.toLocaleString()}` },
              { label: 'Lowest Bill',       value: `₹${analytics.lowestBill.amount.toLocaleString()}` },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-primary mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}}
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
                  { label: 'Consumer Number', value: user?.consumerNumber || '—' },
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
