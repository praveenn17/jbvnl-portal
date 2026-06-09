import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockApi } from '@/lib/mockApi';
import { Settings2, Save, RefreshCw, Zap, Building2, Factory } from 'lucide-react';

interface TariffRate {
  ratePerUnit: number;
  fixedCharge: number;
  taxRate: number;
}

interface TariffData {
  _id?: string;
  domestic: TariffRate;
  commercial: TariffRate;
  industrial: TariffRate;
  effectiveFrom?: string;
}

const DEFAULT: TariffData = {
  domestic:   { ratePerUnit: 6.5,  fixedCharge: 80,  taxRate: 5 },
  commercial: { ratePerUnit: 9.0,  fixedCharge: 150, taxRate: 5 },
  industrial: { ratePerUnit: 7.5,  fixedCharge: 250, taxRate: 5 },
};

const TariffManagement: React.FC = () => {
  const { toast }   = useToast();
  const [tariff, setTariff] = useState<TariffData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getTariff().then(data => {
      setTariff(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const update = (type: 'domestic' | 'commercial' | 'industrial', field: keyof TariffRate, value: string) => {
    setTariff(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: parseFloat(value) || 0 }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await mockApi.updateTariff({
        domestic:   tariff.domestic,
        commercial: tariff.commercial,
        industrial: tariff.industrial,
      });
      setTariff(updated);
      toast({ title: '✅ Tariff Updated', description: 'New rates will apply to the next billing cycle.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const segments = [
    { key: 'domestic'   as const, label: 'Domestic',   icon: <Zap className="h-5 w-5 text-blue-500" />,   color: 'border-blue-200 dark:border-blue-800' },
    { key: 'commercial' as const, label: 'Commercial', icon: <Building2 className="h-5 w-5 text-purple-500" />, color: 'border-purple-200 dark:border-purple-800' },
    { key: 'industrial' as const, label: 'Industrial', icon: <Factory className="h-5 w-5 text-orange-500" />, color: 'border-orange-200 dark:border-orange-800' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-blue-500" /> Tariff Management
          </h1>
          <p className="text-muted-foreground">Configure electricity billing rates by consumer category</p>
          {tariff.effectiveFrom && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(tariff.effectiveFrom).toLocaleString('en-IN')}
            </p>
          )}
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Tariff'}
        </Button>
      </div>

      {/* Formula info */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Bill Calculation Formula</p>
          <code className="text-sm text-blue-700 dark:text-blue-400">
            Total = (Units × Rate/Unit) + Fixed Charge + GST on Energy Charges
          </code>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {segments.map(seg => (
          <Card key={seg.key} className={`border-2 ${seg.color}`}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {seg.icon} {seg.label} Tariff
              </CardTitle>
              <CardDescription>
                Applies to consumers with meter type: <strong>{seg.label.toLowerCase()}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1 block">Rate per Unit (₹/kWh)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={tariff[seg.key].ratePerUnit}
                    onChange={e => update(seg.key, 'ratePerUnit', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Fixed Charge (₹/month)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={tariff[seg.key].fixedCharge}
                    onChange={e => update(seg.key, 'fixedCharge', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Tax / GST Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={tariff[seg.key].taxRate}
                    onChange={e => update(seg.key, 'taxRate', e.target.value)}
                  />
                </div>
              </div>
              {/* Preview */}
              <div className="mt-4 p-3 bg-muted/40 rounded-lg text-sm">
                <p className="font-semibold text-muted-foreground mb-1">Example (200 kWh)</p>
                <p>Energy: 200 × ₹{tariff[seg.key].ratePerUnit} = ₹{(200 * tariff[seg.key].ratePerUnit).toFixed(0)}</p>
                <p>Fixed: ₹{tariff[seg.key].fixedCharge}</p>
                <p>Tax ({tariff[seg.key].taxRate}%): ₹{((200 * tariff[seg.key].ratePerUnit) * tariff[seg.key].taxRate / 100).toFixed(0)}</p>
                <p className="font-bold mt-1 text-foreground">
                  Total: ₹{(
                    200 * tariff[seg.key].ratePerUnit +
                    tariff[seg.key].fixedCharge +
                    (200 * tariff[seg.key].ratePerUnit * tariff[seg.key].taxRate / 100)
                  ).toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TariffManagement;
