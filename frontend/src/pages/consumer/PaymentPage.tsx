import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Smartphone, Building, CheckCircle, Shield, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const billId = location.state?.billId || 'bill-1'; // fallback
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: bill, isLoading } = useQuery({
    queryKey: ['bill', billId],
    queryFn: () => mockApi.getBillById(billId),
    enabled: !!billId,
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => mockApi.payBill(id),
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Payment Successful",
        description: "Your electricity bill has been paid successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    }
  });

  const isProcessing = payMutation.isPending;

  const handlePayment = () => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to proceed.",
        variant: "destructive"
      });
      return;
    }

    if (bill) payMutation.mutate(bill.id);
  };

  if (isLoading || !bill) {
    return <div className="min-h-screen flex items-center justify-center">Loading bill details...</div>;
  }

  const billDetails = {
    billNumber: bill.billNumber,
    consumerNumber: bill.consumerNumber,
    consumerName: user?.name ?? 'Consumer',
    billingPeriod: bill.billingPeriod,
    dueDate: bill.dueDate,
    amount: bill.amount,
    units: bill.units,
    lateFee: 0,
    totalAmount: bill.amount
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your payment of ₹{billDetails.totalAmount.toLocaleString()} has been processed successfully.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2">Transaction Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono">TXN{Date.now()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bill Number:</span>
                  <span>{billDetails.billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-semibold text-green-600">₹{billDetails.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full bg-primary hover:bg-primary-600"
              >
                Back to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.print()}
                className="w-full"
              >
                Download Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Bill Payment</h1>
            <p className="text-muted-foreground">Secure online payment for your electricity bill</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Bill Summary
              </CardTitle>
              <CardDescription>Review your bill details before payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Consumer Name</p>
                  <p className="font-medium">{billDetails.consumerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Consumer Number</p>
                  <p className="font-medium">{billDetails.consumerNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bill Number</p>
                  <p className="font-medium">{billDetails.billNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Billing Period</p>
                  <p className="font-medium">{billDetails.billingPeriod}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Units Consumed</p>
                  <p className="font-medium">{billDetails.units} units</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium text-orange-600">{new Date(billDetails.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bill Amount</span>
                  <span>₹{billDetails.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Late Fee</span>
                  <span>₹{billDetails.lateFee}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{billDetails.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Payment Method
              </CardTitle>
              <CardDescription>Choose your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">UPI Payment</p>
                        <p className="text-sm text-muted-foreground">Google Pay, PhonePe, Paytm</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'netbanking' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Net Banking</p>
                        <p className="text-sm text-muted-foreground">All major banks supported</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input id="cardName" placeholder="Name on card" />
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input id="upiId" placeholder="username@upi" />
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank">Select Bank</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sbi">State Bank of India</SelectItem>
                        <SelectItem value="hdfc">HDFC Bank</SelectItem>
                        <SelectItem value="icici">ICICI Bank</SelectItem>
                        <SelectItem value="axis">Axis Bank</SelectItem>
                        <SelectItem value="pnb">Punjab National Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <Button 
                onClick={handlePayment}
                className="w-full bg-primary hover:bg-primary-600"
                disabled={!paymentMethod || isProcessing}
              >
                {isProcessing ? 'Processing Payment...' : `Pay ₹${billDetails.totalAmount.toLocaleString()}`}
              </Button>

              {/* Security Notice */}
              <div className="text-center text-xs text-muted-foreground">
                <Shield className="h-4 w-4 inline mr-1" />
                Your payment is secured with 256-bit SSL encryption
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;