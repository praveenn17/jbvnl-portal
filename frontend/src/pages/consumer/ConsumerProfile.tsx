import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '@/lib/mockApi';
import { useAuth } from '@/contexts/AuthContext';

const ConsumerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth() as any;
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    consumerNumber: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await mockApi.getMyProfile();
        const profData = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          consumerNumber: data.consumerNumber || ''
        };
        setProfile(profData);
        setEditedProfile(profData);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    // Validate phone number before saving
    const phone = editedProfile.phone.trim();
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 10 digits (numbers only, no spaces or country codes).",
        variant: "destructive"
      });
      return;
    }
    try {
      await mockApi.updateMyProfile({
        name: editedProfile.name,
        phone: phone || undefined,
        address: editedProfile.address
      });
      setProfile(editedProfile);
      setIsEditing(false);
      if (refreshUser) await refreshUser();
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (err: any) {
      toast({
        title: "Failed to Update",
        description: err.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  };
  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-background p-6 flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Profile Management</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your account details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                  />
                ) : (
                  <p className="text-lg font-medium">{profile.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email}
                    disabled // Email cannot be changed here usually
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{profile.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <>
                    <Input
                      id="phone"
                      type="tel"
                      value={editedProfile.phone}
                      maxLength={10}
                      onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value.replace(/\D/g, '')})}
                    />
                    {editedProfile.phone.length > 0 && !/^[0-9]{10}$/.test(editedProfile.phone) && (
                      <p className="text-xs text-red-500">
                        Phone must be exactly 10 digits ({editedProfile.phone.length} entered)
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-lg">{profile.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumer">Consumer Number</Label>
                <p className="text-lg font-medium text-primary">{profile.consumerNumber}</p>
                <p className="text-sm text-muted-foreground">Consumer number cannot be changed</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={editedProfile.address}
                    onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                  />
                ) : (
                  <p className="text-lg">{profile.address}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary-600">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary-600">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connection Details</CardTitle>
            <CardDescription>Your electricity connection information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium">Connection Type</Label>
                <p className="text-lg">Residential</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Sanctioned Load</Label>
                <p className="text-lg">5 KW</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tariff Category</Label>
                <p className="text-lg">LT-1A</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsumerProfile;