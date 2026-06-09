import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockApi } from '@/lib/mockApi';
import { Gauge, Plus, Edit, Trash2, AlertTriangle, Search, RefreshCw } from 'lucide-react';

interface Meter {
  _id: string;
  meterNumber: string;
  consumerNumber: string;
  meterType: string;
  previousReading: number;
  currentReading: number;
  installationDate: string;
  status: string;
  isSimulated: boolean;
  lastUpdated: string;
}

const MeterManagement: React.FC = () => {
  const { toast } = useToast();
  const [meters, setMeters]         = useState<Meter[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState<Meter | null>(null);
  const [newReading, setNewReading] = useState('');
  const [simCount, setSimCount]     = useState(0);

  const [form, setForm] = useState({
    meterNumber: '', consumerNumber: '',
    meterType: 'domestic', previousReading: '', currentReading: ''
  });

  const fetchMeters = async () => {
    setLoading(true);
    const data = await mockApi.getMeters();
    setMeters(data);
    const sc = await mockApi.getSimulatedMeterCount();
    setSimCount(sc);
    setLoading(false);
  };

  useEffect(() => { fetchMeters(); }, []);

  const filtered = meters.filter(m =>
    m.meterNumber.toLowerCase().includes(search.toLowerCase()) ||
    m.consumerNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      await mockApi.createMeter({
        meterNumber:     form.meterNumber,
        consumerNumber:  form.consumerNumber,
        meterType:       form.meterType,
        previousReading: Number(form.previousReading) || 0,
        currentReading:  Number(form.currentReading)  || 0,
      });
      toast({ title: '✅ Meter Created', description: `Meter ${form.meterNumber} assigned` });
      setShowCreate(false);
      setForm({ meterNumber: '', consumerNumber: '', meterType: 'domestic', previousReading: '', currentReading: '' });
      fetchMeters();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateReading = async () => {
    if (!showUpdate) return;
    try {
      await mockApi.updateMeterReading(showUpdate._id, Number(newReading));
      toast({ title: '✅ Reading Updated', description: `Meter ${showUpdate.meterNumber} updated to ${newReading} kWh` });
      setShowUpdate(null);
      setNewReading('');
      fetchMeters();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, meterNumber: string) => {
    if (!confirm(`Delete meter ${meterNumber}?`)) return;
    await mockApi.deleteMeter(id);
    toast({ title: 'Meter Deleted' });
    fetchMeters();
  };

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    simulated: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    faulty: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    replaced: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Gauge className="h-6 w-6 text-blue-500" /> Meter Management</h1>
          <p className="text-muted-foreground">Assign and manage consumer electricity meters</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMeters} size="sm"><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" /> Assign Meter</Button>
        </div>
      </div>

      {/* Simulated meter warning */}
      {simCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              {simCount} simulated meter{simCount > 1 ? 's' : ''} detected
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-500">
              These were auto-created because no physical meter was assigned. Please replace them with real meter data to ensure accurate billing.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Meters', value: meters.length, color: 'text-blue-600' },
          { label: 'Active', value: meters.filter(m => m.status === 'active').length, color: 'text-green-600' },
          { label: 'Simulated', value: meters.filter(m => m.isSimulated).length, color: 'text-amber-600' },
          { label: 'Faulty', value: meters.filter(m => m.status === 'faulty').length, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <CardContent className="pt-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by meter number or consumer number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading meters...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No meters found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 px-2">Meter No.</th>
                    <th className="text-left py-3 px-2">Consumer No.</th>
                    <th className="text-left py-3 px-2">Type</th>
                    <th className="text-right py-3 px-2">Prev. Reading</th>
                    <th className="text-right py-3 px-2">Curr. Reading</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Last Updated</th>
                    <th className="py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={m._id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 font-mono font-semibold">{m.meterNumber}</td>
                      <td className="py-3 px-2">{m.consumerNumber}</td>
                      <td className="py-3 px-2 capitalize">{m.meterType}</td>
                      <td className="py-3 px-2 text-right">{m.previousReading ?? 0} kWh</td>
                      <td className="py-3 px-2 text-right font-semibold">{m.currentReading ?? 0} kWh</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[m.status] || ''}`}>
                          {m.isSimulated ? '⚠ Simulated' : m.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {m.lastUpdated ? new Date(m.lastUpdated).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1 justify-center">
                          <Button size="icon" variant="ghost" onClick={() => { setShowUpdate(m); setNewReading(String(m.currentReading ?? 0)); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(m._id, m.meterNumber)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Meter Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign New Meter</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { label: 'Meter Number', key: 'meterNumber', placeholder: 'e.g. MTR-001234' },
              { label: 'Consumer Number', key: 'consumerNumber', placeholder: 'e.g. JHK-0001' },
              { label: 'Previous Reading (kWh)', key: 'previousReading', placeholder: '0' },
              { label: 'Current Reading (kWh)', key: 'currentReading', placeholder: '0' },
            ].map(f => (
              <div key={f.key}>
                <Label className="mb-1 block">{f.label}</Label>
                <Input
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div>
              <Label className="mb-1 block">Meter Type</Label>
              <Select value={form.meterType} onValueChange={v => setForm(prev => ({ ...prev, meterType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="domestic">Domestic</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Meter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Reading Dialog */}
      <Dialog open={!!showUpdate} onOpenChange={() => setShowUpdate(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Meter Reading</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Meter: <strong>{showUpdate?.meterNumber}</strong> — Consumer: <strong>{showUpdate?.consumerNumber}</strong></p>
            <p className="text-sm">Previous reading: <strong>{showUpdate?.previousReading ?? 0} kWh</strong></p>
            <Label className="block">New Current Reading (kWh)</Label>
            <Input
              type="number"
              value={newReading}
              onChange={e => setNewReading(e.target.value)}
              placeholder="Enter current reading..."
              min={showUpdate?.currentReading ?? 0}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdate(null)}>Cancel</Button>
            <Button onClick={handleUpdateReading}>Update Reading</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeterManagement;
