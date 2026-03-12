import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Card } from '../components/ui/card';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDateTime } from '../lib/utils';

export default function CashOfficePage() {
  const [ledger, setLedger] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ledgerRes, balanceRes] = await Promise.all([
        api.get('/cash/ledger'),
        api.get('/cash/balance')
      ]);
      setLedger(ledgerRes.data);
      setBalance(balanceRes.data.balance);
    } catch (error) {
      toast.error('Failed to load cash office data');
    } finally {
      setLoading(false);
    }
  };

  const totalInflows = ledger.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
  const totalOutflows = ledger.filter(e => e.amount < 0).reduce((sum, e) => sum + Math.abs(e.amount), 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="cash-office-page">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Cash Office</h1>
        <p className="text-slate-600 mt-1">Monitor cash flow and reconciliation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border border-emerald-100 bg-emerald-50">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-emerald-700 uppercase tracking-wider">Cash on Hand</p>
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-4xl font-heading font-bold text-emerald-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(balance)}</p>
        </Card>
        <Card className="p-6 border border-blue-100 bg-blue-50">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">Total Inflows</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-4xl font-heading font-bold text-blue-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalInflows)}</p>
        </Card>
        <Card className="p-6 border border-red-100 bg-red-50">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-red-700 uppercase tracking-wider">Total Outflows</p>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-4xl font-heading font-bold text-red-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalOutflows)}</p>
        </Card>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">Cash Ledger</h3>
          <p className="text-sm text-slate-600">All cash movements and transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-testid={`ledger-entry-${entry.id}`}>
                  <td className="py-3 px-4 text-sm text-slate-700">{formatDateTime(entry.transaction_date)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      entry.transaction_type === 'deposit' || entry.transaction_type === 'loan_repayment' || entry.transaction_type === 'sale' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {entry.transaction_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">{entry.description}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">{entry.reference_id || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-medium ${
                      entry.amount >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {ledger.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 mt-6">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No cash transactions recorded yet</p>
        </div>
      )}
    </div>
  );
}