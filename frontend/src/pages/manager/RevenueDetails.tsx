import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { mockApi } from '@/lib/mockApi';
import { generateMockBills } from '@/pages/consumer/SixMonthsDetails';

const RevenueDetails: React.FC = () => {
  const navigate = useNavigate();
  const [totalRevenue, setTotalRevenue] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [monthlyRevenueData, setMonthlyRevenueData] = React.useState<any[]>([]);
  const [highestMonth, setHighestMonth] = React.useState<{month: string, revenue: number}>({ month: 'N/A', revenue: 0 });

  React.useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const consumers = await mockApi.getConsumersForManager().catch(() => []);
        let calculated = 0;
        const monthlyMap: Record<string, number> = {};
        
        // TODO: Replace generateMockBills with mockApi.getBills(consumerNumber) when payment API is ready
        if (consumers && Array.isArray(consumers)) {
          consumers.forEach((consumer: any) => {
            const bills = generateMockBills(consumer.consumerNumber);
            bills.forEach((bill: any) => {
              const amount = bill.amount || 0;
              calculated += amount;
              const month = bill.billingPeriod || 'Unknown';
              if (!monthlyMap[month]) monthlyMap[month] = 0;
              monthlyMap[month] += amount;
            });
          });
        }

        const dynamicMonthlyRevenue = Object.entries(monthlyMap).map(([month, rev]) => {
          const revL = rev / 100000;
          return {
            month,
            revenue: Number(revL.toFixed(2)),
            collections: Number((revL * 0.905).toFixed(2)),
            outstanding: Number((revL * 0.095).toFixed(2)),
            rawRevenue: rev
          };
        }).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        let maxRev = 0;
        let maxMonth = 'N/A';
        dynamicMonthlyRevenue.forEach(d => {
          if (d.rawRevenue > maxRev) {
            maxRev = d.rawRevenue;
            maxMonth = d.month;
          }
        });

        setTotalRevenue(calculated);
        setMonthlyRevenueData(dynamicMonthlyRevenue);
        setHighestMonth({ month: maxMonth, revenue: maxRev });
      } catch (err) {
        console.error('Failed to calculate revenue:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  const collections = totalRevenue * 0.905;
  const outstanding = totalRevenue * 0.095;
  const avgMonthly = totalRevenue / 6;

  const zoneWiseRevenue = [
    { zone: 'North Jharkhand', revenue: 8.2, percentage: 28 },
    { zone: 'South Jharkhand', revenue: 7.1, percentage: 24 },
    { zone: 'East Jharkhand', revenue: 6.3, percentage: 21 },
    { zone: 'West Jharkhand', revenue: 4.9, percentage: 17 },
    { zone: 'Central Jharkhand', revenue: 2.9, percentage: 10 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-background p-6">
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
              <div className="text-3xl font-bold">{loading ? '...' : `₹${(totalRevenue / 100000).toFixed(1)}L`}</div>
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
              <div className="text-3xl font-bold">{loading ? '...' : `₹${(collections / 100000).toFixed(1)}L`}</div>
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
              <div className="text-3xl font-bold">{loading ? '...' : `₹${(outstanding / 100000).toFixed(1)}L`}</div>
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
              <div className="text-3xl font-bold">{loading ? '...' : `₹${(avgMonthly / 100000).toFixed(1)}L`}</div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <TrendingUp className="h-3 w-3" />
                Steady growth
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card className="mb-8 bg-muted/10 border border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue vs Collections over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}L`, '']} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Total Revenue" />
                <Area type="monotone" dataKey="collections" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Collections" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Zone-wise Revenue Distribution */}
          <Card className="bg-muted/10 border border-border">
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
                  <Tooltip formatter={(value) => [`₹${value}L`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Collection Rate Comparison */}
          <Card className="bg-muted/10 border border-border">
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
                  <Tooltip formatter={(value) => [`₹${value}L`, 'Revenue']} />
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
              <div className="text-3xl font-bold mb-2">{loading ? '...' : `₹${(highestMonth.revenue / 100000).toFixed(1)}L`}</div>
              <p className="opacity-90">Highest monthly revenue ({loading ? '...' : highestMonth.month})</p>
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