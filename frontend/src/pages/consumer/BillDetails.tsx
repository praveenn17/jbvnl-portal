import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, CreditCard, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockApi } from '@/lib/mockApi';
import { Bill } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const BillDetails: React.FC = () => {
  const navigate = useNavigate();
  const { billId } = useParams();
  const { user } = useAuth();
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      if (!billId) return;
      try {
        const data = await mockApi.getBillById(billId);
        if (data) {
          // If the backend doesn't send these details, we mock them for display purposes
          setBill({
            ...data,
            previousReading: data.previousReading || Math.floor(Math.random() * 5000),
            currentReading: data.currentReading || (data.previousReading || 5000) + data.units,
            ratePerUnit: data.ratePerUnit || 8.50,
            fixedCharges: data.fixedCharges || 75,
            electricityDuty: data.electricityDuty || Math.floor(data.amount * 0.05),
            rebate: data.rebate || 0,
          } as any);
        }
      } catch (error) {
        console.error('Error fetching bill details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [billId]);

  const handleDownloadPdf = async () => {
    if (!billId) return;
    try {
      const token = localStorage.getItem('jbvnl_token');
      const baseURL = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseURL}/api/bills/${billId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JBVNL-Bill-${bill?.billNumber || billId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-lg">Loading bill details...</p>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <p className="text-center text-lg mt-8">Bill not found</p>
        </div>
      </div>
    );
  }

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bills
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Electricity Bill</CardTitle>
                <CardDescription>Bill Number: {bill.billNumber}</CardDescription>
              </div>
              <Badge className={getBillStatusColor(bill.status)}>
                {bill.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Billing Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billing Period:</span>
                    <span className="font-medium">{bill.billingPeriod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{new Date(bill.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consumer Number:</span>
                    <span className="font-medium">JBVNL001</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Meter Reading</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Previous Reading:</span>
                    <span className="font-medium">{bill.previousReading}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Reading:</span>
                    <span className="font-medium">{bill.currentReading}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Units Consumed:</span>
                    <span className="font-medium text-primary">{bill.units} kWh</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Bill Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span>Energy Charges ({bill.units} units @ ₹{bill.ratePerUnit}/unit)</span>
                  <span className="font-medium">₹{(bill.units * bill.ratePerUnit).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Fixed Charges</span>
                  <span className="font-medium">₹{bill.fixedCharges}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Electricity Duty</span>
                  <span className="font-medium">₹{bill.electricityDuty}</span>
                </div>
                {bill.rebate > 0 && (
                  <div className="flex justify-between py-2 border-b text-green-600">
                    <span>Rebate/Discount</span>
                    <span className="font-medium">-₹{bill.rebate}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t-2 border-primary text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{bill.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {bill.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Pending Bill</p>
                    <p className="text-sm text-yellow-700">
                      Your bill is currently pending.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={() => navigate('/consumer/form/billing-concern', { state: { billNumber: bill.billNumber } })}
                variant="outline"
              >
                Raise Billing Concern
              </Button>
              {bill.status !== 'paid' && (
                <Button 
                  onClick={() => navigate('/consumer/payment', { state: { bill } })}
                  className="bg-[#1e3a5f] hover:bg-[#2563eb]"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillDetails;