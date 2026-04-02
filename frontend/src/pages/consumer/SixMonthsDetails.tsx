import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SixMonthsDetails: React.FC = () => {
  const navigate = useNavigate();

  const monthlyData = [
    { month: 'October 2023', units: 185, amount: 1850, status: 'paid', trend: 'down' },
    { month: 'November 2023', units: 220, amount: 2200, status: 'paid', trend: 'up' },
    { month: 'December 2023', units: 280, amount: 2800, status: 'paid', trend: 'up' },
    { month: 'January 2024', units: 195, amount: 1950, status: 'paid', trend: 'down' },
    { month: 'February 2024', units: 189, amount: 1890, status: 'paid', trend: 'down' },
    { month: 'March 2024', units: 245, amount: 2450, status: 'pending', trend: 'up' },
  ];

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalUnits = monthlyData.reduce((sum, data) => sum + data.units, 0);
  const totalAmount = monthlyData.reduce((sum, data) => sum + data.amount, 0);
  const averageUnits = Math.round(totalUnits / monthlyData.length);
  const averageAmount = Math.round(totalAmount / monthlyData.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">6 Months Overview</h1>
            <p className="text-muted-foreground">Detailed consumption and billing history for Rahul Kumar</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Units Consumed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnits}</div>
              <p className="text-xs opacity-80">Last 6 months</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
              <p className="text-xs opacity-80">Billed amount</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Average Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageUnits}</div>
              <p className="text-xs opacity-80">Per month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Average Bill</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{averageAmount}</div>
              <p className="text-xs opacity-80">Per month</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Breakdown
            </CardTitle>
            <CardDescription>Detailed month-wise consumption and billing data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {data.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold">{data.month}</p>
                        <p className="text-sm text-muted-foreground">Billing Period</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Units</p>
                      <p className="text-lg font-semibold flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        {data.units}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold text-primary">₹{data.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getBillStatusColor(data.status)}>{data.status}</Badge>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/consumer/bill-details/${index + 1}`)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consumption Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Consumption Insights</CardTitle>
            <CardDescription>Analysis of your electricity usage patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Usage Trends</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Highest Usage:</span>
                    <span className="font-medium">December 2023 (280 units)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lowest Usage:</span>
                    <span className="font-medium">October 2023 (185 units)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Variance:</span>
                    <span className="font-medium">95 units (51% difference)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Cost Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Highest Bill:</span>
                    <span className="font-medium">₹2,800 (December 2023)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lowest Bill:</span>
                    <span className="font-medium">₹1,850 (October 2023)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rate per Unit:</span>
                    <span className="font-medium">₹10.00 (Average)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SixMonthsDetails;