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
import { ArrowLeft, AlertTriangle, Clock, Calendar, MapPin, User, Filter, Phone, Eye, RefreshCw, Users, MessageCircle } from 'lucide-react';
import { Complaint } from '@/types';
import { mockApi } from '@/lib/mockApi';
import { DEPARTMENTS } from '@/lib/constants';

const STATUSES = ['open', 'in_progress', 'assigned', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const timeAgo = (d: string) => { const ms = Date.now() - new Date(d).getTime(); const days = Math.ceil(ms / 864e5); if (days < 2) return '1 day ago'; if (days < 7) return `${days} days ago`; if (days < 30) return `${Math.ceil(days / 7)} weeks ago`; return `${Math.ceil(days / 30)} months ago`; };
const priorityClass = (p: string) => ({ urgent: 'bg-red-500/20 text-red-400 border-red-500/30', high: 'bg-orange-500/20 text-orange-400 border-orange-500/30', medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }[p] ?? 'bg-muted text-muted-foreground');
const statusClass = (s: string) => ({ open: 'bg-sky-500/20 text-sky-400', in_progress: 'bg-amber-500/20 text-amber-400', assigned: 'bg-purple-500/20 text-purple-400', resolved: 'bg-emerald-500/20 text-emerald-400', closed: 'bg-muted text-muted-foreground', pending: 'bg-orange-500/20 text-orange-400' }[s] ?? 'bg-muted text-muted-foreground');
const slaClass = (s?: string) => ({ on_track: 'bg-emerald-500/20 text-emerald-400', at_risk: 'bg-amber-500/20 text-amber-400', breached: 'bg-red-500/20 text-red-400', completed: 'bg-cyan-500/20 text-cyan-400' }[s || 'on_track'] ?? 'bg-muted text-muted-foreground');

const ActiveComplaints: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [contactId, setContactId] = useState<string | null>(null);
  const [updateStatusId, setUpdateStatusId] = useState<string | null>(null);
  const [assignId, setAssignId] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [priorityId, setPriorityId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newPriority, setNewPriority] = useState('');

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

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
    let list = [...complaints];
    if (filterStatus !== 'all') list = list.filter(c => c.status === filterStatus);
    if (filterPriority !== 'all') list = list.filter(c => c.priority === filterPriority);
    const prioOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else list.sort((a, b) => (prioOrder[a.priority] ?? 9) - (prioOrder[b.priority] ?? 9));
    return list;
  }, [complaints, filterStatus, filterPriority, sortBy]);

  const getComp = (id: string | null) => complaints.find(c => c.id === id || c._id === id);
  const detail = getComp(detailId);
  const contact = getComp(contactId);
  const updatingStatus = getComp(updateStatusId);
  const assigning = getComp(assignId);
  const noting = getComp(noteId);
  const changingPriority = getComp(priorityId);

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

  const handleAssign = async () => {
    if (!assignId || !newTeam) return;
    try {
      await mockApi.assignComplaint(assignId, '', newTeam, newNote);
      toast({ title: 'Success', description: 'Complaint assigned.' });
      setAssignId(null);
      fetchComplaints();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to assign complaint.', variant: 'destructive' });
    }
  };

  const handleAddNote = async () => {
    if (!noteId || !newNote) return;
    try {
      await mockApi.addComplaintNote(noteId, newNote);
      toast({ title: 'Success', description: 'Note added.' });
      setNoteId(null);
      fetchComplaints();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to add note.', variant: 'destructive' });
    }
  };

  const handleUpdatePriority = async () => {
    if (!priorityId || !newPriority) return;
    try {
      await mockApi.updateComplaintPriority(priorityId, newPriority, newNote);
      toast({ title: 'Success', description: 'Complaint priority updated.' });
      setPriorityId(null);
      fetchComplaints();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update priority.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Active Complaints</h1>
            <p className="text-muted-foreground">Monitor and manage consumer complaints lifecycle</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Complaints</CardTitle><AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-foreground">{complaints.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">SLA Breached</CardTitle><AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-400">{complaints.filter(c => c.sla?.status === 'breached').length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle><Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-400">{complaints.filter(c => c.priority === 'high' || c.priority === 'urgent').length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Oldest Issue</CardTitle><Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-purple-400">{complaints.length > 0 ? timeAgo(complaints.reduce((a, b) => new Date(a.createdAt) < new Date(b.createdAt) ? a : b).createdAt) : 'None'}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground"><AlertTriangle className="h-5 w-5" />Complaint Details</CardTitle>
                <CardDescription>Click any action button to manage complaints</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)}><Filter className="h-4 w-4 mr-2" />Filter & Sort</Button>
            </div>
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
                        <Button variant="outline" size="sm" onClick={() => { setAssignId(c.id || c._id || null); setNewTeam(c.assignedTeam || ''); setNewNote(''); }}><Users className="h-4 w-4 mr-1" />Assign</Button>
                        <Button variant="outline" size="sm" onClick={() => { setUpdateStatusId(c.id || c._id || null); setNewStatus(c.status); setNewNote(''); }}><RefreshCw className="h-4 w-4 mr-1" />Status</Button>
                        <Button variant="outline" size="sm" onClick={() => { setPriorityId(c.id || c._id || null); setNewPriority(c.priority); setNewNote(''); }}><AlertTriangle className="h-4 w-4 mr-1" />Priority</Button>
                        <Button variant="outline" size="sm" onClick={() => { setNoteId(c.id || c._id || null); setNewNote(''); }}><MessageCircle className="h-4 w-4 mr-1" />Note</Button>
                        <Button variant="outline" size="sm" onClick={() => setContactId(c.id || c._id || null)}><Phone className="h-4 w-4 mr-1" />Contact</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No complaints found.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                {detail.resolvedAt && <div><p className="text-xs text-muted-foreground">Resolved At</p><p className="text-sm font-medium text-foreground">{new Date(detail.resolvedAt).toLocaleString('en-IN')}</p></div>}
                {detail.contactNumber && <div><p className="text-xs text-muted-foreground">Contact Phone</p><p className="text-sm font-medium text-foreground">{detail.contactNumber}</p></div>}
                {detail.preferredTime && <div><p className="text-xs text-muted-foreground">Preferred Time</p><p className="text-sm font-medium text-foreground">{detail.preferredTime}</p></div>}
              </div>
              
              <div><p className="text-xs text-muted-foreground mb-1">Full Description</p><p className="text-sm text-foreground bg-muted/40 p-3 rounded-lg border border-border/50">{detail.description}</p></div>
              
              {detail.adminNotes && detail.adminNotes.length > 0 && (
                <div><p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
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

      <Dialog open={!!contactId} onOpenChange={() => setContactId(null)}>
        <DialogContent>
          {contact && (<>
            <DialogHeader>
              <DialogTitle>Contact Consumer</DialogTitle>
              <DialogDescription>{contact.consumerNumber}</DialogDescription>
            </DialogHeader>
            <div className="py-6 text-muted-foreground">
              {contact.contactNumber ? (
                <div className="space-y-4 text-left bg-muted/20 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Contact Phone</p>
                    <p className="text-lg font-semibold text-foreground">{contact.contactNumber}</p>
                  </div>
                  {contact.preferredTime && (
                    <div>
                      <p className="text-xs text-muted-foreground">Preferred Contact Time</p>
                      <p className="text-md font-medium text-foreground">{contact.preferredTime}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>Consumer details are masked in this view. Use consumer lookup via dashboard.</p>
                </div>
              )}
            </div>
            <DialogFooter><Button onClick={() => setContactId(null)}>Close</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

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
              </div>
              <div className="space-y-2"><Label>Update Note (optional)</Label><Textarea placeholder="Explain what work was done..." value={newNote} onChange={e => setNewNote(e.target.value)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setUpdateStatusId(null)}>Cancel</Button><Button onClick={handleUpdateStatus}>Save Status</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignId} onOpenChange={() => setAssignId(null)}>
        <DialogContent>
          {assigning && (<>
            <DialogHeader>
              <DialogTitle>Assign Complaint</DialogTitle>
              <DialogDescription>{assigning.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Assign to Team</Label>
                <Select value={newTeam} onValueChange={setNewTeam}><SelectTrigger><SelectValue placeholder="Select Team" /></SelectTrigger><SelectContent className="bg-popover">{DEPARTMENTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Assignment Note</Label><Textarea placeholder="Instructions for the team..." value={newNote} onChange={e => setNewNote(e.target.value)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setAssignId(null)}>Cancel</Button><Button onClick={handleAssign}>Confirm Assignment</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

      <Dialog open={!!noteId} onOpenChange={() => setNoteId(null)}>
        <DialogContent>
          {noting && (<>
            <DialogHeader>
              <DialogTitle>Add Admin Note</DialogTitle>
              <DialogDescription>Internal note for {noting.id || noting._id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Note Content</Label><Textarea placeholder="Internal admin/manager note..." value={newNote} onChange={e => setNewNote(e.target.value)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setNoteId(null)}>Cancel</Button><Button onClick={handleAddNote}>Save Note</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

      <Dialog open={!!priorityId} onOpenChange={() => setPriorityId(null)}>
        <DialogContent>
          {changingPriority && (<>
            <DialogHeader>
              <DialogTitle>Update Priority</DialogTitle>
              <DialogDescription>{changingPriority.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>New Priority</Label>
                <Select value={newPriority} onValueChange={setNewPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="bg-popover">{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Reason for Change (optional)</Label><Textarea placeholder="Explain why priority is changing..." value={newNote} onChange={e => setNewNote(e.target.value)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setPriorityId(null)}>Cancel</Button><Button onClick={handleUpdatePriority}>Save Priority</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Filter & Sort Complaints</DialogTitle><DialogDescription className="sr-only">Filter complaints</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="bg-popover"><SelectItem value="all">All</SelectItem>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="bg-popover"><SelectItem value="all">All</SelectItem>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(v: 'newest' | 'oldest' | 'priority') => setSortBy(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="bg-popover"><SelectItem value="newest">Newest First</SelectItem><SelectItem value="oldest">Oldest First</SelectItem><SelectItem value="priority">Priority</SelectItem></SelectContent></Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setFilterStatus('all'); setFilterPriority('all'); setSortBy('newest'); }}>Reset</Button><Button onClick={() => setFilterOpen(false)}>Apply</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveComplaints;