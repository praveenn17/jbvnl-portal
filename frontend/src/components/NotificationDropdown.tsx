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
import { mockApi } from '../lib/mockApi';

type Notification = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  type: string;
  createdAt: string;
};

const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await mockApi.getNotifications();
      setNotifications(data);
      const unreadData = await mockApi.getUnreadNotificationCount();
      setUnreadCount(unreadData);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // In a real app, you might want to poll here:
    // const interval = setInterval(fetchNotifications, 60000);
    // return () => clearInterval(interval);
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await mockApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await mockApi.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await mockApi.markNotificationRead(notif._id);
        setNotifications(prev => 
          prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await mockApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      // Re-fetch unread count just to be safe
      const count = await mockApi.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getIcon = (type: string, priority: string) => {
    if (priority === 'urgent' || priority === 'high') {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    switch (type) {
      case 'USER_APPROVAL': return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case 'BILL_UPDATED': return <CreditCard className="h-4 w-4 text-blue-500" />;
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
          {loading && notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            notifications.map(notif => (
              <DropdownMenuItem 
                key={notif._id} 
                className="flex flex-col items-start p-4 cursor-pointer focus:bg-muted/50 group"
                onClick={(e) => {
                  e.preventDefault();
                  handleNotificationClick(notif);
                }}
              >
                <div className="flex items-start gap-3 w-full relative">
                  <div className={`mt-0.5 shrink-0 p-1.5 rounded-full ${notif.isRead ? 'bg-muted' : 'bg-primary/10'}`}>
                    {getIcon(notif.type, notif.priority)}
                  </div>
                  <div className="flex-1 space-y-1 pr-6">
                    <p className={`text-sm font-medium leading-none ${notif.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    onClick={(e) => handleDelete(e, notif._id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
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
