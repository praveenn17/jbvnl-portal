import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Calendar, Zap, TrendingUp, TrendingDown, Loader2,
  Download, CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/lib/mockApi';
import { Bill } from '@/types';
// Exported so ConsumerDashboard can use the exact same dataset for analytics.
export const generateMockBills = (consumerNumber: string): Bill[] => {
  const seed = consumerNumber
    ? consumerNumber.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : 42;

  const statuses: Array<'paid' | 'pending' | 'overdue'> = [
    'paid', 'paid', 'paid', 'paid', 'pending', 'paid',
  ];

  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const monthOffset = 5 - i; // oldest first
    const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const monthName = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const baseUnits = 200 + ((seed + i * 37) % 220);
    const units = Math.round(baseUnits);
    const rate = 6.5;
    const amount = Math.round(units * rate + 80);
    const dueDate = new Date(date.getFullYear(), date.getMonth() + 1, 15);
    return {
      _id: `mock-${consumerNumber}-${i}`,
      id: `mock-${consumerNumber}-${i}`,
      billNumber: `JBVNL-${consumerNumber}-${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`,
      consumerNumber,
      billingPeriod: monthName,
      dueDate: dueDate.toISOString(),
      amount,
      units,
      status: statuses[i],
      createdAt: date.toISOString(),
    } as unknown as Bill;
  });
};
// Single source of truth — used by both this page and ConsumerDashboard.
export const deriveBillAnalytics = (bills: Bill[]) => {
  const totalUnits = bills.reduce((s, b) => s + b.units, 0);
  const totalAmount = bills.reduce((s, b) => s + b.amount, 0);
  const averageUnits = bills.length > 0 ? Math.round(totalUnits / bills.length) : 0;
  const averageAmount = bills.length > 0 ? Math.round(totalAmount / bills.length) : 0;

  let highestUsage = { month: 'N/A', units: 0 };
  let lowestUsage  = { month: 'N/A', units: Infinity };
  let highestBill  = { month: 'N/A', amount: 0 };
  let lowestBill   = { month: 'N/A', amount: Infinity };

  bills.forEach(b => {
    if (b.units > highestUsage.units) highestUsage = { month: b.billingPeriod, units: b.units };
    if (b.units < lowestUsage.units)  lowestUsage  = { month: b.billingPeriod, units: b.units };
    if (b.amount > highestBill.amount) highestBill = { month: b.billingPeriod, amount: b.amount };
    if (b.amount < lowestBill.amount)  lowestBill  = { month: b.billingPeriod, amount: b.amount };
  });

  if (lowestUsage.units  === Infinity) lowestUsage.units  = 0;
  if (lowestBill.amount  === Infinity) lowestBill.amount  = 0;

  const variance        = highestUsage.units - lowestUsage.units;
  const variancePercent = lowestUsage.units > 0 ? Math.round((variance / lowestUsage.units) * 100) : 0;
  const ratePerUnit     = averageUnits > 0 ? (averageAmount / averageUnits) : 0;

  return {
    totalUnits, totalAmount, averageUnits, averageAmount,
    highestUsage, lowestUsage, highestBill, lowestBill,
    variance, variancePercent, ratePerUnit,
  };
};
const generateMockPdf = (bill: {
  billNumber: string; billingPeriod: string; amount: number;
  units: number; status: string; consumerNumber: string;
}) => {
  const content = `
JHARKHAND BID VIDYUT VITRAN NIGAM LIMITED (JBVNL)
=======================================================
ELECTRICITY BILL

Bill Number   : ${bill.billNumber}
Billing Period: ${bill.billingPeriod}
Consumer No.  : ${bill.consumerNumber}
Due Date      : N/A
Units Consumed: ${bill.units} kWh
Bill Amount   : Rs. ${bill.amount.toLocaleString()}
Status        : ${bill.status.toUpperCase()}

Fixed Charge  : Rs. 80
Energy Charge : Rs. ${(bill.amount - 80).toLocaleString()} (@ Rs. ${((bill.amount - 80) / bill.units).toFixed(2)}/unit)

=======================================================
This is a computer-generated bill.
For queries contact: krpraveen2212@gmail.com
`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `Bill_${bill.billNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
const SixMonthsDetails: React.FC = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [bills,   setBills]   = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const cNum = user?.consumerNumber || (user as any)?.consumerNumber;
        if (cNum) {
          const fetched = await mockApi.getBills(cNum);
          const sorted  = fetched.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
          const recent  = sorted.slice(-6);
          setBills(recent.length > 0 ? recent : generateMockBills(cNum));
        } else {
          setBills(generateMockBills('0000'));
        }
      } catch {
        setBills(generateMockBills(user?.consumerNumber || '0000'));
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [user]);
  const {
    totalUnits, totalAmount, averageUnits, averageAmount,
    highestUsage, lowestUsage, highestBill, lowestBill,
    variance, variancePercent, ratePerUnit,
  } = deriveBillAnalytics(bills);
  const monthlyData = bills.map((bill, index) => ({
    id:     bill._id || bill.id,
    month:  bill.billingPeriod,
    units:  bill.units,
    amount: bill.amount,
    status: bill.status,
    dueDate: bill.dueDate,
    billNumber: bill.billNumber,
    consumerNumber: bill.consumerNumber,
    trend: index > 0 && bill.units > bills[index - 1].units ? 'up' : 'down',
  })).reverse();

  const getBillStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const isUnpaid = (status: string) =>
    status === 'pending' || status === 'overdue';

  const handleDownload = async (data: typeof monthlyData[0]) => {
    if (data.id && !data.id.startsWith('mock-')) {
      try {
        const token = localStorage.getItem('jbvnl_token');
        const baseURL = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(`${baseURL}/api/bills/${data.id}/download`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to download PDF');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `JBVNL-Bill-${data.billNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      } catch (error) {
        console.error('Error downloading real PDF', error);
      }
    }
    generateMockPdf({
      billNumber:     data.billNumber,
      billingPeriod:  data.month,
      amount:         data.amount,
      units:          data.units,
      status:         data.status,
      consumerNumber: data.consumerNumber,
    });
  };
  const summaryCards = [
    { label: 'Total Units Consumed', value: `${totalUnits} kWh`,        sub: `Last ${bills.length} months`, gradient: 'from-blue-600 to-blue-700' },
    { label: 'Total Amount Billed',  value: `₹${totalAmount.toLocaleString()}`, sub: 'Billed amount',      gradient: 'from-emerald-600 to-emerald-700' },
    { label: 'Average Units / Month',value: `${averageUnits} kWh`,       sub: 'Monthly average',           gradient: 'from-violet-600 to-violet-700' },
    { label: 'Average Bill / Month', value: `₹${averageAmount.toLocaleString()}`, sub: 'Monthly average',  gradient: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_hsl(215,60%,10%)_0%,_hsl(220,40%,6%)_40%,_hsl(225,35%,4%)_100%)] dark:bg-[radial-gradient(ellipse_at_top_left,_hsl(215,60%,10%)_0%,_hsl(220,40%,6%)_40%,_hsl(225,35%,4%)_100%)] p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white bg-white/5"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">6 Months Overview</h1>
            <p className="text-white/60 text-sm mt-0.5">
              Detailed consumption and billing history for <span className="text-white/80 font-medium">{user?.name}</span>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          </div>
        ) : (
          <>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {summaryCards.map(card => (
                <div
                  key={card.label}
                  className={`bg-gradient-to-br ${card.gradient} rounded-xl p-5 text-white shadow-lg`}
                >
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-white/60 mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-white/70" />
                  <h2 className="text-lg font-semibold text-white">Monthly Breakdown</h2>
                </div>
                <p className="text-sm text-white/50 mt-0.5">Detailed month-wise consumption and billing data</p>
              </div>

              <div className="divide-y divide-white/5">
                {monthlyData.map((data, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 hover:bg-white/[0.04] transition-colors"
                  >
                    
                    <div className="flex items-center gap-3 min-w-[160px]">
                      {data.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-red-400 shrink-0" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-white text-sm">{data.month}</p>
                        <p className="text-xs text-white/40">Billing Period</p>
                      </div>
                    </div>

                    
                    <div className="grid grid-cols-3 gap-6 text-center flex-1">
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Units</p>
                        <p className="font-semibold text-white flex items-center justify-center gap-1">
                          <Zap className="h-3.5 w-3.5 text-yellow-400" />
                          {data.units}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Amount</p>
                        <p className="font-semibold text-blue-300">₹{data.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Status</p>
                        <Badge className={getBillStatusColor(data.status)}>
                          {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    
                    <div className="flex justify-end gap-2">
                        {isUnpaid(data.status) && (
                          data.id?.startsWith('mock-') ? (
                            <span className="text-xs text-muted-foreground flex items-center px-2">Mock bill cannot be paid</span>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 border-0"
                              onClick={() => navigate('/consumer/payment', { state: { bill: { _id: data.id, ...data } } })}
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Pay Now
                            </Button>
                          )
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white bg-white/5 gap-1.5"
                          onClick={() => handleDownload(data)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download Bill
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  Usage Trends
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Highest Usage', value: `${highestUsage.month} — ${highestUsage.units} kWh` },
                    { label: 'Lowest Usage',  value: `${lowestUsage.month} — ${lowestUsage.units} kWh` },
                    { label: 'Variance',       value: `${variance} kWh  (${variancePercent}% swing)` },
                    { label: 'Avg Rate',       value: `₹${ratePerUnit.toFixed(2)} / unit` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-sm text-white/50">{row.label}</span>
                      <span className="text-sm font-medium text-white/90">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  Cost Analysis
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Highest Bill', value: `₹${highestBill.amount.toLocaleString()} — ${highestBill.month}` },
                    { label: 'Lowest Bill',  value: `₹${lowestBill.amount.toLocaleString()} — ${lowestBill.month}` },
                    { label: 'Total Paid',   value: `₹${totalAmount.toLocaleString()}` },
                    { label: 'Avg Monthly',  value: `₹${averageAmount.toLocaleString()}` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-sm text-white/50">{row.label}</span>
                      <span className="text-sm font-medium text-white/90">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SixMonthsDetails;