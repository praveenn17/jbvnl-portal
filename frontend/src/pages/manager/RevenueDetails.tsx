import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const RevenueDetails: React.FC = () => {
  const navigate = useNavigate();

  const monthlyRevenue = [
    { month: 'Jan 2024', revenue: 2.1, collections: 1.9, outstanding: 0.2 },
    { month: 'Feb 2024', revenue: 2.3, collections: 2.1, outstanding: 0.2 },
    { month: 'Mar 2024', revenue: 2.5, collections: 2.3, outstanding: 0.2 },
    { month: 'Apr 2024', revenue: 2.2, collections: 2.0, outstanding: 0.2 },
    { month: 'May 2024', revenue: 2.8, collections: 2.5, outstanding: 0.3 },
    { month: 'Jun 2024', revenue: 3.1, collections: 2.8, outstanding: 0.3 },
    { month: 'Jul 2024', revenue: 3.3, collections: 3.0, outstanding: 0.3 },
    { month: 'Aug 2024', revenue: 2.9, collections: 2.7, outstanding: 0.2 },
    { month: 'Sep 2024', revenue: 2.7, collections: 2.5, outstanding: 0.2 },
    { month: 'Oct 2024', revenue: 2.4, collections: 2.2, outstanding: 0.2 },
    { month: 'Nov 2024', revenue: 2.6, collections: 2.4, outstanding: 0.2 },
    { month: 'Dec 2024', revenue: 2.4, collections: 2.2, outstanding: 0.2 }
  ];

  const zoneWiseRevenue = [
    { zone: 'North Bihar', revenue: 8.2, percentage: 28 },
    { zone: 'South Bihar', revenue: 7.1, percentage: 24 },
    { zone: 'East Bihar', revenue: 6.3, percentage: 21 },
    { zone: 'West Bihar', revenue: 4.9, percentage: 17 },
    { zone: 'Central Bihar', revenue: 2.9, percentage: 10 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Revenue Analytics - Last 12 Months
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive revenue analysis and financial insights
            </p>
          </div>
        </div>

        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹29.4M</div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <TrendingUp className="h-3 w-3" />
                +12.5% from last year
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Collections</CardTitle>
                <BarChart3 className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹26.6M</div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <TrendingUp className="h-3 w-3" />
                90.5% collection rate
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Outstanding</CardTitle>
                <TrendingDown className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹2.8M</div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <TrendingDown className="h-3 w-3" />
                9.5% pending
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Avg Monthly</CardTitle>
                <BarChart3 className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹2.45M</div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <TrendingUp className="h-3 w-3" />
                Steady growth
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue vs Collections over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}M`, '']} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Total Revenue" />
                <Area type="monotone" dataKey="collections" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Collections" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Zone-wise Revenue Distribution */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Zone-wise Revenue Distribution</CardTitle>
              <CardDescription>Revenue contribution by geographical zones</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={zoneWiseRevenue}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    label={({ zone, percentage }) => `${zone}: ${percentage}%`}
                  >
                    {zoneWiseRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value}M`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Collection Rate Comparison */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Zone-wise Collection Rate</CardTitle>
              <CardDescription>Revenue collection performance by zone</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={zoneWiseRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}M`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Insights */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Key Revenue Insights</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">₹3.3M</div>
              <p className="opacity-90">Highest monthly revenue (July 2024)</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">90.5%</div>
              <p className="opacity-90">Average collection efficiency</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">12.5%</div>
              <p className="opacity-90">Year-over-year growth</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueDetails;