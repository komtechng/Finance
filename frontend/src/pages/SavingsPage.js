import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Plus, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDateTime } from '../lib/utils';

export default function SavingsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_id: '',
    customer_id: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txnRes, custRes, accRes] = await Promise.all([
        api.get('/savings/transactions'),
        api.get('/customers'),
        api.get('/savings/accounts')
      ]);
      setTransactions(txnRes.data);
      setCustomers(custRes.data);
      setAccounts(accRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/savings/transactions', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Collection recorded successfully');
      setOpen(false);
      setFormData({ account_id: '', customer_id: '', amount: '', notes: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record collection');
    }
  };

  const handleVerify = async (transactionId) => {
    try {
      await api.post(`/savings/transactions/${transactionId}/verify`);
      toast.success('Transaction verified');
      loadData();
    } catch (error) {
      toast.error('Failed to verify transaction');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const isCashier = ['cashier', 'branch_manager', 'super_admin'].includes(user?.role);

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="savings-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Savings Collections</h1>
          <p className="text-slate-600 mt-1">Record and manage daily contributions</p>
        </div>
        {['agent', 'savings_officer'].includes(user?.role) && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white" data-testid="record-collection-button">
                <Plus className="w-4 h-4 mr-2" />
                Record Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Savings Collection</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="collection-form">
                <div>
                  <Label>Customer</Label>
                  <Select value={formData.customer_id} onValueChange={(value) => {
                    setFormData({ ...formData, customer_id: value });
                    const customerAccounts = accounts.filter(a => a.customer_id === value);
                    if (customerAccounts.length > 0) {
                      setFormData(prev => ({ ...prev, customer_id: value, account_id: customerAccounts[0].id }));
                    }
                  }}>
                    <SelectTrigger data-testid="customer-select">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Savings Account</Label>
                  <Select value={formData.account_id} onValueChange={(value) => setFormData({ ...formData, account_id: value })}>
                    <SelectTrigger data-testid="account-select">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(a => a.customer_id === formData.customer_id).map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.account_number} - {a.frequency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (NGN)</Label>
                  <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required data-testid="amount-input" />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} data-testid="notes-input" />
                </div>
                <Button type="submit" className="w-full bg-primary text-white" data-testid="submit-collection-button">Record Collection</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                {isCashier && <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>}
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-testid={`transaction-row-${txn.id}`}>
                  <td className="py-3 px-4 text-sm text-slate-700">{formatDateTime(txn.collection_date)}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{customers.find(c => c.id === txn.customer_id)?.full_name || '-'}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 font-medium">{formatCurrency(txn.amount)}</td>
                  <td className="py-3 px-4">
                    {txn.verified_by_cashier ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-medium" data-testid={`status-verified-${txn.id}`}>
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-xs font-medium" data-testid={`status-pending-${txn.id}`}>
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </td>
                  {isCashier && (
                    <td className="py-3 px-4">
                      {!txn.verified_by_cashier && (
                        <Button size="sm" onClick={() => handleVerify(txn.id)} className="bg-primary text-white text-xs" data-testid={`verify-button-${txn.id}`}>
                          Verify
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 mt-6">
          <p className="text-slate-500">No transactions recorded yet</p>
        </div>
      )}
    </div>
  );
}
