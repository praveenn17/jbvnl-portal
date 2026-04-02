import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, CreditCard, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const BillDetails: React.FC = () => {
  const navigate = useNavigate();
  const { billId } = useParams();

  const bills = [
    {
      id: '1',
      billingPeriod: 'March 2024',
      billNumber: 'BILL001',
      dueDate: '2024-04-15',
      amount: 2450,
      status: 'pending',
      units: 245,
      previousReading: 5234,
      currentReading: 5479,
      ratePerUnit: 8.50,
      fixedCharges: 75,
      electricityDuty: 125,
      rebate: 0,
    },
    {
      id: '2',
      billingPeriod: 'February 2024',
      billNumber: 'BILL002',
      dueDate: '2024-03-15',
      amount: 1890,
      status: 'paid',
      units: 189,
      previousReading: 5045,
      currentReading: 5234,
      ratePerUnit: 8.50,
      fixedCharges: 75,
      electricityDuty: 96,
      rebate: 50,
    },
    {
      id: '3',
      billingPeriod: 'January 2024',
      billNumber: 'BILL003',
      dueDate: '2024-02-15',
      amount: 2145,
      status: 'paid',
      units: 212,
      previousReading: 4833,
      currentReading: 5045,
      ratePerUnit: 8.50,
      fixedCharges: 75,
      electricityDuty: 108,
      rebate: 0,
    },
    {
      id: '4',
      billingPeriod: 'December 2023',
      billNumber: 'BILL004',
      dueDate: '2024-01-15',
      amount: 1675,
      status: 'paid',
      units: 165,
      previousReading: 4668,
      currentReading: 4833,
      ratePerUnit: 8.50,
      fixedCharges: 75,
      electricityDuty: 84,
      rebate: 25,
    },
    {
      id: '5',
      billingPeriod: 'November 2023',
      billNumber: 'BILL005',
      dueDate: '2023-12-15',
      amount: 1945,
      status: 'paid',
      units: 194,
      previousReading: 4474,
      currentReading: 4668,
      ratePerUnit: 8.50,
      fixedCharges: 75,
      electricityDuty: 99,
      rebate: 0,
    },
    {
      id: '6',
      billingPeriod: 'October 2023',
      billNumber: 'BILL006',
      dueDate: '2023-11-15',
      amount: 2234,
      status: 'paid',
      units: 223,
      previousReading: 4251,
      currentReading: 4474,
      ratePerUnit: 8.50,
      fixedCharges: 75,
      electricityDuty: 113,
      rebate: 0,
    },
  ];

  const bill = bills.find(b => b.id === billId);

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
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {bill.status === 'pending' && (
              <Button onClick={() => navigate('/consumer/payment')} className="bg-secondary hover:bg-secondary-600">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            )}
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
                    <p className="font-medium text-yellow-800">Payment Due</p>
                    <p className="text-sm text-yellow-700">
                      Please pay your bill by {new Date(bill.dueDate).toLocaleDateString()} to avoid late fees.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={() => navigate('/consumer/billing-concern')}
                variant="outline"
              >
                Raise Billing Concern
              </Button>
              {bill.status === 'pending' && (
                <Button onClick={() => navigate('/consumer/payment')} className="bg-secondary hover:bg-secondary-600">
                  Pay This Bill
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