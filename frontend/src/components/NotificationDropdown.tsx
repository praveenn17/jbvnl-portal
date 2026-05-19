import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash2, Info, AlertTriangle, ShieldCheck, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'alert' | 'success' | 'payment';
};

const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Generate mock notifications based on role
    if (!user) return;

    let mockNotifs: Notification[] = [];
    const now = new Date();
    
    if (user.role === 'admin') {
      mockNotifs = [
        { id: '1', title: 'New Manager Request', message: 'A new manager registration is pending approval.', time: '10 mins ago', read: false, type: 'info' },
        { id: '2', title: 'Backup Successful', message: 'Database backup completed successfully at 2:00 AM.', time: '5 hours ago', read: false, type: 'success' },
        { id: '3', title: 'High Priority Complaint', message: 'Urgent power outage reported in Sector 5.', time: '1 day ago', read: true, type: 'alert' },
      ];
    } else if (user.role === 'manager') {
      mockNotifs = [
        { id: '1', title: 'Complaint Assigned', message: 'You have been assigned 3 new complaints.', time: '30 mins ago', read: false, type: 'info' },
        { id: '2', title: 'Billing Query', message: 'Consumer JBVNL002 raised a billing query.', time: '2 hours ago', read: false, type: 'info' },
        { id: '3', title: 'Emergency Outage', message: 'Transformer failure reported in Dhanbad.', time: '1 day ago', read: true, type: 'alert' },
      ];
    } else {
      mockNotifs = [
        { id: '1', title: 'Bill Generated', message: 'Your electricity bill for March is generated.', time: '2 hours ago', read: false, type: 'payment' },
        { id: '2', title: 'Complaint Updated', message: 'Status of your complaint CMP-2024-001 changed to In Progress.', time: '1 day ago', read: false, type: 'success' },
        { id: '3', title: 'Payment Reminder', message: 'Your due date is in 3 days.', time: '2 days ago', read: true, type: 'alert' },
      ];
    }
    
    setNotifications(mockNotifs);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'success': return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case 'payment': return <CreditCard className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 bg-popover border-border">
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="p-0 font-semibold text-base">Notifications</DropdownMenuLabel>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <Check className="h-3 w-3 mr-1" /> Mark read
            </Button>
            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-destructive" onClick={clearAll} disabled={notifications.length === 0}>
              <Trash2 className="h-3 w-3 mr-1" /> Clear
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            notifications.map(notif => (
              <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-4 cursor-default focus:bg-muted/50">
                <div className="flex items-start gap-3 w-full">
                  <div className={`mt-0.5 shrink-0 p-1.5 rounded-full ${notif.read ? 'bg-muted' : 'bg-primary/10'}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-medium leading-none ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {notif.time}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
