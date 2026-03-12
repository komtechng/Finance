import React from 'react';
import { Card } from '../components/ui/card';
import { CreditCard } from 'lucide-react';

export default function LoansPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="loans-page">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Loan Management</h1>
        <p className="text-slate-600 mt-1">Manage loan applications, approvals, and repayments</p>
      </div>
      <Card className="p-12 text-center border border-slate-200">
        <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Loan Management Module</h3>
        <p className="text-slate-600">Full loan workflow with applications, approvals, disbursements, and repayment tracking.</p>
      </Card>
    </div>
  );
}