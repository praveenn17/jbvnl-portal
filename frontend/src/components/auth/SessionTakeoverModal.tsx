import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Laptop, Globe, Clock, AlertTriangle } from 'lucide-react';
import { SessionInfo } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface SessionTakeoverModalProps {
  sessionInfo: SessionInfo;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const SessionTakeoverModal: React.FC<SessionTakeoverModalProps> = ({ 
  sessionInfo, 
  onConfirm, 
  onCancel,
  isLoading 
}) => {
  const [isHovering, setIsHovering] = useState(false);

  // Format the time since last login
  let timeAgo = 'Unknown time';
  try {
    if (sessionInfo.loginTime) {
      timeAgo = formatDistanceToNow(new Date(sessionInfo.loginTime), { addSuffix: true });
    }
  } catch (e) {
    console.error("Error formatting date", e);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-primary/20 shadow-2xl overflow-hidden glass-effect">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
        
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-xl text-foreground">Active Session Detected</CardTitle>
          <CardDescription className="text-sm mt-2 text-muted-foreground">
            You are already logged in on another device or browser. Only one active session is allowed at a time for security.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="bg-muted/50 rounded-lg p-4 border border-border/50 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Previous Session Details</h4>
            
            <div className="flex items-start gap-3">
              <Laptop className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-none">Device & Browser</p>
                <p className="text-xs text-muted-foreground">{sessionInfo.browser} on {sessionInfo.deviceInfo}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-none">Location & IP</p>
                <p className="text-xs text-muted-foreground">{sessionInfo.location} ({sessionInfo.ipAddress})</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-none">Last Active</p>
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-200 dark:border-amber-900/50">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p>Continuing will immediately log out your other session.</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 pb-6">
          <Button 
            variant="default" 
            className="w-full relative overflow-hidden group bg-primary hover:bg-primary/90 transition-all duration-300"
            onClick={onConfirm}
            disabled={isLoading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Hover glow effect */}
            <span className={`absolute inset-0 bg-white/20 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`} />
            
            {isLoading ? 'Processing Takeover...' : 'Logout Previous Session & Continue'}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SessionTakeoverModal;
