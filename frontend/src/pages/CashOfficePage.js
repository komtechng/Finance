import React from 'react';
import { Card } from '../components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function CashOfficePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="cash-office-page">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Cash Office</h1>
        <p className="text-slate-600 mt-1">Monitor cash flow and reconciliation</p>
      </div>
      <Card className="p-12 text-center border border-slate-200">
        <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Cash Office Module</h3>
        <p className="text-slate-600">Central cash ledger tracking all inflows and outflows with reconciliation.</p>
      </Card>
    </div>
  );
}