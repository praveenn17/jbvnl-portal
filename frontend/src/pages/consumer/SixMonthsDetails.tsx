import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Zap, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/lib/mockApi';
import { Bill } from '@/types';

const SixMonthsDetails: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const cNum = user?.consumerNumber || (user as any)?.consumerNumber;
        if (cNum) {
          const fetchedBills = await mockApi.getBills(cNum);
          // Sort by date ascending to easily calculate trends, 
          // or keep them descending but handle carefully.
          // Let's sort ascending for accurate trend calculation (oldest to newest)
          const sorted = fetchedBills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
          // Limit to exactly 6 months if there are more
          setBills(sorted.slice(-6));
        }
      } catch (err) {
        console.error('Failed to fetch bills for 6-months overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [user]);

  const getBillStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalUnits = bills.reduce((sum, b) => sum + b.units, 0);
  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const averageUnits = bills.length > 0 ? Math.round(totalUnits / bills.length) : 0;
  const averageAmount = bills.length > 0 ? Math.round(totalAmount / bills.length) : 0;

  // Compute trend compared to the previous month
  const monthlyData = bills.map((bill, index) => {
    let trend = 'down'; // Default
    if (index > 0) {
      if (bill.units > bills[index - 1].units) {
        trend = 'up';
      }
    }
    return {
      id: bill._id || bill.id,
      month: bill.billingPeriod,
      units: bill.units,
      amount: bill.amount,
      status: bill.status,
      trend,
    };
  }).reverse(); // Reverse so newest is on top

  // Find insights
  let highestUsage = { month: 'N/A', units: 0 };
  let lowestUsage = { month: 'N/A', units: Infinity };
  let highestBill = { month: 'N/A', amount: 0 };
  let lowestBill = { month: 'N/A', amount: Infinity };

  bills.forEach(b => {
    if (b.units > highestUsage.units) highestUsage = { month: b.billingPeriod, units: b.units };
    if (b.units < lowestUsage.units) lowestUsage = { month: b.billingPeriod, units: b.units };
    if (b.amount > highestBill.amount) highestBill = { month: b.billingPeriod, amount: b.amount };
    if (b.amount < lowestBill.amount) lowestBill = { month: b.billingPeriod, amount: b.amount };
  });

  if (lowestUsage.units === Infinity) lowestUsage.units = 0;
  if (lowestBill.amount === Infinity) lowestBill.amount = 0;

  const variance = highestUsage.units - lowestUsage.units;
  const variancePercent = lowestUsage.units > 0 ? Math.round((variance / lowestUsage.units) * 100) : 0;

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
            <p className="text-muted-foreground">Detailed consumption and billing history for {user?.name}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bills.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
              <p className="text-muted-foreground">We couldn't find any bill history for your account.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Total Units Consumed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUnits}</div>
                  <p className="text-xs opacity-80">Last {bills.length} months</p>
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
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-500" />
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
                          <p className="text-lg font-semibold flex items-center justify-center gap-1">
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
                          <Badge className={getBillStatusColor(data.status)}>{data.status.toUpperCase()}</Badge>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/consumer/bill-details/${data.id || index + 1}`)}
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
                        <span className="font-medium">{highestUsage.month} ({highestUsage.units} units)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Lowest Usage:</span>
                        <span className="font-medium">{lowestUsage.month} ({lowestUsage.units} units)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Variance:</span>
                        <span className="font-medium">{variance} units ({variancePercent}% difference)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Cost Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Highest Bill:</span>
                        <span className="font-medium">₹{highestBill.amount.toLocaleString()} ({highestBill.month})</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Lowest Bill:</span>
                        <span className="font-medium">₹{lowestBill.amount.toLocaleString()} ({lowestBill.month})</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Rate per Unit:</span>
                        <span className="font-medium">₹{(averageUnits > 0 ? (averageAmount / averageUnits) : 0).toFixed(2)} (Average)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default SixMonthsDetails;