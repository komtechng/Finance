import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Plus, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '../lib/utils';

export default function LoansPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openApp, setOpenApp] = useState(false);
  const [openRepayment, setOpenRepayment] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [appForm, setAppForm] = useState({
    customer_id: '',
    customer_name_manual: '',
    loan_type: 'personal',
    loan_amount: '',
    duration_months: '12',
    purpose: '',
    employment_status: '',
    monthly_income: '',
    collateral_type: '',
    collateral_value: '',
    guarantor_name: '',
    guarantor_phone: '',
    guarantor_address: '',
    guarantor_relationship: ''
  });
  const [repaymentForm, setRepaymentForm] = useState({
    loan_id: '',
    customer_id: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appsRes, loansRes, custRes] = await Promise.all([
        api.get('/loans/applications'),
        api.get('/loans'),
        api.get('/customers')
      ]);
      setApplications(appsRes.data);
      setLoans(loansRes.data);
      setCustomers(custRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAppSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/loans/applications', {
        ...appForm,
        loan_amount: parseFloat(appForm.loan_amount),
        duration_months: parseInt(appForm.duration_months),
        monthly_income: appForm.monthly_income ? parseFloat(appForm.monthly_income) : null,
        collateral_value: appForm.collateral_value ? parseFloat(appForm.collateral_value) : null
      });
      toast.success('Loan application submitted');
      setOpenApp(false);
      setAppForm({ 
        customer_id: '', 
        loan_type: 'personal',
        loan_amount: '', 
        duration_months: '12',
        purpose: '', 
        employment_status: '',
        monthly_income: '',
        collateral_type: '',
        collateral_value: '',
        guarantor_name: '', 
        guarantor_phone: '',
        guarantor_address: '',
        guarantor_relationship: ''
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    }
  };

  const handleApprove = async (appId) => {
    try {
      await api.post(`/loans/applications/${appId}/approve`);
      toast.success('Application approved');
      loadData();
    } catch (error) {
      toast.error('Failed to approve application');
    }
  };

  const handleRepaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/loans/repayments', {
        ...repaymentForm,
        amount: parseFloat(repaymentForm.amount)
      });
      toast.success('Repayment recorded');
      setOpenRepayment(false);
      setRepaymentForm({ loan_id: '', customer_id: '', amount: '', notes: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to record repayment');
    }
  };

  const isLoanOfficer = ['loan_officer', 'branch_manager', 'super_admin'].includes(user?.role);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="loans-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Loan Management</h1>
          <p className="text-slate-600 mt-1">Manage loan applications and repayments</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={openApp} onOpenChange={setOpenApp}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white" data-testid="new-application-button">
                <Plus className="w-4 h-4 mr-2" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading font-semibold text-slate-900">Submit Loan Application</DialogTitle>
                <p className="text-sm text-slate-600">Complete all required fields for loan processing</p>
              </DialogHeader>
              <form onSubmit={handleAppSubmit} className="space-y-5 mt-4" data-testid="loan-application-form">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Customer *</Label>
                  <Select 
                    value={appForm.customer_id} 
                    onValueChange={(value) => setAppForm({ ...appForm, customer_id: value })}
                  >
                    <SelectTrigger className="h-11" data-testid="customer-select">
                      <SelectValue placeholder="Select customer or start typing..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.length === 0 ? (
                        <div className="px-2 py-6 text-center text-sm text-slate-500">
                          No customers found. Create a customer first.
                        </div>
                      ) : (
                        customers.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.full_name} - {c.customer_number}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {customers.length === 0 && (
                    <p className="text-xs text-orange-600">
                      No customers available. Please create a customer in the Customers page first.
                    </p>
                  )}
                  <div className="text-xs text-slate-500 mt-1">
                    Customers available: {customers.length} | Or type customer ID below
                  </div>
                  <Input 
                    placeholder="Or enter Customer ID manually (e.g., CUST000001)" 
                    value={appForm.customer_name_manual}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAppForm({ ...appForm, customer_name_manual: value });
                      // Try to find customer by ID or name
                      const found = customers.find(c => 
                        c.customer_number === value || 
                        c.full_name.toLowerCase().includes(value.toLowerCase())
                      );
                      if (found) {
                        setAppForm(prev => ({ ...prev, customer_id: found.id }));
                      }
                    }}
                    className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20 mt-2"
                    data-testid="customer-manual-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Loan Type *</Label>
                    <Select value={appForm.loan_type} onValueChange={(value) => setAppForm({ ...appForm, loan_type: value })}>
                      <SelectTrigger className="h-11" data-testid="loan-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal Loan</SelectItem>
                        <SelectItem value="business">Business Loan</SelectItem>
                        <SelectItem value="salary_advance">Salary Advance</SelectItem>
                        <SelectItem value="emergency">Emergency Loan</SelectItem>
                        <SelectItem value="education">Education Loan</SelectItem>
                        <SelectItem value="agriculture">Agriculture Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_months" className="text-slate-700 font-medium">Duration (Months) *</Label>
                    <Input 
                      id="duration_months" 
                      type="number" 
                      value={appForm.duration_months} 
                      onChange={(e) => setAppForm({ ...appForm, duration_months: e.target.value })} 
                      required 
                      className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                      data-testid="duration-input" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loan_amount" className="text-slate-700 font-medium">Loan Amount (NGN) *</Label>
                  <Input 
                    id="loan_amount" 
                    type="number" 
                    step="0.01" 
                    value={appForm.loan_amount} 
                    onChange={(e) => setAppForm({ ...appForm, loan_amount: e.target.value })} 
                    required 
                    className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                    placeholder="100000"
                    data-testid="loan-amount-input" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-slate-700 font-medium">Loan Purpose *</Label>
                  <Textarea 
                    id="purpose" 
                    value={appForm.purpose} 
                    onChange={(e) => setAppForm({ ...appForm, purpose: e.target.value })} 
                    required 
                    className="border-slate-200 focus:border-primary focus:ring-primary/20"
                    placeholder="Describe the purpose of this loan"
                    data-testid="loan-purpose-input" 
                  />
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Employment & Income Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employment_status" className="text-slate-700 font-medium">Employment Status</Label>
                      <Input 
                        id="employment_status" 
                        value={appForm.employment_status} 
                        onChange={(e) => setAppForm({ ...appForm, employment_status: e.target.value })} 
                        className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                        placeholder="e.g., Employed, Self-employed"
                        data-testid="employment-status-input" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthly_income" className="text-slate-700 font-medium">Monthly Income (NGN)</Label>
                      <Input 
                        id="monthly_income" 
                        type="number" 
                        step="0.01" 
                        value={appForm.monthly_income} 
                        onChange={(e) => setAppForm({ ...appForm, monthly_income: e.target.value })} 
                        className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                        placeholder="50000"
                        data-testid="monthly-income-input" 
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Collateral Information (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collateral_type" className="text-slate-700 font-medium">Collateral Type</Label>
                      <Input 
                        id="collateral_type" 
                        value={appForm.collateral_type} 
                        onChange={(e) => setAppForm({ ...appForm, collateral_type: e.target.value })} 
                        className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                        placeholder="e.g., Land, Vehicle, Equipment"
                        data-testid="collateral-type-input" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collateral_value" className="text-slate-700 font-medium">Estimated Value (NGN)</Label>
                      <Input 
                        id="collateral_value" 
                        type="number" 
                        step="0.01" 
                        value={appForm.collateral_value} 
                        onChange={(e) => setAppForm({ ...appForm, collateral_value: e.target.value })} 
                        className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                        placeholder="500000"
                        data-testid="collateral-value-input" 
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Guarantor Information *</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="guarantor_name" className="text-slate-700 font-medium">Guarantor Name *</Label>
                        <Input 
                          id="guarantor_name" 
                          value={appForm.guarantor_name} 
                          onChange={(e) => setAppForm({ ...appForm, guarantor_name: e.target.value })} 
                          required 
                          className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                          placeholder="Full name"
                          data-testid="guarantor-name-input" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guarantor_phone" className="text-slate-700 font-medium">Guarantor Phone *</Label>
                        <Input 
                          id="guarantor_phone" 
                          value={appForm.guarantor_phone} 
                          onChange={(e) => setAppForm({ ...appForm, guarantor_phone: e.target.value })} 
                          required 
                          className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                          placeholder="+234 800 000 0000"
                          data-testid="guarantor-phone-input" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guarantor_address" className="text-slate-700 font-medium">Guarantor Address</Label>
                      <Input 
                        id="guarantor_address" 
                        value={appForm.guarantor_address} 
                        onChange={(e) => setAppForm({ ...appForm, guarantor_address: e.target.value })} 
                        className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                        placeholder="Complete address"
                        data-testid="guarantor-address-input" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guarantor_relationship" className="text-slate-700 font-medium">Relationship to Applicant</Label>
                      <Input 
                        id="guarantor_relationship" 
                        value={appForm.guarantor_relationship} 
                        onChange={(e) => setAppForm({ ...appForm, guarantor_relationship: e.target.value })} 
                        className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                        placeholder="e.g., Spouse, Parent, Friend"
                        data-testid="guarantor-relationship-input" 
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-primary/90 font-medium shadow-md mt-6" data-testid="submit-application-button">
                  Submit Loan Application
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={openRepayment} onOpenChange={setOpenRepayment}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="record-repayment-button">
                <DollarSign className="w-4 h-4 mr-2" />
                Record Repayment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Loan Repayment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRepaymentSubmit} className="space-y-4" data-testid="repayment-form">
                <div>
                  <Label>Loan</Label>
                  <Select value={repaymentForm.loan_id} onValueChange={(value) => {
                    const loan = loans.find(l => l.id === value);
                    setRepaymentForm({ ...repaymentForm, loan_id: value, customer_id: loan?.customer_id || '' });
                  }}>
                    <SelectTrigger data-testid="loan-select">
                      <SelectValue placeholder="Select loan" />
                    </SelectTrigger>
                    <SelectContent>
                      {loans.filter(l => l.status !== 'completed').map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.loan_number} - {formatCurrency(l.outstanding_balance)} outstanding</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Repayment Amount (NGN)</Label>
                  <Input id="amount" type="number" step="0.01" value={repaymentForm.amount} onChange={(e) => setRepaymentForm({ ...repaymentForm, amount: e.target.value })} required data-testid="repayment-amount-input" />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" value={repaymentForm.notes} onChange={(e) => setRepaymentForm({ ...repaymentForm, notes: e.target.value })} data-testid="repayment-notes-input" />
                </div>
                <Button type="submit" className="w-full bg-primary text-white" data-testid="submit-repayment-button">Record Repayment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="applications" data-testid="tab-applications">Applications</TabsTrigger>
          <TabsTrigger value="loans" data-testid="tab-loans">Active Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Application #</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    {isLoanOfficer && <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-testid={`application-row-${app.id}`}>
                      <td className="py-3 px-4 text-sm text-slate-700 font-medium">{app.application_number}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{customers.find(c => c.id === app.customer_id)?.full_name || '-'}</td>
                      <td className="py-3 px-4 text-sm text-slate-700 font-medium">{formatCurrency(app.loan_amount)}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{app.purpose.substring(0, 30)}...</td>
                      <td className="py-3 px-4">
                        {app.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      {isLoanOfficer && (
                        <td className="py-3 px-4">
                          {app.status === 'pending' && (
                            <Button size="sm" onClick={() => handleApprove(app.id)} className="bg-primary text-white text-xs" data-testid={`approve-button-${app.id}`}>
                              Approve
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
          {applications.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200 mt-6">
              <p className="text-slate-500">No loan applications yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="loans">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan) => (
              <Card key={loan.id} className="p-6 border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all duration-200" data-testid={`loan-card-${loan.id}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider">Loan {loan.loan_number}</p>
                    <h3 className="text-2xl font-heading font-bold text-slate-900 mt-1">{formatCurrency(loan.principal_amount)}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    loan.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    loan.status === 'active' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    'bg-orange-50 text-orange-700 border border-orange-100'
                  }`}>
                    {loan.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer:</span>
                    <span className="text-slate-900 font-medium">{customers.find(c => c.id === loan.customer_id)?.full_name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Interest Rate:</span>
                    <span className="text-slate-900 font-medium">{loan.interest_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="text-slate-900 font-medium">{loan.duration_months} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Payment:</span>
                    <span className="text-slate-900 font-medium">{formatCurrency(loan.monthly_payment)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Paid:</span>
                    <span className="text-emerald-600 font-medium">{formatCurrency(loan.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Outstanding:</span>
                    <span className="text-red-600 font-medium">{formatCurrency(loan.outstanding_balance)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {loans.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500">No active loans yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}