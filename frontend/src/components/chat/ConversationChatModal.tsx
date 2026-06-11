import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { mockApi } from '@/lib/mockApi';
import { useAuth } from '@/contexts/AuthContext';
import { X, Send, Lock, MessageSquare, Clock, CheckCheck, Loader2 } from 'lucide-react';
import { Conversation, ConversationMessage } from '@/types';

interface ConversationChatModalProps {
  conversationId: string;
  onClose: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  read: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  closed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ConversationChatModal: React.FC<ConversationChatModalProps> = ({
  conversationId,
  onClose,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAdmin = user?.role === 'admin';
  const isClosed = conversation?.status === 'closed';

  // Load conversation + messages
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await mockApi.getConversationById(conversationId);
        setConversation(data.conversation);
        setMessages(data.messages);

        // Auto-mark as read
        if (data.conversation.status === 'open') {
          await mockApi.markConversationRead(conversationId).catch(() => {});
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to load conversation', variant: 'destructive' });
        onClose();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    if (isClosed) {
      toast({ title: 'Closed', description: 'This conversation has been closed.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const newMsg = await mockApi.replyToConversation(conversationId, replyText.trim());
      setMessages(prev => [...prev, newMsg]);
      setReplyText('');
      textareaRef.current?.focus();

      // Update last message preview in conversation header
      setConversation(prev => prev ? {
        ...prev,
        lastMessagePreview: replyText.trim().slice(0, 100),
        lastMessageAt: new Date().toISOString(),
        status: prev.status === 'read' ? 'open' : prev.status,
      } : prev);
    } catch (err: any) {
      toast({ title: 'Send Failed', description: err.message || 'Could not send reply', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!isAdmin) return;
    setClosing(true);
    try {
      await mockApi.closeConversation(conversationId);
      setConversation(prev => prev ? { ...prev, status: 'closed' } : prev);
      onStatusChange?.(conversationId, 'closed');
      toast({ title: 'Conversation Closed', description: 'This conversation has been closed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to close conversation', variant: 'destructive' });
    } finally {
      setClosing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'hsl(217, 33%, 10%)', border: '1px solid hsl(217, 33%, 22%)', maxHeight: '90vh' }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between p-4 border-b" style={{ borderColor: 'hsl(217, 33%, 20%)' }}>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <MessageSquare className="h-4 w-4 text-blue-400 shrink-0" />
                <h3 className="font-semibold text-white truncate">{conversation?.subject}</h3>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  Started by <span className="text-blue-400">{conversation?.initiatedByName}</span>
                </span>
                <Badge className={`text-xs px-2 py-0.5 ${PRIORITY_STYLES[conversation?.priority || 'medium']}`}>
                  {conversation?.priority}
                </Badge>
                <Badge className={`text-xs px-2 py-0.5 ${STATUS_STYLES[conversation?.status || 'open']}`}>
                  {conversation?.status}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-0.5 capitalize">
                  {conversation?.category}
                </Badge>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 ml-2 shrink-0">
            {isAdmin && !isClosed && !loading && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClose}
                disabled={closing}
                className="text-xs h-7"
              >
                {closing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3 mr-1" />}
                Close
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Messages Area ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: '50vh' }}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No messages yet.</p>
            </div>
          ) : (
            messages.map(msg => {
              const isOwnMessage = (msg.sender?._id || msg.sender) === (user?.id || (user as any)?._id);
              const senderRole = msg.sender?.role || msg.senderRole || 'unknown';
              const senderName = msg.sender?.name || msg.senderName || 'Unknown';
              const isManagerMsg = senderRole === 'manager';

              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {/* Sender info */}
                    <div className={`flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-medium text-muted-foreground">
                        {senderName}
                      </span>
                      <Badge
                        className={`text-xs px-1.5 py-0 h-4 ${
                          senderRole === 'admin'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        }`}
                      >
                        {senderRole}
                      </Badge>
                    </div>

                    {/* Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isOwnMessage
                          ? 'rounded-tr-sm bg-blue-600 text-white'
                          : 'rounded-tl-sm text-foreground'
                      }`}
                      style={!isOwnMessage ? { background: 'hsl(217, 33%, 18%)', border: '1px solid hsl(217, 33%, 25%)' } : {}}
                    >
                      {msg.message}
                    </div>

                    {/* Timestamp */}
                    <div className={`flex items-center gap-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatTime(msg.createdAt)}</span>
                      {isOwnMessage && <CheckCheck className="h-3 w-3 text-blue-400" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Closed Banner or Reply Box ──────────────────────── */}
        <div className="p-4 border-t" style={{ borderColor: 'hsl(217, 33%, 20%)' }}>
          {isClosed ? (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-red-400 rounded-lg"
              style={{ background: 'hsl(0, 50%, 12%)', border: '1px solid hsl(0, 50%, 25%)' }}>
              <Lock className="h-4 w-4" />
              This conversation has been closed. No further replies are allowed.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Textarea
                ref={textareaRef}
                placeholder="Type your reply... (Ctrl+Enter to send)"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                disabled={sending || loading}
                className="resize-none text-sm"
                style={{ background: 'hsl(217, 33%, 14%)', borderColor: 'hsl(217, 33%, 25%)' }}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {sending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationChatModal;
