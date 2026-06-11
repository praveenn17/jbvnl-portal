import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockApi } from '../lib/mockApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Phone, MapPin, Key, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Edit states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Password Modal states
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Logout All states
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await mockApi.getMyProfile();
      setProfile(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to fetch profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const data = await mockApi.updateMyProfile({ name, phone, address });
      setProfile(data);
      setEditing(false);
      toast({ title: 'Success', description: 'Profile updated successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update profile', variant: 'destructive' });
    }
  };

  const handleCancelEdit = () => {
    setName(profile?.name || '');
    setPhone(profile?.phone || '');
    setAddress(profile?.address || '');
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Error', description: 'All fields are required.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }

    setPwdLoading(true);
    try {
      await mockApi.changePassword({ currentPassword, newPassword, confirmPassword });
      toast({ title: 'Success', description: 'Password changed successfully.' });
      setPwdModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to change password', variant: 'destructive' });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await mockApi.logoutAllDevices();
      toast({ title: 'Success', description: 'Logged out from all devices.' });
      logout();
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to logout from all devices', variant: 'destructive' });
    }
  };

  if (loading || !profile) {
    return <div className="min-h-screen bg-background p-6 flex justify-center items-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5 text-primary" /> Personal Information</CardTitle>
                <CardDescription>View and manage your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Full Name</Label>
                    {editing ? (
                      <Input value={name} onChange={e => setName(e.target.value)} />
                    ) : (
                      <div className="font-medium">{profile.name}</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Email Address</Label>
                    <div className="font-medium">{profile.email}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Phone Number</Label>
                    {editing ? (
                      <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Not provided" />
                    ) : (
                      <div className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" /> {profile.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Role</Label>
                    <div><Badge className="capitalize bg-primary/20 text-primary border-primary/30">{profile.role}</Badge></div>
                  </div>
                  {profile.role === 'consumer' && profile.consumerNumber && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Consumer Number</Label>
                      <div className="font-medium font-mono bg-muted px-2 py-1 rounded w-fit">{profile.consumerNumber}</div>
                    </div>
                  )}
                  {profile.role === 'manager' ? (
                    <div className="col-span-2 space-y-1">
                      <Label className="text-muted-foreground">Employee ID</Label>
                      <div className="font-medium">{profile.employeeId || 'Not provided'}</div>
                    </div>
                  ) : (
                    <div className="col-span-2 space-y-1">
                      <Label className="text-muted-foreground">Address</Label>
                      {editing ? (
                        <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Not provided" />
                      ) : (
                        <div className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" /> {profile.address || 'Not provided'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t border-border/50 pt-6">
                {editing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                  </div>
                ) : (
                  <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Security</CardTitle>
                <CardDescription>Manage your account security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Account Status</div>
                  <Badge variant={profile.status === 'approved' ? 'default' : 'secondary'} className="capitalize">{profile.status}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Member Since</div>
                  <div className="text-sm text-muted-foreground">{new Date(profile.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="pt-4 space-y-3 border-t border-border/50">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setPwdModalOpen(true)}>
                    <Key className="h-4 w-4 mr-2" /> Change Password
                  </Button>
                  <Button variant="destructive" className="w-full justify-start bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20" onClick={() => setLogoutAllOpen(true)}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout All Devices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Dialog open={pwdModalOpen} onOpenChange={setPwdModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and a new secure password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters, with uppercase, lowercase, number, and special character.</p>
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdModalOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={pwdLoading}>{pwdLoading ? 'Saving...' : 'Update Password'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout All Devices Alert */}
      <AlertDialog open={logoutAllOpen} onOpenChange={setLogoutAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will log you out from all active sessions on all devices immediately. You will need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, logout all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
