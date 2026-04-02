import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, Zap, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const ReportsAnalytics: React.FC = () => {
  const navigate = useNavigate();

  const monthlyData = [
    { month: 'Jan', consumers: 45000, revenue: 2.1, complaints: 120, resolved: 115 },
    { month: 'Feb', consumers: 46200, revenue: 2.3, complaints: 98, resolved: 95 },
    { month: 'Mar', consumers: 47800, revenue: 2.5, complaints: 145, resolved: 140 },
    { month: 'Apr', consumers: 48900, revenue: 2.2, complaints: 87, resolved: 85 },
    { month: 'May', consumers: 50100, revenue: 2.8, complaints: 156, resolved: 150 },
    { month: 'Jun', consumers: 51500, revenue: 3.1, complaints: 134, resolved: 128 },
    { month: 'Jul', consumers: 52800, revenue: 3.3, complaints: 167, resolved: 160 },
    { month: 'Aug', consumers: 53600, revenue: 2.9, complaints: 142, resolved: 138 },
    { month: 'Sep', consumers: 54200, revenue: 2.7, complaints: 118, resolved: 115 },
    { month: 'Oct', consumers: 54800, revenue: 2.4, complaints: 109, resolved: 105 },
    { month: 'Nov', consumers: 55400, revenue: 2.6, complaints: 95, resolved: 92 },
    { month: 'Dec', consumers: 56000, revenue: 2.4, complaints: 103, resolved: 100 }
  ];

  const categoryData = [
    { category: 'Billing Issues', count: 456, percentage: 35 },
    { category: 'Power Outages', count: 298, percentage: 23 },
    { category: 'Connection Requests', count: 234, percentage: 18 },
    { category: 'Meter Problems', count: 156, percentage: 12 },
    { category: 'Line Faults', count: 98, percentage: 8 },
    { category: 'Others', count: 52, percentage: 4 }
  ];

  const zonePerformance = [
    { zone: 'North Bihar', revenue: 8.2, consumers: 12500, efficiency: 92 },
    { zone: 'South Bihar', revenue: 7.1, consumers: 11200, efficiency: 89 },
    { zone: 'East Bihar', revenue: 6.3, consumers: 10800, efficiency: 87 },
    { zone: 'West Bihar', revenue: 4.9, consumers: 9800, efficiency: 85 },
    { zone: 'Central Bihar', revenue: 2.9, consumers: 8700, efficiency: 88 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Analytics & Reports - Last 12 Months
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive analytics across all operational categories
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Total Consumers</CardTitle>
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">56,000</div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <TrendingUp className="h-3 w-3" />
                +24.4% growth
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Annual Revenue</CardTitle>
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹31.3M</div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <TrendingUp className="h-3 w-3" />
                +18.2% increase
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Total Complaints</CardTitle>
                <AlertTriangle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,494</div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <CheckCircle className="h-3 w-3" />
                96.8% resolved
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">System Efficiency</CardTitle>
                <Zap className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">88.2%</div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <TrendingUp className="h-3 w-3" />
                +3.4% improvement
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consumer Growth Trend */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Consumer Growth & Revenue Trend</CardTitle>
            <CardDescription>Monthly consumer acquisition and revenue generation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'consumers') return [value.toLocaleString(), 'Consumers'];
                    if (name === 'revenue') return [`₹${value}M`, 'Revenue'];
                    return [value, name];
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="consumers" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="consumers" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ff7300" strokeWidth={3} name="revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Complaint Categories */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Complaint Categories Distribution</CardTitle>
              <CardDescription>Breakdown of complaints by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Complaints']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Zone Performance */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Zone-wise Performance</CardTitle>
              <CardDescription>Revenue and efficiency by geographical zones</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={zonePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'revenue') return [`₹${value}M`, 'Revenue'];
                    if (name === 'efficiency') return [`${value}%`, 'Efficiency'];
                    return [value, name];
                  }} />
                  <Bar dataKey="revenue" fill="#8884d8" name="revenue" />
                  <Bar dataKey="efficiency" fill="#82ca9d" name="efficiency" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Complaint Resolution Trend */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Complaint Resolution Trend</CardTitle>
            <CardDescription>Monthly complaint volume and resolution rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="complaints" stroke="#ff7300" strokeWidth={2} name="Complaints Received" />
                <Line type="monotone" dataKey="resolved" stroke="#00c49f" strokeWidth={2} name="Complaints Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Key Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">96.8%</div>
              <p className="opacity-90">Complaint Resolution Rate</p>
              <p className="text-sm opacity-75">1,447 out of 1,494 resolved</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24.4%</div>
              <p className="opacity-90">Consumer Base Growth</p>
              <p className="text-sm opacity-75">11,000 new consumers added</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">88.2%</div>
              <p className="opacity-90">Overall System Efficiency</p>
              <p className="text-sm opacity-75">3.4% improvement over last year</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsAnalytics;