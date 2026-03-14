import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Plus, CheckCircle, Clock, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDateTime } from '../lib/utils';

export default function SavingsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAccount, setOpenAccount] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);
  const [accountForm, setAccountForm] = useState({
    customer_id: '',
    frequency: 'daily',
    target_amount: ''
  });
  const [collectionForm, setCollectionForm] = useState({
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

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/savings/accounts', {
        ...accountForm,
        target_amount: parseFloat(accountForm.target_amount)
      });
      toast.success('Savings account created successfully');
      setOpenAccount(false);
      setAccountForm({ customer_id: '', frequency: 'daily', target_amount: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create account');
    }
  };

  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/savings/transactions', {
        ...collectionForm,
        amount: parseFloat(collectionForm.amount)
      });
      toast.success('Collection recorded successfully');
      setOpenCollection(false);
      setCollectionForm({ account_id: '', customer_id: '', amount: '', notes: '' });
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
  const canCreateAccount = ['super_admin', 'branch_manager', 'savings_officer', 'agent'].includes(user?.role);
  const canRecordCollection = ['super_admin', 'branch_manager', 'savings_officer', 'agent', 'cashier'].includes(user?.role);

  // Calculate collection stats
  const today = new Date().toDateString();
  const todaysCollections = transactions.filter(t => new Date(t.collection_date).toDateString() === today);
  const todaysTotal = todaysCollections.reduce((sum, t) => sum + t.amount, 0);
  const pendingVerifications = transactions.filter(t => !t.verified_by_cashier).length;
  const verifiedToday = transactions.filter(t => t.verified_by_cashier && new Date(t.verification_date).toDateString() === today).length;

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="savings-page">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Savings Management</h1>
        <p className="text-slate-600 mt-1">Manage savings accounts and daily contributions</p>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="accounts" data-testid="tab-accounts">Savings Accounts</TabsTrigger>
          <TabsTrigger value="collections" data-testid="tab-collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-600">Manage customer savings accounts</p>
            {canCreateAccount && (
              <Dialog open={openAccount} onOpenChange={setOpenAccount}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-white" data-testid="create-account-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Savings Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-semibold text-slate-900">Create Savings Account</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAccountSubmit} className="space-y-5 mt-4" data-testid="account-form">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Customer</Label>
                      <Select value={accountForm.customer_id} onValueChange={(value) => setAccountForm({ ...accountForm, customer_id: value })}>
                        <SelectTrigger className="h-11" data-testid="account-customer-select">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.full_name} - {c.customer_number}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Savings Frequency</Label>
                      <Select value={accountForm.frequency} onValueChange={(value) => setAccountForm({ ...accountForm, frequency: value })}>
                        <SelectTrigger className="h-11" data-testid="frequency-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily Savings</SelectItem>
                          <SelectItem value="weekly">Weekly Savings</SelectItem>
                          <SelectItem value="monthly">Monthly Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target_amount" className="text-slate-700 font-medium">Target Amount (NGN)</Label>
                      <Input 
                        id="target_amount" 
                        type="number" 
                        step="0.01" 
                        value={accountForm.target_amount} 
                        onChange={(e) => setAccountForm({ ...accountForm, target_amount: e.target.value })} 
                        required 
                        className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                        placeholder="10000"
                        data-testid="target-amount-input" 
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-primary/90 font-medium shadow-md mt-6" data-testid="submit-account-button">
                      Create Account
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => {
              const customer = customers.find(c => c.id === account.customer_id);
              const progress = (account.current_balance / account.target_amount) * 100;
              return (
                <Card key={account.id} className="p-6 border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all duration-200" data-testid={`account-card-${account.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-500 uppercase tracking-wider">Account {account.account_number}</p>
                      <h3 className="text-lg font-semibold text-slate-900 mt-1">{customer?.full_name || 'Unknown'}</h3>
                    </div>
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Frequency:</span>
                      <span className="text-slate-900 font-medium capitalize">{account.frequency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Current Balance:</span>
                      <span className="text-emerald-600 font-medium">{formatCurrency(account.current_balance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Target:</span>
                      <span className="text-slate-900 font-medium">{formatCurrency(account.target_amount)}</span>
                    </div>
                    <div className="pt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>Progress</span>
                        <span>{Math.min(progress, 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        account.is_active 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-slate-50 text-slate-700 border border-slate-100'
                      }`}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {accounts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No savings accounts created yet</p>
              {canCreateAccount && (
                <Button onClick={() => setOpenAccount(true)} className="bg-primary text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Account
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collections">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6 border border-blue-100 bg-blue-50">
              <p className="text-sm font-medium text-blue-700 uppercase tracking-wider mb-2">Today's Collections</p>
              <p className="text-3xl font-heading font-bold text-blue-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{todaysCollections.length}</p>
              <p className="text-sm text-blue-600 mt-1">{formatCurrency(todaysTotal)}</p>
            </Card>
            <Card className="p-6 border border-emerald-100 bg-emerald-50">
              <p className="text-sm font-medium text-emerald-700 uppercase tracking-wider mb-2">Verified Today</p>
              <p className="text-3xl font-heading font-bold text-emerald-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{verifiedToday}</p>
              <p className="text-sm text-emerald-600 mt-1">Approved</p>
            </Card>
            <Card className="p-6 border border-orange-100 bg-orange-50">
              <p className="text-sm font-medium text-orange-700 uppercase tracking-wider mb-2">Pending Verification</p>
              <p className="text-3xl font-heading font-bold text-orange-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{pendingVerifications}</p>
              <p className="text-sm text-orange-600 mt-1">Awaiting cashier</p>
            </Card>
            <Card className="p-6 border border-slate-100 bg-slate-50">
              <p className="text-sm font-medium text-slate-700 uppercase tracking-wider mb-2">Total Collections</p>
              <p className="text-3xl font-heading font-bold text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{transactions.length}</p>
              <p className="text-sm text-slate-600 mt-1">All time</p>
            </Card>
          </div>

          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-600">Record and verify daily contributions</p>
            {canRecordCollection && (
              <Dialog open={openCollection} onOpenChange={setOpenCollection}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-white" data-testid="record-collection-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Record Collection
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-semibold text-slate-900">Record Savings Collection</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCollectionSubmit} className="space-y-5 mt-4" data-testid="collection-form">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Customer</Label>
                      <Select value={collectionForm.customer_id} onValueChange={(value) => {
                        setCollectionForm({ ...collectionForm, customer_id: value });
                        const customerAccounts = accounts.filter(a => a.customer_id === value && a.is_active);
                        if (customerAccounts.length > 0) {
                          setCollectionForm(prev => ({ ...prev, customer_id: value, account_id: customerAccounts[0].id }));
                        }
                      }}>
                        <SelectTrigger className="h-11" data-testid="customer-select">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.filter(c => accounts.some(a => a.customer_id === c.id && a.is_active)).map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.full_name} - {c.customer_number}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Savings Account</Label>
                      <Select value={collectionForm.account_id} onValueChange={(value) => setCollectionForm({ ...collectionForm, account_id: value })}>
                        <SelectTrigger className="h-11" data-testid="account-select">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.filter(a => a.customer_id === collectionForm.customer_id && a.is_active).map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.account_number} - {a.frequency}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-slate-700 font-medium">Amount (NGN)</Label>
                      <Input 
                        id="amount" 
                        type="number" 
                        step="0.01" 
                        value={collectionForm.amount} 
                        onChange={(e) => setCollectionForm({ ...collectionForm, amount: e.target.value })} 
                        required 
                        className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                        placeholder="1000"
                        data-testid="amount-input" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-slate-700 font-medium">Notes (Optional)</Label>
                      <Input 
                        id="notes" 
                        value={collectionForm.notes} 
                        onChange={(e) => setCollectionForm({ ...collectionForm, notes: e.target.value })} 
                        className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                        placeholder="Collection notes"
                        data-testid="notes-input" 
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-primary/90 font-medium shadow-md mt-6" data-testid="submit-collection-button">
                      Record Collection
                    </Button>
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
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Account</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    {isCashier && <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => {
                    const account = accounts.find(a => a.id === txn.account_id);
                    return (
                      <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-testid={`transaction-row-${txn.id}`}>
                        <td className="py-3 px-4 text-sm text-slate-700">{formatDateTime(txn.collection_date)}</td>
                        <td className="py-3 px-4 text-sm text-slate-700 font-medium">{account?.account_number || '-'}</td>
                        <td className="py-3 px-4 text-sm text-slate-700">{customers.find(c => c.id === txn.customer_id)?.full_name || '-'}</td>
                        <td className="py-3 px-4 text-sm text-slate-700 font-medium">{formatCurrency(txn.amount)}</td>
                        <td className="py-3 px-4">
                          {txn.verified_by_cashier ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-medium" data-testid={`status-verified-${txn.id}`}>
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-0.5 rounded-full text-xs font-medium" data-testid={`status-pending-${txn.id}`}>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Collections Recorded Yet</h3>
                <p className="text-slate-600 mb-6">
                  Start recording daily, weekly, or monthly savings collections from your customers
                </p>
                {canRecordCollection && (
                  <Button onClick={() => setOpenCollection(true)} className="bg-primary text-white" data-testid="empty-state-record-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Record First Collection
                  </Button>
                )}
                {!canRecordCollection && (
                  <p className="text-sm text-slate-500">Contact your agent or savings officer to record collections</p>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
