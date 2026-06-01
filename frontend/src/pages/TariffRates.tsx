import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Zap, Building2, Factory, Info } from 'lucide-react';

const TariffRates = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Tariff Rates</h1>
            <p className="text-muted-foreground">Current electricity rates for all consumer categories</p>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-muted/30 border border-border rounded-lg p-4 text-sm text-foreground">
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Effective Date: April 1, 2024</p>
            <p className="mt-1">The below rates are exclusive of fixed charges, electricity duty, and fuel surcharge (FPPCA).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Domestic */}
          <Card>
            <CardHeader className="bg-emerald-50 rounded-t-lg border-b">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Zap className="h-5 w-5" />
                Domestic (LT-1)
              </CardTitle>
              <CardDescription>Residential households</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">0 - 100 Units</span>
                  <span className="font-semibold">₹4.50 / unit</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">101 - 200 Units</span>
                  <span className="font-semibold">₹5.75 / unit</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">201 - 500 Units</span>
                  <span className="font-semibold">₹6.50 / unit</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">500+ Units</span>
                  <span className="font-semibold">₹7.25 / unit</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commercial */}
          <Card>
            <CardHeader className="bg-blue-50 rounded-t-lg border-b">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Building2 className="h-5 w-5" />
                Commercial (LT-2)
              </CardTitle>
              <CardDescription>Shops, Offices, Businesses</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">0 - 100 Units</span>
                  <span className="font-semibold">₹6.50 / unit</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">101 - 500 Units</span>
                  <span className="font-semibold">₹7.75 / unit</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">500+ Units</span>
                  <span className="font-semibold">₹8.50 / unit</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industrial */}
          <Card>
            <CardHeader className="bg-orange-50 rounded-t-lg border-b">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Factory className="h-5 w-5" />
                Industrial (HT)
              </CardTitle>
              <CardDescription>Factories and Large Industries</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">All Units</span>
                  <span className="font-semibold">₹8.75 / unit (Flat)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charges */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Applicable Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3 border-b pb-2">Fixed Monthly Charges</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Domestic</span>
                    <span className="font-medium">₹80 / kW / Month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commercial</span>
                    <span className="font-medium">₹150 / kW / Month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industrial</span>
                    <span className="font-medium">₹350 / kVA / Month</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 border-b pb-2">Other Surcharges</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fuel Surcharge (FPPCA)</span>
                    <span className="font-medium">₹0.45 / Unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Electricity Duty</span>
                    <span className="font-medium">5% of Energy Charge</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delayed Payment Surcharge</span>
                    <span className="font-medium">1.5% per Month</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default TariffRates;
