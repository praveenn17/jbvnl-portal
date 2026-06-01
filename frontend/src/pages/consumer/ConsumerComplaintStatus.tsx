import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/lib/mockApi';
import { Complaint } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ConsumerComplaintStatus: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const cNum = user?.consumerNumber || '0000';
        const data = await mockApi.getComplaints(cNum);
        setComplaints(data);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load complaints', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user, toast]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <MessageSquare className="h-7 w-7" />
              Complaint Status
            </h1>
            <p className="text-muted-foreground">Track and manage your registered complaints</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {complaints.length > 0 ? complaints.map((complaint) => (
              <Card key={complaint.id || complaint._id} className="hover-scale">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{complaint.title}</CardTitle>
                      <CardDescription>{complaint.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{complaint.category}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        Priority: <Badge variant="secondary" className="ml-1">{complaint.priority}</Badge>
                      </span>
                      <span className="text-sm font-medium">
                        Status: <Badge className="ml-1">{complaint.status}</Badge>
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/consumer/complaint-tracking/${complaint._id || complaint.id}`)}
                    >
                      Track Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-16 rounded-lg border border-border">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Complaints Found</p>
                <p className="text-muted-foreground mb-6">You haven't registered any complaints yet.</p>
                <Button onClick={() => navigate('/consumer/form/register-complaint')}>
                  Register New Complaint
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerComplaintStatus;
