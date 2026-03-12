import React from 'react';
import { Card } from '../components/ui/card';
import { DollarSign } from 'lucide-react';

export default function ATMPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="atm-page">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">ATM Card Services</h1>
        <p className="text-slate-600 mt-1">Process card withdrawals, deposits, and balance inquiries</p>
      </div>
      <Card className="p-12 text-center border border-slate-200">
        <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">ATM Services Module</h3>
        <p className="text-slate-600">Handle cash services for any ATM card with transaction fee tracking.</p>
      </Card>
    </div>
  );
}