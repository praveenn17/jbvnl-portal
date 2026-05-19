import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, AlertTriangle, Clock, Calendar, MapPin, User, Eye, RefreshCw, MessageCircle } from 'lucide-react';
import { Complaint } from '@/types';
import { mockApi } from '@/lib/mockApi';

const STATUSES = ['in_progress', 'resolved'];

const timeAgo = (d: string) => { const ms = Date.now() - new Date(d).getTime(); const days = Math.ceil(ms / 864e5); if (days < 2) return '1 day ago'; if (days < 7) return `${days} days ago`; if (days < 30) return `${Math.ceil(days / 7)} weeks ago`; return `${Math.ceil(days / 30)} months ago`; };
const priorityClass = (p: string) => ({ urgent: 'bg-red-500/20 text-red-400 border-red-500/30', high: 'bg-orange-500/20 text-orange-400 border-orange-500/30', medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }[p] ?? 'bg-muted text-muted-foreground');
const statusClass = (s: string) => ({ open: 'bg-sky-500/20 text-sky-400', in_progress: 'bg-amber-500/20 text-amber-400', assigned: 'bg-purple-500/20 text-purple-400', resolved: 'bg-emerald-500/20 text-emerald-400', closed: 'bg-muted text-muted-foreground', pending: 'bg-orange-500/20 text-orange-400' }[s] ?? 'bg-muted text-muted-foreground');
const slaClass = (s?: string) => ({ on_track: 'bg-emerald-500/20 text-emerald-400', at_risk: 'bg-amber-500/20 text-amber-400', breached: 'bg-red-500/20 text-red-400', completed: 'bg-cyan-500/20 text-cyan-400' }[s || 'on_track'] ?? 'bg-muted text-muted-foreground');

