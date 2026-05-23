import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, TrendingUp, Settings, CheckCircle, DollarSign,
  FileBarChart, MessageSquare, AlertTriangle, Send, Inbox,
  RefreshCcw, Lock, ChevronRight, ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockApi } from '../../lib/mockApi';
import ConversationChatModal from '../chat/ConversationChatModal';

// Priority/status color helpers
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
};
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  read: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  closed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, totalUsers: 0, pendingComplaints: 0 });
  const [activeUsersOpen, setActiveUsersOpen] = useState(false);
  const [consumers, setConsumers] = useState<User[]>([]);

  // New conversation state
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageData, setMessageData] = useState({ subject: '', priority: 'medium', category: 'system', message: '' });
  const [sendingMsg, setSendingMsg] = useState(false);

  // My Conversations state
  const [convOpen, setConvOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await mockApi.getManagerStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    fetchStats();
  }, []);

  const loadConsumers = async () => {
    try {
      const data = await mockApi.getConsumersForManager();
      setConsumers(data);
      setActiveUsersOpen(true);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load consumers', variant: 'destructive' });
    }
  };

  const loadConversations = async () => {
    setLoadingConv(true);
    try {
      const data = await mockApi.getConversations();
      setConversations(data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to load conversations', variant: 'destructive' });
    } finally {
      setLoadingConv(false);
    }
  };

  const openMyConversations = () => {
    setConvOpen(true);
    loadConversations();
  };

  // Send message now creates a Conversation (two-way thread)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageData.subject || !messageData.message) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setSendingMsg(true);
    try {
      await mockApi.createConversation(messageData);
      toast({ title: 'Message Sent', description: 'Your conversation has been started. Admin will reply shortly.' });
      setMessageOpen(false);
      setMessageData({ subject: '', priority: 'medium', category: 'system', message: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to send message', variant: 'destructive' });
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Manager Info */}
        <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-2xl p-8 text-white border border-white/10 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name || 'Manager'}</h1>
              <p className="text-blue-100 text-lg">System Manager Dashboard</p>
              <Badge variant="secondary" className="mt-3 bg-white/20 text-white border-white/30">
                Manager Level Access
              </Badge>
            </div>
            <div className="text-right">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                alt="Manager Avatar"
                className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-scale cursor-pointer bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg" onClick={loadConsumers}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Users</CardTitle>
              <Users className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-sm opacity-90">Consumers across Jharkhand</p>
            </CardContent>
          </Card>

          <Card
            className="hover-scale cursor-pointer bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg"
            onClick={() => navigate('/manager/revenue-details')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Revenue</CardTitle>
              <DollarSign className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{stats.revenue ? (stats.revenue / 100000).toFixed(1) + 'L' : '0.0L'}</div>
              <p className="text-sm opacity-90">Total Revenue | Click for details</p>
            </CardContent>
          </Card>

          <Card
            className="hover-scale cursor-pointer bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg"
            onClick={() => navigate('/manager/reports-analytics')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Analytics</CardTitle>
              <FileBarChart className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Reports</div>
              <p className="text-sm opacity-90">Click for insights</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions — 4 cards now */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className="hover-scale cursor-pointer bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg"
            onClick={() => setMessageOpen(true)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message Admin
              </CardTitle>
              <CardDescription className="text-indigo-100">
                Start a new conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">Send reports or escalate issues</p>
            </CardContent>
          </Card>

          <Card
            className="hover-scale cursor-pointer bg-gradient-to-br from-sky-500 to-blue-600 text-white border-0 shadow-lg"
            onClick={openMyConversations}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                My Conversations
              </CardTitle>
              <CardDescription className="text-sky-100">
                View Admin replies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">
                {conversations.length > 0 ? `${conversations.length} conversation(s)` : 'View your message history'}
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover-scale cursor-pointer bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg"
            onClick={() => navigate('/manager/complaints')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                My Team's Complaints
              </CardTitle>
              <CardDescription className="text-amber-100">
                Manage and resolve assigned complaints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">Update statuses and work notes</p>
            </CardContent>
          </Card>

          <Card
            className="hover-scale cursor-pointer bg-gradient-to-br from-teal-500 to-green-600 text-white border-0 shadow-lg"
            onClick={() => setSettingsOpen(true)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Parameters
              </CardTitle>
              <CardDescription className="text-teal-100">
                Configure your dashboard parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">Uptime: 99.98%</p>
            </CardContent>
          </Card>
        </div>

        {/* ── New Message / Start Conversation Modal ─────────────── */}
        <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Start Conversation with Admin</DialogTitle>
              <DialogDescription>
                Send a message to the system admin and start a two-way conversation thread.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendMessage} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Message subject"
                  value={messageData.subject}
                  onChange={e => setMessageData({ ...messageData, subject: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={messageData.priority} onValueChange={v => setMessageData({ ...messageData, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={messageData.category} onValueChange={v => setMessageData({ ...messageData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="consumer">Consumer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Enter your message details here..."
                  className="min-h-[120px]"
                  value={messageData.message}
                  onChange={e => setMessageData({ ...messageData, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={sendingMsg}>
                <Send className="w-4 h-4 mr-2" />
                {sendingMsg ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── My Conversations Modal ──────────────────────────────── */}
        <Dialog open={convOpen} onOpenChange={setConvOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle>My Conversations with Admin</DialogTitle>
                  <DialogDescription>Click on any conversation to open the chat.</DialogDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadConversations} disabled={loadingConv}>
                  <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
                </Button>
              </div>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              {loadingConv ? (
                <div className="text-center py-8 text-muted-foreground">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Inbox className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No conversations yet.</p>
                  <p className="text-sm mt-1">Click "Message Admin" to start one.</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv._id}
                    onClick={() => { setConvOpen(false); setOpenChatId(conv._id); }}
                    className={`rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] ${conv.status === 'open' ? 'border-l-4 border-l-blue-500' : ''}`}
                    style={{ background: 'hsl(217, 33%, 14%)', border: '1px solid hsl(217, 33%, 22%)' }}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-blue-400 shrink-0" />
                          <span className="font-semibold text-foreground truncate">{conv.subject}</span>
                          {conv.status === 'open' && <Badge className="bg-blue-500 text-white text-xs">New</Badge>}
                          {conv.status === 'closed' && <Lock className="h-3 w-3 text-red-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {new Date(conv.lastMessageAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessagePreview}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge className={`text-xs ${PRIORITY_COLORS[conv.priority]}`}>{conv.priority}</Badge>
                        <Badge className={`text-xs ${STATUS_COLORS[conv.status]}`}>{conv.status}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{conv.category}</Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Active Users Modal */}
        <Dialog open={activeUsersOpen} onOpenChange={setActiveUsersOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Active Consumers in Jharkhand</DialogTitle>
              <DialogDescription>
                List of all registered and approved consumers in the database.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {consumers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No active consumers found.</p>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Consumer No</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {consumers.map(c => (
                        <tr key={c.id || c._id} className="bg-card">
                          <td className="px-4 py-3 font-medium">
                            {c.name}<br />
                            <span className="text-xs text-muted-foreground font-normal">{c.email}</span>
                          </td>
                          <td className="px-4 py-3">{c.consumerNumber}</td>
                          <td className="px-4 py-3">{c.phone}</td>
                          <td className="px-4 py-3 truncate max-w-[150px]">{c.address}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="bg-green-100 text-green-700">{c.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <div className="fixed bottom-6 right-6">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Manager Settings</DialogTitle>
                <DialogDescription>
                  Configure your manager dashboard preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="flex flex-col space-y-1">
                    <span>Push Notifications</span>
                    <span className="text-sm text-muted-foreground">Receive alerts for critical events</span>
                  </Label>
                  <Switch id="notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-reports" className="flex flex-col space-y-1">
                    <span>Weekly Email Reports</span>
                    <span className="text-sm text-muted-foreground">Send summary reports via email</span>
                  </Label>
                  <Switch id="email-reports" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="debug-logging" className="flex flex-col space-y-1">
                    <span>Debug Logging</span>
                    <span className="text-sm text-muted-foreground">Enable detailed system logs</span>
                  </Label>
                  <Switch id="debug-logging" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Conversation Chat Modal (outside Dialog to avoid z-index issues) */}
      {openChatId && (
        <ConversationChatModal
          conversationId={openChatId}
          onClose={() => { setOpenChatId(null); loadConversations(); }}
          onStatusChange={(id, status) => {
            setConversations(prev => prev.map(c => c._id === id ? { ...c, status } : c));
          }}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;
