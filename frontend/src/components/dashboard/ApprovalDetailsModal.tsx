import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '../../types';
import { CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ApprovalDetailsModalProps {
  user: User | null;
  onClose: () => void;
}

const ApprovalDetailsModal: React.FC<ApprovalDetailsModalProps> = ({ user, onClose }) => {
  const { updateUserStatus } = useAuth();
  const { toast } = useToast();

  if (!user) return null;

  const handleAction = async (action: 'approved' | 'rejected') => {
    try {
      await updateUserStatus(user.id, action);
      toast({
        title: action === 'approved' ? 'User Approved' : 'User Rejected',
        description: `The user ${user.name} has been ${action}.`,
      });
      onClose();
    } catch (err) {
      toast({
        title: 'Action Failed',
        description: 'Failed to update user status.',
        variant: 'destructive',
      });
    }
  };

  const isEmailVerified = (user as any).isEmailVerified !== false; // assuming true if undefined for legacy mock data

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            User Approval Request
            <Badge variant="outline" className="capitalize">{user.role}</Badge>
            <Badge className="bg-yellow-500/20 text-yellow-500">{user.status}</Badge>
          </DialogTitle>
          <DialogDescription>Review user details before granting access.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Full Name</p>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
              <p className="text-sm font-medium text-foreground">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Location</p>
              <p className="text-sm font-medium text-foreground">{user.address || 'Jharkhand, India'}</p>
            </div>
          </div>
          
          <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-3">Verification Timeline</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Account Registered</p>
                  <p className="text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {isEmailVerified ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">Email Verified</p>
                  <p className="text-xs text-muted-foreground">{isEmailVerified ? 'OTP Verification complete' : 'Pending OTP verification'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Awaiting Admin Approval</p>
                  <p className="text-xs text-muted-foreground">Requires manual review for {user.role} role.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-popover border border-border/50 p-3 rounded-lg">
            <ShieldAlert className="h-4 w-4 shrink-0 text-primary" />
            <p><strong>Note:</strong> Manager and Consumer accounts require admin approval to access dashboard features and sensitive data.</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto text-destructive hover:text-destructive" onClick={() => handleAction('rejected')}>
            Reject Request
          </Button>
          <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction('approved')}>
            Approve {user.role}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDetailsModal;