const ManagerComplaints: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [detailId, setDetailId] = useState<string | null>(null);
  const [updateStatusId, setUpdateStatusId] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);

  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [newNote, setNewNote] = useState('');

  const fetchComplaints = async () => {
    try {
      const data = await mockApi.getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to fetch complaints.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = useMemo(() => {
    return [...complaints].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [complaints]);

  const getComp = (id: string | null) => complaints.find(c => c.id === id || c._id === id);
  const detail = getComp(detailId);
  const updatingStatus = getComp(updateStatusId);
  const noting = getComp(noteId);

  const handleUpdateStatus = async () => {
    if (!updateStatusId || !newStatus) return;
    try {
      await mockApi.updateComplaintStatus(updateStatusId, newStatus as any, newNote);
      toast({ title: 'Success', description: 'Complaint status updated.' });
      setUpdateStatusId(null);
      fetchComplaints();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update status.', variant: 'destructive' });
    }
  };

  const handleAddNote = async () => {
    if (!noteId || !newNote) return;
    try {
      await mockApi.addComplaintNote(noteId, newNote);
      toast({ title: 'Success', description: 'Note added.' });
      setNoteId(null);
      fetchComplaints();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add note.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Team's Complaints</h1>
            <p className="text-muted-foreground">Manage tasks assigned to you and your team</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground"><AlertTriangle className="h-5 w-5" />Assigned Complaints</CardTitle>
            <CardDescription>Update status and add work notes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-center text-muted-foreground py-8">Loading complaints...</p> : (
              <div className="space-y-4">
                {filtered.map(c => (
                  <div key={c.id || c._id} className="border border-border/50 rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2 flex-wrap">
                          {c.title}
                          <Badge className={priorityClass(c.priority)}>{c.priority}</Badge>
                          <Badge className={slaClass(c.sla?.status)}>SLA: {c.sla?.status.replace('_', ' ')}</Badge>
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{c.description}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <Badge className={statusClass(c.status)}>{c.status.replace('_', ' ')}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">ID: {c.id || c._id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground shrink-0" /><div><p className="text-sm font-medium text-foreground">{c.consumerNumber}</p></div></div>
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" /><p className="text-xs text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap" title={c.assignedTeam || 'Unassigned'}>{c.assignedTeam || 'Unassigned'}</p></div>
                      <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground shrink-0" /><p className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</p></div>
                      {c.sla?.dueAt && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground shrink-0" /><div><p className="text-xs font-medium">Due</p><p className="text-[10px] text-muted-foreground">{new Date(c.sla.dueAt).toLocaleString()}</p></div></div>}
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{c.category.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => setDetailId(c.id || c._id || null)}><Eye className="h-4 w-4 mr-1" />Details</Button>
                        <Button variant="outline" size="sm" disabled={c.status === 'resolved' || c.status === 'closed'} onClick={() => { setUpdateStatusId(c.id || c._id || null); setNewStatus(c.status); setNewNote(''); }}><RefreshCw className="h-4 w-4 mr-1" />Status</Button>
                        <Button variant="outline" size="sm" onClick={() => { setNoteId(c.id || c._id || null); setNewNote(''); }}><MessageCircle className="h-4 w-4 mr-1" />Note</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No assigned complaints found.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── VIEW DETAILS MODAL ──────────────────────────────────────────────── */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detail && (<>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-wrap">{detail.title}<Badge className={priorityClass(detail.priority)}>{detail.priority}</Badge><Badge className={statusClass(detail.status)}>{detail.status.replace('_', ' ')}</Badge></DialogTitle>
              <DialogDescription>Complaint ID: {detail.id || detail._id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-lg">
                <div><p className="text-xs text-muted-foreground">Consumer No.</p><p className="text-sm font-medium text-foreground">{detail.consumerNumber}</p></div>
                <div><p className="text-xs text-muted-foreground">Category</p><p className="text-sm font-medium text-foreground">{detail.category.replace('_', ' ')}</p></div>
                <div><p className="text-xs text-muted-foreground">Assigned Team</p><p className="text-sm font-medium text-foreground">{detail.assignedTeam || 'None'}</p></div>
                <div><p className="text-xs text-muted-foreground">Reported</p><p className="text-sm font-medium text-foreground">{new Date(detail.createdAt).toLocaleString('en-IN')}</p></div>
                {detail.sla && <div><p className="text-xs text-muted-foreground">SLA Target</p><p className="text-sm font-medium text-foreground">{new Date(detail.sla.dueAt).toLocaleString('en-IN')}</p></div>}
              </div>
              
              <div><p className="text-xs text-muted-foreground mb-1">Full Description</p><p className="text-sm text-foreground bg-muted/40 p-3 rounded-lg border border-border/50">{detail.description}</p></div>
              
              {detail.adminNotes && detail.adminNotes.length > 0 && (
                <div><p className="text-xs text-muted-foreground mb-1">Admin/Work Notes</p>
                <div className="space-y-2 bg-muted/40 p-3 rounded-lg border border-border/50">
                  {detail.adminNotes.map((n, i) => (
                    <div key={i} className="text-sm mb-2 pb-2 border-b border-border/50 last:border-0 last:pb-0 last:mb-0">
                      <p className="text-foreground whitespace-pre-wrap">{n.note}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()} — {n.addedByRole} ({n.addedBy})</p>
                    </div>
                  ))}
                </div></div>
              )}

              {detail.timeline && detail.timeline.length > 0 && (
                <div><p className="text-xs text-muted-foreground mb-2">Lifecycle Timeline</p>
                  <div className="space-y-3">
                    {detail.timeline.map((t, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm relative">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 z-10 relative" />
                        <div className="bg-muted/30 border border-border/50 p-2 rounded w-full">
                          <p className="font-medium text-foreground">{t.title}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{t.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(t.createdAt).toLocaleString()} — {t.changedByRole}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter><Button onClick={() => setDetailId(null)}>Close</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

      {/* ─── UPDATE STATUS MODAL ─────────────────────────────────────────────── */}
      <Dialog open={!!updateStatusId} onOpenChange={() => setUpdateStatusId(null)}>
        <DialogContent>
          {updatingStatus && (<>
            <DialogHeader>
              <DialogTitle>Update Status</DialogTitle>
              <DialogDescription>{updatingStatus.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="bg-popover">{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}</SelectContent></Select>
                <p className="text-xs text-muted-foreground mt-1">Managers can only move assigned tickets to 'In Progress' and then 'Resolved'. Admins handle closing.</p>
              </div>
              <div className="space-y-2"><Label>Update Note (mandatory)</Label><Textarea placeholder="Explain what work was done..." value={newNote} onChange={e => setNewNote(e.target.value)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setUpdateStatusId(null)}>Cancel</Button><Button onClick={handleUpdateStatus} disabled={!newNote}>Save Status</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

      {/* ─── ADD NOTE MODAL ───────────────────────────────────────────────────── */}
      <Dialog open={!!noteId} onOpenChange={() => setNoteId(null)}>
        <DialogContent>
          {noting && (<>
            <DialogHeader>
              <DialogTitle>Add Work Note</DialogTitle>
              <DialogDescription>Add a note to {noting.id || noting._id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Note Content</Label><Textarea placeholder="Work log or note..." value={newNote} onChange={e => setNewNote(e.target.value)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setNoteId(null)}>Cancel</Button><Button onClick={handleAddNote}>Save Note</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerComplaints;
