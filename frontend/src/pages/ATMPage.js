import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Plus, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDateTime } from '../lib/utils';

export default function ATMPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    card_type: 'verve',
    bank_name: '',
    card_last_four: '',
    transaction_type: 'withdrawal',
    amount: '',
    service_fee: '100',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/atm/transactions');
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/atm/transactions', {
        ...formData,
        amount: parseFloat(formData.amount),
        service_fee: parseFloat(formData.service_fee)
      });
      toast.success('Transaction recorded successfully');
      setOpen(false);
      setFormData({ card_type: 'verve', bank_name: '', card_last_four: '', transaction_type: 'withdrawal', amount: '', service_fee: '100', notes: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record transaction');
    }
  };

  const totalAmount = transactions.reduce((sum, txn) => sum + (txn.transaction_type === 'deposit' ? txn.amount : 0), 0);
  const totalWithdrawals = transactions.reduce((sum, txn) => sum + (txn.transaction_type === 'withdrawal' ? txn.amount : 0), 0);
  const totalFees = transactions.reduce((sum, txn) => sum + txn.service_fee, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="atm-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">ATM Card Services</h1>
          <p className="text-slate-600 mt-1">Process card withdrawals, deposits, and balance inquiries</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white" data-testid="new-transaction-button">
              <Plus className="w-4 h-4 mr-2" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process ATM Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="atm-transaction-form">
              <div>
                <Label>Transaction Type</Label>
                <Select value={formData.transaction_type} onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}>
                  <SelectTrigger data-testid="transaction-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="balance_inquiry">Balance Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Card Type</Label>
                <Select value={formData.card_type} onValueChange={(value) => setFormData({ ...formData, card_type: value })}>
                  <SelectTrigger data-testid="card-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verve">Verve</SelectItem>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input id="bank_name" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} required placeholder="e.g. GTBank, Access Bank" data-testid="bank-name-input" />
              </div>
              <div>
                <Label htmlFor="card_last_four">Card Last 4 Digits</Label>
                <Input id="card_last_four" value={formData.card_last_four} onChange={(e) => setFormData({ ...formData, card_last_four: e.target.value })} required maxLength="4" placeholder="1234" data-testid="card-last-four-input" />
              </div>
              {formData.transaction_type !== 'balance_inquiry' && (
                <>
                  <div>
                    <Label htmlFor="amount">Amount (NGN)</Label>
                    <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required data-testid="amount-input" />
                  </div>
                  <div>
                    <Label htmlFor="service_fee">Service Fee (NGN)</Label>
                    <Input id="service_fee" type="number" step="0.01" value={formData.service_fee} onChange={(e) => setFormData({ ...formData, service_fee: e.target.value })} required data-testid="service-fee-input" />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} data-testid="notes-input" />
              </div>
              <Button type="submit" className="w-full bg-primary text-white" data-testid="submit-transaction-button">Process Transaction</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Deposits</p>
          <p className="text-3xl font-heading font-bold text-emerald-600" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalAmount)}</p>
        </Card>
        <Card className="p-6 border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Withdrawals</p>
          <p className="text-3xl font-heading font-bold text-red-600" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalWithdrawals)}</p>
        </Card>
        <Card className="p-6 border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Service Fees Collected</p>
          <p className="text-3xl font-heading font-bold text-blue-600" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalFees)}</p>
        </Card>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Card</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Bank</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fee</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-testid={`transaction-row-${txn.id}`}>
                  <td className="py-3 px-4 text-sm text-slate-700">{formatDateTime(txn.transaction_date)}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 font-medium">{txn.transaction_ref}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">****{txn.card_last_four}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">{txn.bank_name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      txn.transaction_type === 'deposit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      txn.transaction_type === 'withdrawal' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {txn.transaction_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700 font-medium">{formatCurrency(txn.amount)}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{formatCurrency(txn.service_fee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 mt-6">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No ATM transactions recorded yet</p>
        </div>
      )}
    </div>
  );
}