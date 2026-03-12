import React from 'react';
import { Card } from '../components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function InvestmentsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="investments-page">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Investment Management</h1>
        <p className="text-slate-600 mt-1">Track investor funds and profit payouts</p>
      </div>
      <Card className="p-12 text-center border border-slate-200">
        <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Investment Module</h3>
        <p className="text-slate-600">Manage external investments with monthly, quarterly, and annual return plans.</p>
      </Card>
    </div>
  );
}