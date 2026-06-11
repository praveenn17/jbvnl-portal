import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, Bell, Shield, Mail, Smartphone, Download, UserX, Trash2, X, HeadphonesIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/lib/mockApi';
import { useTheme } from 'next-themes';

const ConsumerSettings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth() as any;
  const { theme, setTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    emailBillEnabled: true,
    smsAlertsEnabled: false,
    outageNotificationsEnabled: true,
    marketingOptIn: false,
    darkMode: theme === 'dark',
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [phoneForm, setPhoneForm] = useState({ phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && (user as any).preferences) {
      const prefs = (user as any).preferences;
      setSettings({
        emailBillEnabled: prefs.emailBillEnabled ?? true,
        smsAlertsEnabled: prefs.smsAlertsEnabled ?? false,
        outageNotificationsEnabled: prefs.outageNotificationsEnabled ?? true,
        marketingOptIn: prefs.marketingOptIn ?? false,
        darkMode: theme === 'dark',
      });
    }
    if (user?.phone) {
      setPhoneForm({ phone: user.phone });
    }
  }, [user, theme]);

  const handleSettingChange = async (setting: string, value: boolean) => {
    // Handle dark mode separately via next-themes
    if (setting === 'darkMode') {
      setTheme(value ? 'dark' : 'light');
      setSettings(prev => ({ ...prev, darkMode: value }));
      toast({ title: "Theme Updated", description: value ? "Dark mode enabled" : "Light mode enabled" });
      // Also persist to backend
      try {
        await mockApi.updateConsumerPreferences({ darkMode: value });
      } catch { /* non-critical */ }
      return;
    }

    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    
    try {
      await mockApi.updateConsumerPreferences({ [setting]: value });
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

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "All password fields are required.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New password and confirm password do not match.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await mockApi.changePassword({ currentPassword, newPassword, confirmPassword });
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not change password.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePhone = async () => {
    const phone = phoneForm.phone.trim();
    if (!phone) {
      toast({ title: "Error", description: "Phone number is required.", variant: "destructive" });
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      toast({ title: "Invalid Phone Number", description: "Phone number must be exactly 10 digits (numbers only, no spaces or country codes).", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await mockApi.updateMyProfile({ phone });
      if (refreshUser) await refreshUser();
      toast({ title: "Phone Updated", description: "Your mobile number has been updated." });
      setShowPhoneModal(false);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not update phone.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleContactUs = () => {
    const email = 'krpraveen2212@gmail.com';
    const subject = encodeURIComponent('JBVNL Consumer Support Request');
    
    const rawBody = `Hello JBVNL Support Team,\n\nName: ${user?.name || ''}\nConsumer Number: ${user?.consumerNumber || ''}\n\nPlease describe your issue below:\n\nRegards,\n${user?.name || ''}`;
    const body = encodeURIComponent(rawBody);
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    let hasBlurred = false;
    const onBlur = () => { hasBlurred = true; };
    window.addEventListener('blur', onBlur);

    // Most reliable method across all browsers/devices
    const link = document.createElement('a');
    link.href = mailtoUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Fallback if the OS doesn't handle the mailto protocol
    setTimeout(() => {
      window.removeEventListener('blur', onBlur);
      if (!hasBlurred) {
        navigator.clipboard.writeText(email).then(() => {
          toast({
            title: "Support email copied",
            description: "Support email copied to clipboard",
          });
        }).catch(() => {
          toast({
            title: "Support Email",
            description: `Contact us at: ${email}`,
          });
        });
      }
    }, 1000);
  };

  const handleExportData = async () => {
    toast({ title: "Preparing Export", description: "Fetching your account data, please wait…" });
    try {
      const profile = await mockApi.getMyProfile();
      const bills: any[] = await mockApi.getBills(profile.consumerNumber);
      const complaints: any[] = await mockApi.getComplaints(profile.consumerNumber);

      const exportDate = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

      // ── Billing rows ──────────────────────────────────────────────────────────
      const billRows = bills.map((b: any) => {
        const statusClass =
          b.status === 'paid' ? 'status-paid' :
          b.status === 'overdue' ? 'status-overdue' : 'status-pending';
        return `
          <tr>
            <td>${b.billNumber || '—'}</td>
            <td>${b.billingPeriod || '—'}</td>
            <td>${b.units ?? '—'} kWh</td>
            <td>₹${Number(b.amount || 0).toLocaleString('en-IN')}</td>
            <td>${b.dueDate ? new Date(b.dueDate).toLocaleDateString('en-IN') : '—'}</td>
            <td class="${statusClass}">${(b.status || '').toUpperCase()}</td>
          </tr>`;
      }).join('');

      const totalBillAmt = bills.reduce((s: number, b: any) => s + Number(b.amount || 0), 0);
      const paidBills   = bills.filter((b: any) => b.status === 'paid').length;
      const pendBills   = bills.length - paidBills;

      // ── Complaint rows ────────────────────────────────────────────────────────
      const compRows = complaints.map((c: any) => {
        const statusClass =
          c.status === 'resolved' ? 'status-paid' :
          c.status === 'rejected' ? 'status-overdue' : 'status-pending';
        return `
          <tr>
            <td>${c.title || '—'}</td>
            <td>${c.category || '—'}</td>
            <td>${c.priority || '—'}</td>
            <td class="${statusClass}">${(c.status || '').toUpperCase()}</td>
            <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</td>
          </tr>`;
      }).join('');

      const resolvedComps = complaints.filter((c: any) => c.status === 'resolved').length;
      const pendComps     = complaints.length - resolvedComps;

      // ── Full HTML document ────────────────────────────────────────────────────
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>JBVNL Account Data Export</title>
  <style>
    @media print {
      @page { margin: 20mm; }
      .page-break { page-break-before: always; }
      body { font-family: Arial, sans-serif; color: #1a1a1a; }
    }
    body { font-family: Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 24px; }
    .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .header h1 { font-size: 24px; font-weight: bold; margin: 0 0 4px; }
    .header p  { font-size: 13px; margin: 0; opacity: 0.85; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 16px; font-weight: bold; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 6px; margin-bottom: 12px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .detail-item label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-item p { font-size: 14px; font-weight: bold; margin: 2px 0 0; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #1e40af; color: white; padding: 10px; text-align: left; font-weight: bold; }
    td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) { background: #f9fafb; }
    .status-paid    { color: #16a34a; font-weight: bold; }
    .status-pending { color: #d97706; font-weight: bold; }
    .status-overdue { color: #dc2626; font-weight: bold; }
    .summary-row td { background: #eff6ff; font-weight: bold; border-top: 2px solid #1e40af; }
    .footer { text-align: center; font-size: 11px; color: #888; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
    .watermark { opacity: 0.06; font-size: 80px; font-weight: bold; color: #1e40af; position: fixed; top: 40%; left: 20%; transform: rotate(-30deg); z-index: -1; pointer-events: none; }
    .badge { display: inline-block; background: #dbeafe; color: #1e40af; border-radius: 4px; padding: 2px 8px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="watermark">JBVNL</div>

  <!-- PAGE 1 — Account Summary -->
  <div class="header">
    <h1>⚡ JBVNL Smart Portal</h1>
    <p>Account Data Export &nbsp;|&nbsp; Generated on ${exportDate}</p>
  </div>

  <div class="section">
    <div class="section-title">Consumer Details</div>
    <div class="detail-grid">
      <div class="detail-item"><label>Full Name</label><p>${profile.name || '—'}</p></div>
      <div class="detail-item"><label>Email Address</label><p>${profile.email || '—'}</p></div>
      <div class="detail-item"><label>Phone Number</label><p>${profile.phone || '—'}</p></div>
      <div class="detail-item"><label>Consumer Number</label><p>${profile.consumerNumber || '—'}</p></div>
      <div class="detail-item"><label>Address</label><p>${profile.address || '—'}</p></div>
      <div class="detail-item"><label>Account Status</label><p><span class="badge">${(profile.status || 'Active').toUpperCase()}</span></p></div>
      <div class="detail-item"><label>Member Since</label><p>${profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p></div>
      <div class="detail-item"><label>Role</label><p>${profile.role || 'Consumer'}</p></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Connection Details</div>
    <div class="detail-grid">
      <div class="detail-item"><label>Connection Type</label><p>Residential</p></div>
      <div class="detail-item"><label>Meter Number</label><p>${(profile as any).meterNumber || profile.consumerNumber || '—'}</p></div>
    </div>
  </div>

  <div class="footer">Generated on ${exportDate} &nbsp;|&nbsp; JBVNL Smart Portal &nbsp;|&nbsp; Confidential</div>

  <!-- PAGE 2 — Billing History -->
  <div class="page-break"></div>

  <div class="header">
    <h1>⚡ JBVNL Smart Portal</h1>
    <p>Billing History &nbsp;|&nbsp; ${profile.name || ''} &nbsp;(${profile.consumerNumber || ''})</p>
  </div>

  <div class="section">
    <div class="section-title">Bill Records</div>
    ${bills.length === 0
      ? '<p style="color:#888;font-style:italic;">No billing records found.</p>'
      : `<table>
          <thead>
            <tr>
              <th>Bill Number</th><th>Period</th><th>Units</th><th>Amount</th><th>Due Date</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${billRows}
            <tr class="summary-row">
              <td colspan="3">Total Bills: ${bills.length}</td>
              <td>₹${totalBillAmt.toLocaleString('en-IN')}</td>
              <td>Paid: ${paidBills}</td>
              <td>Pending: ${pendBills}</td>
            </tr>
          </tbody>
        </table>`
    }
  </div>

  <div class="footer">Generated on ${exportDate} &nbsp;|&nbsp; JBVNL Smart Portal &nbsp;|&nbsp; Confidential</div>

  <!-- PAGE 3 — Complaint History -->
  <div class="page-break"></div>

  <div class="header">
    <h1>⚡ JBVNL Smart Portal</h1>
    <p>Complaint History &nbsp;|&nbsp; ${profile.name || ''} &nbsp;(${profile.consumerNumber || ''})</p>
  </div>

  <div class="section">
    <div class="section-title">Complaint Records</div>
    ${complaints.length === 0
      ? '<p style="color:#888;font-style:italic;">No complaint records found.</p>'
      : `<table>
          <thead>
            <tr>
              <th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${compRows}
            <tr class="summary-row">
              <td colspan="2">Total Complaints: ${complaints.length}</td>
              <td></td>
              <td class="status-paid">Resolved: ${resolvedComps}</td>
              <td class="status-pending">Pending: ${pendComps}</td>
            </tr>
          </tbody>
        </table>`
    }
  </div>

  <div class="footer">Generated on ${exportDate} &nbsp;|&nbsp; JBVNL Smart Portal &nbsp;|&nbsp; Confidential</div>
</body>
</html>`;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({ title: "Popup Blocked", description: "Please allow popups for this site and try again.", variant: "destructive" });
        return;
      }
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      toast({ title: "Export Ready", description: "Print dialog opened — save as PDF to download." });
    } catch (err) {
      toast({ title: "Export Failed", description: "Could not fetch account data. Please try again.", variant: "destructive" });
    }
  };

  const handleDownloadBillHistory = async () => {
    try {
      const cNum = user?.consumerNumber;
      if (!cNum) {
        toast({ title: "Error", description: "Consumer number not found.", variant: "destructive" });
        return;
      }
      const bills = await mockApi.getBills(cNum);
      if (!bills || bills.length === 0) {
        toast({ title: "No Bills", description: "No bill history found to download.", variant: "destructive" });
        return;
      }

      // CSV format
      const headers = 'Bill Number,Billing Period,Due Date,Amount (₹),Units (kWh),Status\n';
      const rows = bills.map((b: any) =>
        `${b.billNumber},${b.billingPeriod},${new Date(b.dueDate).toLocaleDateString('en-IN')},${b.amount},${b.units},${b.status}`
      ).join('\n');
      const csv = headers + rows;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jbvnl_bill_history_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: "Bill history CSV has been downloaded." });
    } catch (err) {
      toast({ title: "Download Failed", description: "Failed to download bill history", variant: "destructive" });
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
                <Button variant="outline" className="justify-start" onClick={() => setShowPasswordModal(true)}>
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => toast({ title: "Notice", description: "Please contact support to change your registered email address." })}>
                  <Mail className="h-4 w-4 mr-2" />
                  Update Email
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => { setPhoneForm({ phone: user?.phone || '' }); setShowPhoneModal(true); }}>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Update Mobile Number
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleContactUs}
                >
                  <HeadphonesIcon className="h-4 w-4 mr-2" />
                  Contact Us
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
                  checked={theme === 'dark'}
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

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Change Password</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowPasswordModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Enter your current and new password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleChangePassword} disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : 'Update Password'}
                </Button>
                <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Update Mobile Number</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowPhoneModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Enter your new mobile number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mobile Number <span className="text-muted-foreground text-xs">(10 digits)</span></Label>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneForm.phone}
                  maxLength={10}
                  onChange={(e) => setPhoneForm({ phone: e.target.value.replace(/\D/g, '') })}
                />
                {phoneForm.phone.length > 0 && !/^[0-9]{10}$/.test(phoneForm.phone) && (
                  <p className="text-xs text-red-500">
                    {phoneForm.phone.length < 10
                      ? `${10 - phoneForm.phone.length} more digit(s) required`
                      : 'Must be exactly 10 digits'}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleUpdatePhone} disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : 'Update Number'}
                </Button>
                <Button variant="outline" onClick={() => setShowPhoneModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ConsumerSettings;