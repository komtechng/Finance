import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { LayoutDashboard, Users, Wallet, CreditCard, DollarSign, Package, FileText, Settings, LogOut, Menu, X, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: [] },
    { name: 'Customers', path: '/dashboard/customers', icon: Users, roles: ['super_admin', 'branch_manager', 'savings_officer', 'agent'] },
    { name: 'Savings', path: '/dashboard/savings', icon: Wallet, roles: ['super_admin', 'branch_manager', 'savings_officer', 'agent', 'cashier'] },
    { name: 'Loans', path: '/dashboard/loans', icon: CreditCard, roles: ['super_admin', 'branch_manager', 'loan_officer'] },
    { name: 'Investments', path: '/dashboard/investments', icon: TrendingUp, roles: ['super_admin', 'branch_manager', 'investor'] },
    { name: 'ATM Services', path: '/dashboard/atm', icon: DollarSign, roles: ['super_admin', 'branch_manager', 'cashier', 'pos_operator'] },
    { name: 'POS/Inventory', path: '/dashboard/pos', icon: Package, roles: ['super_admin', 'branch_manager', 'pos_operator'] },
    { name: 'Cash Office', path: '/dashboard/cash', icon: BarChart3, roles: ['super_admin', 'branch_manager', 'cashier'] },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText, roles: ['super_admin', 'branch_manager', 'auditor'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.length === 0 || item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-heading font-bold text-primary">NaijaFinance</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2" data-testid="mobile-menu-toggle">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )} data-testid="sidebar">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-2xl font-heading font-bold text-primary">NaijaFinance</h1>
            <p className="text-sm text-slate-500 mt-1">{user?.role?.replace('_', ' ')}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" data-testid="sidebar-nav">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                  data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200">
            <div className="mb-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-2 text-slate-700"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>

      {user?.role === 'agent' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-around" data-testid="mobile-bottom-nav">
          <Link to="/dashboard" className="flex flex-col items-center gap-1" data-testid="mobile-nav-dashboard">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link to="/dashboard/customers" className="flex flex-col items-center gap-1" data-testid="mobile-nav-customers">
            <Users className="w-5 h-5" />
            <span className="text-xs">Customers</span>
          </Link>
          <Link to="/dashboard/savings" className="flex flex-col items-center gap-1" data-testid="mobile-nav-savings">
            <Wallet className="w-5 h-5" />
            <span className="text-xs">Collections</span>
          </Link>
        </div>
      )}
    </div>
  );
}