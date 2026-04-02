import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Calendar, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminManagement: React.FC = () => {
  const navigate = useNavigate();

  const mockAdmins = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@jbvnl.com',
      phone: '+91 9876543210',
      zone: 'North Bihar',
      joinDate: '2023-01-15',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@jbvnl.com',
      phone: '+91 9876543211',
      zone: 'South Bihar',
      joinDate: '2023-02-20',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c74c?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Amit Singh',
      email: 'amit.singh@jbvnl.com',
      phone: '+91 9876543212',
      zone: 'East Bihar',
      joinDate: '2023-03-10',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Sunita Devi',
      email: 'sunita.devi@jbvnl.com',
      phone: '+91 9876543213',
      zone: 'West Bihar',
      joinDate: '2023-04-05',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 5,
      name: 'Manoj Jha',
      email: 'manoj.jha@jbvnl.com',
      phone: '+91 9876543214',
      zone: 'Central Bihar',
      joinDate: '2023-05-12',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 6,
      name: 'Rekha Kumari',
      email: 'rekha.kumari@jbvnl.com',
      phone: '+91 9876543215',
      zone: 'North Bihar',
      joinDate: '2023-06-18',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 7,
      name: 'Kanishk Kumar Sinha',
      email: 'kanishk.sinha@jbvnl.com',
      phone: '+91 9876543216',
      zone: 'South Bihar',
      joinDate: '2023-07-22',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 8,
      name: 'Neha Gupta',
      email: 'neha.gupta@jbvnl.com',
      phone: '+91 9876543217',
      zone: 'East Bihar',
      joinDate: '2023-08-14',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 9,
      name: 'Deepak Yadav',
      email: 'deepak.yadav@jbvnl.com',
      phone: '+91 9876543218',
      zone: 'West Bihar',
      joinDate: '2023-09-09',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 10,
      name: 'Anita Roy',
      email: 'anita.roy@jbvnl.com',
      phone: '+91 9876543219',
      zone: 'Central Bihar',
      joinDate: '2023-10-03',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
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
              Administrator Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage all system administrators across Bihar zones
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm opacity-90">Total Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">10</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm opacity-90">Active Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm opacity-90">Zones Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm opacity-90">Avg Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2.4h</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAdmins.map((admin) => (
            <Card key={admin.id} className="hover-scale bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={admin.avatar} alt={admin.name} />
                  <AvatarFallback className="text-lg">{admin.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{admin.name}</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="truncate">{admin.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-500" />
                  <span>{admin.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span>{admin.zone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span>Joined {admin.joinDate}</span>
                </div>
                <div className="pt-2 border-t">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;