import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2, FileText, Info, Zap, Clock, CreditCard } from 'lucide-react';

const NewConnectionInfo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Zap className="h-7 w-7 text-yellow-500" />
              New Connection
            </h1>
            <p className="text-muted-foreground">Information and requirements for applying for a new electricity connection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Eligibility Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Applicant must be a citizen of India.</li>
                  <li>Applicant must be the legal owner or authorized tenant of the premises where the connection is requested.</li>
                  <li>Premises must be within the JBVNL supply area.</li>
                  <li>There should be no outstanding electricity dues against the applicant or the premises.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Required Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Required Documents
                </CardTitle>
                <CardDescription>Please keep soft copies of these documents ready before applying.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm">1. Proof of Identity (Any One)</h4>
                    <p className="text-sm text-muted-foreground">Aadhaar Card, Voter ID, PAN Card, Passport, or Driving License.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">2. Proof of Ownership/Occupancy (Any One)</h4>
                    <p className="text-sm text-muted-foreground">Latest Rent Agreement, Sale Deed, Property Tax Receipt, or Mutation Certificate.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">3. Photograph</h4>
                    <p className="text-sm text-muted-foreground">Recent passport-size photograph of the applicant.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Instructions */}
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Info className="h-5 w-5" />
                  Important Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Ensure all uploaded documents are clear and legible (Max size: 2MB per file).</li>
                  <li>Physical verification of the premises will be conducted by JBVNL officials.</li>
                  <li>Wiring at the premises must be complete and certified by a licensed electrical contractor before meter installation.</li>
                  <li>False information or forged documents will lead to immediate rejection and possible legal action.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Connection Types */}
            <Card>
              <CardHeader>
                <CardTitle>Connection Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground">Residential (Domestic)</h4>
                  <p className="text-xs text-muted-foreground mt-1">For households and individual apartments.</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground">Commercial</h4>
                  <p className="text-xs text-muted-foreground mt-1">For shops, offices, and commercial establishments.</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground">Industrial</h4>
                  <p className="text-xs text-muted-foreground mt-1">For factories and manufacturing units.</p>
                </div>
              </CardContent>
            </Card>

            {/* Processing Time & Fees */}
            <Card>
              <CardHeader>
                <CardTitle>Processing & Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Estimated Processing Time</h4>
                    <p className="text-xs text-muted-foreground mt-1">7 to 15 working days after successful document verification.</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Application Fee</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      ₹150 - ₹500 (Non-refundable).<br />
                      *Security deposit will be calculated separately based on required load.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Apply Now Action */}
        <div className="flex flex-col items-center justify-center p-8 mt-8 border border-border rounded-xl shadow-sm bg-card">
          <h2 className="text-2xl font-bold text-center mb-2">Ready to Apply?</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-lg">
            Once you have all your documents ready, proceed to the application form. You can track your application status from your dashboard later.
          </p>
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90"
            onClick={() => navigate('/consumer/form/new-connection')}
          >
            Apply Now
            <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewConnectionInfo;
