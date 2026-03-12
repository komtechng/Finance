import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '../lib/utils';

export default function InvestmentsPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    investor_id: user?.id || '',
    amount: '',
    plan: 'monthly',
    interest_rate: '5',
    duration_months: '12'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/investments');
      setInvestments(response.data);
    } catch (error) {
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/investments', {
        ...formData,
        amount: parseFloat(formData.amount),
        interest_rate: parseFloat(formData.interest_rate),
        duration_months: parseInt(formData.duration_months)
      });
      toast.success('Investment created successfully');
      setOpen(false);
      setFormData({ investor_id: user?.id || '', amount: '', plan: 'monthly', interest_rate: '5', duration_months: '12' });
      loadData();
    } catch (error) {
      toast.error('Failed to create investment');
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const activeInvestments = investments.filter(inv => inv.is_active).length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="investments-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Investment Management</h1>
          <p className="text-slate-600 mt-1">Track investor funds and profit payouts</p>
        </div>
        {['super_admin', 'branch_manager'].includes(user?.role) && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white" data-testid="new-investment-button">
                <Plus className="w-4 h-4 mr-2" />
                New Investment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Investment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="investment-form">
                <div>
                  <Label htmlFor="amount">Investment Amount (NGN)</Label>
                  <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required data-testid="amount-input" />
                </div>
                <div>
                  <Label>Investment Plan</Label>
                  <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                    <SelectTrigger data-testid="plan-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Returns</SelectItem>
                      <SelectItem value="quarterly">Quarterly Returns</SelectItem>
                      <SelectItem value="annual">Annual Returns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                  <Input id="interest_rate" type="number" step="0.01" value={formData.interest_rate} onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })} required data-testid="interest-rate-input" />
                </div>
                <div>
                  <Label htmlFor="duration_months">Duration (Months)</Label>
                  <Input id="duration_months" type="number" value={formData.duration_months} onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })} required data-testid="duration-input" />
                </div>
                <Button type="submit" className="w-full bg-primary text-white" data-testid="submit-investment-button">Create Investment</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Invested</p>
          <p className="text-4xl font-heading font-bold text-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalInvested)}</p>
        </Card>
        <Card className="p-6 border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Active Investments</p>
          <p className="text-4xl font-heading font-bold text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{activeInvestments}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map((investment) => (
          <Card key={investment.id} className="p-6 border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all duration-200" data-testid={`investment-card-${investment.id}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wider">Investment {investment.investment_number}</p>
                <h3 className="text-2xl font-heading font-bold text-slate-900 mt-1">{formatCurrency(investment.amount)}</h3>
              </div>
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="text-slate-900 font-medium capitalize">{investment.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Interest Rate:</span>
                <span className="text-slate-900 font-medium">{investment.interest_rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Start Date:</span>
                <span className="text-slate-900 font-medium">{formatDate(investment.start_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Maturity Date:</span>
                <span className="text-slate-900 font-medium">{formatDate(investment.maturity_date)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  investment.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-700 border border-slate-100'
                }`}>
                  {investment.is_active ? 'Active' : 'Matured'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {investments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No investments recorded yet</p>
        </div>
      )}
    </div>
  );
}