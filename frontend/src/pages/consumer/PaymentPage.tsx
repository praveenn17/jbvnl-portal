import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Shield, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockApi } from '@/lib/mockApi';

declare global {
  interface Window { Razorpay: any; }
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const script    = document.createElement('script');
    script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload   = () => resolve(true);
    script.onerror  = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentPage: React.FC = () => {
  const navigate        = useNavigate();
  const location        = useLocation();
  const { toast }       = useToast();
  const { bill }        = (location.state as any) || {};

  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!bill) navigate('/consumer/six-months');
  }, [bill, navigate]);

  const handlePayNow = async () => {
    if (!bill?._id) {
      toast({ title: 'Cannot Pay', description: 'This bill has no valid MongoDB ID.', variant: 'destructive' });
      return;
    }

    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay checkout script failed to load. Check your internet connection.');

      const order = await mockApi.createPaymentOrder(bill._id);

      const options = {
        key:          order.keyId,
        amount:       order.amount,
        currency:     order.currency || 'INR',
        name:         'JBVNL Smart Portal',
        description:  `Bill ${order.billNumber} — ${bill.billingPeriod}`,
        order_id:     order.orderId,
        theme:        { color: '#1e3a5f' },
        prefill: {
          name:  localStorage.getItem('jbvnl_user_name') || '',
          email: localStorage.getItem('jbvnl_user_email') || '',
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await mockApi.verifyPayment({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              billId:            bill._id,
            });
            setSuccess(true);
            toast({ title: '✅ Payment Successful', description: `Bill ${order.billNumber} has been paid.` });
          } catch (verifyErr: any) {
            toast({ title: 'Verification Failed', description: verifyErr.message, variant: 'destructive' });
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setPaying(false);
      toast({ title: 'Payment Error', description: err.message, variant: 'destructive' });
    }
  };

  if (!bill) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-2">Bill <strong>{bill.billNumber}</strong> has been paid.</p>
            <p className="text-muted-foreground mb-6">Amount: <strong>₹{bill.amount?.toLocaleString('en-IN')}</strong></p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/consumer/six-months')}>View Bill History</Button>
              <Button variant="outline" onClick={() => navigate('/consumer/dashboard')}>Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-background dark:to-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Payment card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Pay Electricity Bill</CardTitle>
                <CardDescription className="text-blue-100">Secure payment via Razorpay</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Bill summary */}
            <div className="bg-muted/40 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bill Number</span>
                <span className="font-semibold">{bill.billNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Billing Period</span>
                <span className="font-semibold">{bill.billingPeriod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Consumer Number</span>
                <span className="font-semibold">{bill.consumerNumber}</span>
              </div>
              {bill.unitsConsumed != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Units Consumed</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-500" /> {bill.unitsConsumed} kWh
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-semibold">{new Date(bill.dueDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={bill.status === 'overdue' ? 'destructive' : 'secondary'} className="capitalize">
                  {bill.status}
                </Badge>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Amount Payable</p>
              <p className="text-4xl font-bold text-[#1e3a5f] dark:text-blue-300">
                ₹{bill.amount?.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Pay button */}
            <Button
              className="w-full h-14 text-lg bg-[#1e3a5f] hover:bg-[#2563eb] transition-colors"
              onClick={handlePayNow}
              disabled={paying}
              id="rzp-pay-btn"
            >
              {paying ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Opening Payment Gateway...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pay ₹{bill.amount?.toLocaleString('en-IN')} Now
                </span>
              )}
            </Button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>256-bit SSL encrypted · Powered by Razorpay · UPI, Cards, Net Banking accepted</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
