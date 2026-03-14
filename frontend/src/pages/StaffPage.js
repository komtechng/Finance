import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Plus, UserCheck, UserX, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../lib/utils';

export default function StaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'agent',
    branch_id: user?.branch_id || 'main'
  });

  const roleLabels = {
    super_admin: 'Super Admin',
    branch_manager: 'Branch Manager',
    cashier: 'Cashier',
    loan_officer: 'Loan Officer',
    savings_officer: 'Savings Officer',
    agent: 'Agent',
    pos_operator: 'POS Operator',
    auditor: 'Auditor',
    investor: 'Investor'
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const response = await api.get('/users');
      setStaff(response.data);
    } catch (error) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      toast.success('Staff member added successfully');
      setOpen(false);
      setFormData({ email: '', password: '', full_name: '', phone: '', role: 'agent', branch_id: user?.branch_id || 'main' });
      loadStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add staff');
    }
  };

  const handleToggleActive = async (staffId, currentStatus) => {
    try {
      await api.put(`/users/${staffId}`, { is_active: !currentStatus });
      toast.success(`Staff ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadStaff();
    } catch (error) {
      toast.error('Failed to update staff status');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="staff-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-600 mt-1">Manage team members and their roles</p>
        </div>
        {['super_admin', 'branch_manager'].includes(user?.role) && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white" data-testid="add-staff-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading font-semibold text-slate-900">Add New Staff Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 mt-4" data-testid="staff-form">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-slate-700 font-medium">Full Name</Label>
                  <Input 
                    id="full_name" 
                    value={formData.full_name} 
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                    required 
                    placeholder="John Doe"
                    className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                    data-testid="staff-name-input" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    required 
                    placeholder="john@example.com"
                    className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                    data-testid="staff-email-input" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    required 
                    placeholder="+234 800 000 0000"
                    className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                    data-testid="staff-phone-input" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                    required 
                    placeholder="Minimum 8 characters"
                    className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                    data-testid="staff-password-input" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="h-11" data-testid="staff-role-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="savings_officer">Savings Officer</SelectItem>
                      <SelectItem value="loan_officer">Loan Officer</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="pos_operator">POS Operator</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                      {user?.role === 'super_admin' && (
                        <>
                          <SelectItem value="branch_manager">Branch Manager</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-primary/90 font-medium shadow-md mt-6" data-testid="submit-staff-button">
                  Add Staff Member
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <Card key={member.id} className="p-6 border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all duration-200" data-testid={`staff-card-${member.id}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{member.full_name}</h3>
                <p className="text-sm text-slate-500 capitalize mt-1">
                  {roleLabels[member.role] || member.role}
                </p>
              </div>
              {member.is_active ? (
                <UserCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <UserX className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <span>{member.phone}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>Joined {formatDate(member.created_at)}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-medium ${
                  member.is_active 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-slate-50 text-slate-700 border border-slate-100'
                }`}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {['super_admin', 'branch_manager'].includes(user?.role) && member.id !== user?.id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleToggleActive(member.id, member.is_active)}
                  data-testid={`toggle-status-${member.id}`}
                >
                  {member.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No staff members yet</p>
        </div>
      )}
    </div>
  );
}
