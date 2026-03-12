import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { Card } from '../components/ui/card';
import { Users, Wallet, CreditCard, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await api.get('/dashboard/metrics');
      setMetrics(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Customers',
      value: metrics?.total_customers || 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Total Savings',
      value: formatCurrency(metrics?.total_savings || 0),
      icon: Wallet,
      color: 'bg-emerald-50 text-emerald-600',
      borderColor: 'border-emerald-100'
    },
    {
      title: 'Loans Disbursed',
      value: formatCurrency(metrics?.total_loans_disbursed || 0),
      icon: CreditCard,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-100'
    },
    {
      title: 'Outstanding Loans',
      value: formatCurrency(metrics?.total_loans_outstanding || 0),
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Cash on Hand',
      value: formatCurrency(metrics?.cash_on_hand || 0),
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-100'
    },
    {
      title: 'Daily Collections',
      value: formatCurrency(metrics?.daily_collections || 0),
      icon: Wallet,
      color: 'bg-indigo-50 text-indigo-600',
      borderColor: 'border-indigo-100'
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-2">
          Welcome back, {user?.full_name}
        </h1>
        <p className="text-lg text-slate-600">
          Here's what's happening with your business today
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className={`p-6 border ${stat.borderColor} bg-white hover:shadow-md transition-all duration-200`}
              data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-heading font-bold text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {metrics?.pending_loan_applications > 0 && (
        <Card className="p-6 border border-amber-200 bg-amber-50 mb-8" data-testid="pending-loans-alert">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">
                {metrics.pending_loan_applications} Pending Loan Applications
              </h3>
              <p className="text-sm text-amber-700">
                Review and approve pending loan applications
              </p>
            </div>
          </div>
        </Card>
      )}

      {metrics?.overdue_loans > 0 && (
        <Card className="p-6 border border-red-200 bg-red-50" data-testid="overdue-loans-alert">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">
                {metrics.overdue_loans} Overdue Loans
              </h3>
              <p className="text-sm text-red-700">
                Follow up on overdue loan payments
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}