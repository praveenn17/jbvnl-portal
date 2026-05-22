import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, Bell, Shield, Mail, Smartphone, Download, UserX, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/lib/mockApi';

const ConsumerSettings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login } = useAuth(); // Need login to refresh token if we had a function for it, but updating user requires re-fetch
  
  const [settings, setSettings] = useState({
    emailBillEnabled: true,
    smsAlertsEnabled: false,
    outageNotificationsEnabled: true,
    marketingOptIn: false,
    darkMode: false,
  });

  useEffect(() => {
    if (user && (user as any).preferences) {
      setSettings((user as any).preferences);
    }
  }, [user]);

  const handleSettingChange = async (setting: string, value: boolean) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    
    try {
      await mockApi.updateConsumerPreferences(newSettings);
      toast({
        title: "Setting Updated",
        description: "Your preference has been saved securely.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save your preference.",
        variant: "destructive"
      });
    }
  };

  const handleExportData = async () => {
    try {
      const profile = await mockApi.getMyProfile();
      const bills = await mockApi.getBills(profile.consumerNumber);
      const complaints = await mockApi.getComplaints(profile.consumerNumber);
      
      const data = { profile, bills, complaints };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jbvnl_account_data.json';
      a.click();
      toast({ title: "Data Exported", description: "Your account data has been downloaded." });
    } catch (err) {
      toast({ title: "Export Failed", description: "Failed to export data", variant: "destructive" });
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to request account deactivation?")) return;
    try {
      await mockApi.requestDeactivateAccount();
      toast({ title: "Request Sent", description: "Account deactivation requested successfully." });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to request permanent account deletion? This action cannot be undone.")) return;
    try {
      await mockApi.requestDeleteAccount();
      toast({ title: "Request Sent", description: "Account deletion requested successfully." });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>
                Choose how you want to receive updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Bill Delivery</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive your monthly electricity bills directly in your email
                  </p>
                </div>
                <Switch
                  checked={settings.emailBillEnabled}
                  onCheckedChange={(value) => handleSettingChange('emailBillEnabled', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get SMS alerts for bill due dates and payment confirmations
                  </p>
                </div>
                <Switch
                  checked={settings.smsAlertsEnabled}
                  onCheckedChange={(value) => handleSettingChange('smsAlertsEnabled', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Outage Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts about planned maintenance and power outages
                  </p>
                </div>
                <Switch
                  checked={settings.outageNotificationsEnabled}
                  onCheckedChange={(value) => handleSettingChange('outageNotificationsEnabled', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Promotional & Marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new JBVNL services and energy-saving tips
                  </p>
                </div>
                <Switch
                  checked={settings.marketingOptIn}
                  onCheckedChange={(value) => handleSettingChange('marketingOptIn', value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Security & Privacy</CardTitle>
              </div>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start" onClick={() => navigate('/consumer/profile')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => toast({ title: "Notice", description: "Please contact support to change your registered email address." })}>
                  <Mail className="h-4 w-4 mr-2" />
                  Update Email
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => navigate('/consumer/profile')}>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Update Mobile Number
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch to dark theme for better viewing in low light
                  </p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(value) => handleSettingChange('darkMode', value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Account Data
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => navigate('/consumer/six-months')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Bill History
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700 justify-start" onClick={handleDeactivate}>
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate Account
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700 justify-start" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConsumerSettings;