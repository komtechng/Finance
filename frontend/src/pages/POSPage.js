import React from 'react';
import { Card } from '../components/ui/card';
import { Package } from 'lucide-react';

export default function POSPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="pos-page">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">POS & Inventory</h1>
        <p className="text-slate-600 mt-1">Manage retail sales and inventory</p>
      </div>
      <Card className="p-12 text-center border border-slate-200">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">POS Module</h3>
        <p className="text-slate-600">Track product inventory, sales, and generate receipts.</p>
      </Card>
    </div>
  );
}