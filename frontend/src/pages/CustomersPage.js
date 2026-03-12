import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Card } from '../components/ui/card';
import { Plus, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../lib/utils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    guarantor_name: '',
    guarantor_phone: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      toast.success('Customer created successfully');
      setOpen(false);
      setFormData({ full_name: '', phone: '', address: '', guarantor_name: '', guarantor_phone: '' });
      loadCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create customer');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="customers-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">Manage your customer database</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white hover:bg-primary/90" data-testid="add-customer-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="customer-form">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required data-testid="customer-name-input" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required data-testid="customer-phone-input" />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required data-testid="customer-address-input" />
              </div>
              <div>
                <Label htmlFor="guarantor_name">Guarantor Name</Label>
                <Input id="guarantor_name" value={formData.guarantor_name} onChange={(e) => setFormData({ ...formData, guarantor_name: e.target.value })} data-testid="guarantor-name-input" />
              </div>
              <div>
                <Label htmlFor="guarantor_phone">Guarantor Phone</Label>
                <Input id="guarantor_phone" value={formData.guarantor_phone} onChange={(e) => setFormData({ ...formData, guarantor_phone: e.target.value })} data-testid="guarantor-phone-input" />
              </div>
              <Button type="submit" className="w-full bg-primary text-white" data-testid="submit-customer-button">Create Customer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <Card key={customer.id} className="p-6 border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all duration-200" data-testid={`customer-card-${customer.id}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{customer.full_name}</h3>
                <p className="text-sm text-slate-500">{customer.customer_number}</p>
                <p className="text-sm text-slate-600 mt-1">{customer.phone}</p>
                <p className="text-xs text-slate-500 mt-2">Joined {formatDate(customer.created_at)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No customers yet. Add your first customer to get started.</p>
        </div>
      )}
    </div>
  );
}
