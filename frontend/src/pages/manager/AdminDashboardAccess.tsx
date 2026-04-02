import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, Key, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AdminDashboardAccess: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referenceNo, setReferenceNo] = useState('');

  const handleAccessAdmin = () => {
    if (referenceNo === 'FEUCC007') {
      toast({
        title: "Access Granted",
        description: "Redirecting to Admin Dashboard for Kanishk Kumar Sinha",
      });
      // Simulate redirect to admin dashboard
      setTimeout(() => {
        navigate('/admin-dashboard', { state: { adminName: 'Kanishk Kumar Sinha', adminId: 7 } });
      }, 1500);
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin reference number",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard Access
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter admin reference number to access specific admin dashboard
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Access Form */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Secure Admin Access</CardTitle>
              <CardDescription>
                Provide valid admin reference number to access dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reference">Admin Reference Number</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reference"
                    type="text"
                    placeholder="Enter reference number (e.g., FEUCC007)"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                onClick={handleAccessAdmin}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={!referenceNo}
              >
                Access Admin Dashboard
              </Button>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Demo Reference:</strong> FEUCC007
                  <br />
                  <span className="text-xs">This will grant access to Kanishk Kumar Sinha's dashboard</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Information */}
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6" />
                Admin Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="font-semibold mb-2">Reference: FEUCC007</h3>
                <div className="space-y-2 text-sm opacity-90">
                  <p><strong>Name:</strong> Kanishk Kumar Sinha</p>
                  <p><strong>Zone:</strong> South Bihar</p>
                  <p><strong>Department:</strong> Electrical Distribution</p>
                  <p><strong>Designation:</strong> Senior Administrator</p>
                  <p><strong>Join Date:</strong> July 22, 2023</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="font-semibold mb-2">Access Permissions</h3>
                <ul className="space-y-1 text-sm opacity-90">
                  <li>• Consumer Management</li>
                  <li>• Billing Administration</li>
                  <li>• Complaint Resolution</li>
                  <li>• Service Requests</li>
                  <li>• Zone Analytics</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="font-semibold mb-2">Security Note</h3>
                <p className="text-sm opacity-90">
                  Access is logged and monitored. Unauthorized access attempts will be reported to system administrators.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardAccess;