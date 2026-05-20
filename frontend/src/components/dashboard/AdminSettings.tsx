import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Settings, Users, Bell, Shield, Database, Gauge, Mail, MessageSquare,
  Lock, Clock, Download, RefreshCw, CheckCircle, Loader2,
} from 'lucide-react';

// ── Settings state types ─────────────────────────────────────────────────────
export interface SettingsState {
  autoApprovalThreshold: number;
  emailNotifications: { registration: boolean; complaints: boolean; billing: boolean; summary: boolean };
  smsAlerts: { escalation: boolean; payment: boolean; outage: boolean };
  backupSettings: { schedule: string; lastBackupAt: string; status: string; frequency: string };
  securityLevel: 'standard' | 'high' | 'strict';
  notificationPrefs: { email: boolean; sms: boolean; push: boolean; weeklyReport: boolean };
  securitySettings: { passwordPolicy: boolean; otpVerification: boolean; adminProtection: boolean; sessionTimeout: number };
}

type ModalKey = 'autoApproval' | 'emailNotifications' | 'smsAlerts' | 'backup' | 'security'
  | 'userManagement' | 'notificationPrefs' | 'securitySettings' | 'backupRecovery' | null;

import { mockApi } from '../../lib/mockApi';

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<ModalKey>(null);
  const [backupLoading, setBackupLoading] = useState(false);

  // Temp state for editing inside modals
  const [tempThreshold, setTempThreshold] = useState(5);
  const [tempEmail, setTempEmail] = useState({ registration: true, complaints: true, billing: false, summary: true });
  const [tempSms, setTempSms] = useState({ escalation: true, payment: false, outage: true });
  const [tempSecLevel, setTempSecLevel] = useState<'standard'|'high'|'strict'>('standard');
  const [tempNotifPrefs, setTempNotifPrefs] = useState({ email: true, sms: true, push: false, weeklyReport: true });
  const [tempSecSettings, setTempSecSettings] = useState({ passwordPolicy: true, otpVerification: true, adminProtection: true, sessionTimeout: 30 });

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await mockApi.getAdminSettings();
      setSettings(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openSetting = (key: ModalKey) => {
    if (!settings) return;
    // Sync temp state from current settings
    setTempThreshold(settings.autoApprovalThreshold);
    setTempEmail({ ...settings.emailNotifications });
    setTempSms({ ...settings.smsAlerts });
    setTempSecLevel(settings.securityLevel);
    setTempNotifPrefs({ ...settings.notificationPrefs });
    setTempSecSettings({ ...settings.securitySettings });
    setOpenModal(key);
  };

  const saveSetting = async (updateData: Partial<SettingsState>, msg: string) => {
    try {
      const updated = await mockApi.updateAdminSettings(updateData);
      setSettings(updated);
      toast({ title: '✓ Settings Updated', description: msg });
      setOpenModal(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update settings', variant: 'destructive' });
    }
  };

  const handleManualBackup = async () => {
    setBackupLoading(true);
    try {
      const data = await mockApi.runManualBackup();
      if (settings) {
        setSettings({
          ...settings,
          backupSettings: { ...settings.backupSettings, lastBackupAt: data.lastBackupAt }
        });
      }
      toast({ title: '✓ Backup Complete', description: 'Database backup completed successfully.' });
    } catch (error) {
      toast({ title: 'Backup Failed', description: 'Could not complete manual backup.', variant: 'destructive' });
    } finally {
      setBackupLoading(false);
    }
  };

  // ── Setting rows for the overview list ─────────────────────────────────────
  if (loading || !settings) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  const settingRows: { label: string; value: string; valueClass?: string; icon: React.ReactNode; key: ModalKey }[] = [
    { label: 'Auto-Approval Threshold', value: `${settings.autoApprovalThreshold} requests`, icon: <Gauge className="h-4 w-4" />, key: 'autoApproval' },
    { label: 'Email Notifications', value: 'Enabled', valueClass: 'text-emerald-400', icon: <Mail className="h-4 w-4" />, key: 'emailNotifications' },
    { label: 'SMS Alerts', value: 'Enabled', valueClass: 'text-emerald-400', icon: <MessageSquare className="h-4 w-4" />, key: 'smsAlerts' },
    { label: 'Database Backup', value: settings.backupSettings?.schedule || 'Daily', valueClass: 'text-muted-foreground', icon: <Database className="h-4 w-4" />, key: 'backup' },
    { label: 'Security Level', value: settings.securityLevel.charAt(0).toUpperCase() + settings.securityLevel.slice(1), valueClass: settings.securityLevel === 'strict' ? 'text-destructive' : settings.securityLevel === 'high' ? 'text-amber-400' : 'text-yellow-500', icon: <Shield className="h-4 w-4" />, key: 'security' },
  ];

  const actionButtons: { label: string; icon: React.ReactNode; key: ModalKey }[] = [
    { label: 'User Management', icon: <Users className="h-4 w-4 mr-2" />, key: 'userManagement' },
    { label: 'Notification Settings', icon: <Bell className="h-4 w-4 mr-2" />, key: 'notificationPrefs' },
    { label: 'Security Settings', icon: <Lock className="h-4 w-4 mr-2" />, key: 'securitySettings' },
    { label: 'Backup & Recovery', icon: <Database className="h-4 w-4 mr-2" />, key: 'backupRecovery' },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5" />
            Admin Settings
          </CardTitle>
          <CardDescription>Configure system parameters — click any item to edit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settingRows.map(item => (
              <div
                key={item.label}
                onClick={() => openSetting(item.key)}
                className="flex justify-between items-center p-3 border border-border/50 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <span className="font-medium text-foreground flex items-center gap-2">{item.icon} {item.label}</span>
                <span className={item.valueClass ?? 'text-foreground'}>{item.value}</span>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {actionButtons.map(btn => (
                <Button key={btn.label} variant="outline" className="justify-start" onClick={() => openSetting(btn.key)}>
                  {btn.icon}{btn.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── A. Auto-Approval Threshold ──────────────────────────────────────── */}
      <Dialog open={openModal === 'autoApproval'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-Approval Threshold</DialogTitle>
            <DialogDescription>Users below this threshold can be auto-approved based on verification rules.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Current Threshold</Label>
              <Input type="number" min={1} max={100} value={tempThreshold} onChange={e => setTempThreshold(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Number of pending requests before manual review is required.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
            <Button onClick={() => saveSetting({ autoApprovalThreshold: tempThreshold }, 'Auto-approval threshold updated successfully.')}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── B. Email Notifications ──────────────────────────────────────────── */}
      <Dialog open={openModal === 'emailNotifications'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Notification Preferences</DialogTitle>
            <DialogDescription>Choose which email alerts to receive.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {([
              ['registration', 'New User Registration Alerts'],
              ['complaints', 'Complaint Status Updates'],
              ['billing', 'Billing Notifications'],
              ['summary', 'Admin Summary Emails'],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch checked={tempEmail[key]} onCheckedChange={v => setTempEmail(p => ({ ...p, [key]: v }))} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
            <Button onClick={() => saveSetting({ emailNotifications: tempEmail }, 'Email notification preferences saved.')}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── C. SMS Alerts ───────────────────────────────────────────────────── */}
      <Dialog open={openModal === 'smsAlerts'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SMS Alert Preferences</DialogTitle>
            <DialogDescription>Configure which SMS alerts are sent.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {([
              ['escalation', 'Complaint Escalation SMS'],
              ['payment', 'Payment Reminder SMS'],
              ['outage', 'Emergency Outage SMS'],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch checked={tempSms[key]} onCheckedChange={v => setTempSms(p => ({ ...p, [key]: v }))} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
            <Button onClick={() => saveSetting({ smsAlerts: tempSms }, 'SMS alert preferences saved.')}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── D. Database Backup ──────────────────────────────────────────────── */}
      <Dialog open={openModal === 'backup'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Database Backup</DialogTitle>
            <DialogDescription>Monitor and manage automated backups.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-between p-3 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-sm text-muted-foreground">Schedule</span>
              <span className="text-sm font-medium text-foreground">{settings.backupSettings?.schedule || 'Daily 2:00 AM'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-sm text-muted-foreground">Last Backup</span>
              <span className="text-sm font-medium text-foreground">
                {settings.backupSettings?.lastBackupAt ? new Date(settings.backupSettings.lastBackupAt).toLocaleString('en-IN') : 'Never'}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Healthy</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Close</Button>
            <Button onClick={handleManualBackup} disabled={backupLoading}>
              {backupLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Running...</> : <><RefreshCw className="h-4 w-4 mr-2" />Run Manual Backup</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── E. Security Level ───────────────────────────────────────────────── */}
      <Dialog open={openModal === 'security'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Security Level</DialogTitle>
            <DialogDescription>Set the system-wide security enforcement level.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select value={tempSecLevel} onValueChange={(v: 'standard' | 'high' | 'strict') => setTempSecLevel(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong className="text-foreground">Standard:</strong> Default security. Password + OTP verification.</p>
              <p><strong className="text-foreground">High:</strong> Adds IP-based rate limiting and session monitoring.</p>
              <p><strong className="text-foreground">Strict:</strong> Enforces MFA for all admin actions and locks sessions after 10 min of inactivity.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
            <Button onClick={() => saveSetting({ securityLevel: tempSecLevel }, `Security level set to "${tempSecLevel}".`)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── F. User Management ──────────────────────────────────────────────── */}
      <Dialog open={openModal === 'userManagement'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Management Overview</DialogTitle>
            <DialogDescription>Quick summary of all user accounts in the system.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {[
              { label: 'Total Consumers', value: '24,580', color: 'text-primary' },
              { label: 'Pending Approvals', value: '12', color: 'text-amber-400' },
              { label: 'Active Managers', value: '3', color: 'text-emerald-400' },
              { label: 'Suspended Users', value: '0', color: 'text-muted-foreground' },
            ].map(s => (
              <div key={s.label} className="text-center p-4 rounded-lg bg-muted/40 border border-border/50">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { toast({ title: 'Export Started', description: 'User data export initiated (demo).' }); }}>
              <Download className="h-4 w-4 mr-2" />Export Users
            </Button>
            <Button onClick={() => setOpenModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── G. Notification Settings ────────────────────────────────────────── */}
      <Dialog open={openModal === 'notificationPrefs'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
            <DialogDescription>Manage how you receive notifications.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {([
              ['email', 'Email Notifications'],
              ['sms', 'SMS Notifications'],
              ['push', 'Push Notifications'],
              ['weeklyReport', 'Weekly Admin Report'],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch checked={tempNotifPrefs[key]} onCheckedChange={v => setTempNotifPrefs(p => ({ ...p, [key]: v }))} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
            <Button onClick={() => saveSetting({ notificationPrefs: tempNotifPrefs }, 'Notification preferences saved.')}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── H. Security Settings ────────────────────────────────────────────── */}
      <Dialog open={openModal === 'securitySettings'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Security Settings</DialogTitle>
            <DialogDescription>Fine-tune authentication and session policies.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {([
              ['passwordPolicy', 'Strong Password Policy'],
              ['otpVerification', 'OTP Email Verification'],
              ['adminProtection', 'Admin Login Protection'],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch checked={tempSecSettings[key]} onCheckedChange={v => setTempSecSettings(p => ({ ...p, [key]: v }))} />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input type="number" min={5} max={120} value={tempSecSettings.sessionTimeout} onChange={e => setTempSecSettings(p => ({ ...p, sessionTimeout: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
            <Button onClick={() => saveSetting({ securitySettings: tempSecSettings }, 'Security settings updated.')}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── I. Backup & Recovery ────────────────────────────────────────────── */}
      <Dialog open={openModal === 'backupRecovery'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup & Recovery</DialogTitle>
            <DialogDescription>Manage backups and disaster-recovery options.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { label: 'Last Backup', value: settings.backupSettings?.lastBackupAt ? new Date(settings.backupSettings.lastBackupAt).toLocaleString('en-IN') : 'Never' },
              { label: 'Recovery Point', value: settings.backupSettings?.lastBackupAt ? new Date(settings.backupSettings.lastBackupAt).toLocaleString('en-IN') : 'Never' },
              { label: 'Backup Frequency', value: settings.backupSettings?.schedule || 'Daily' },
              { label: 'Storage Used', value: '2.4 GB / 10 GB' },
            ].map(r => (
              <div key={r.label} className="flex justify-between p-3 rounded-lg bg-muted/40 border border-border/50">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <span className="text-sm font-medium text-foreground">{r.value}</span>
              </div>
            ))}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleManualBackup} disabled={backupLoading}>
              {backupLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              Create Backup
            </Button>
            <Button variant="outline" onClick={() => toast({ title: 'Backup Logs', description: 'Viewing last 30 backup log entries (demo).' })}>
              View Logs
            </Button>
            <Button variant="outline" onClick={() => toast({ title: 'Restore Info', description: 'Contact JBVNL IT support to initiate a point-in-time restore.' })}>
              Restore Info
            </Button>
            <Button onClick={() => setOpenModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminSettings;
