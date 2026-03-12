import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Plus, Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openProduct, setOpenProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    barcode: '',
    cost_price: '',
    selling_price: '',
    quantity_in_stock: '',
    reorder_level: '10',
    category: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, salesRes] = await Promise.all([
        api.get('/products'),
        api.get('/sales')
      ]);
      setProducts(productsRes.data);
      setSales(salesRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        ...productForm,
        cost_price: parseFloat(productForm.cost_price),
        selling_price: parseFloat(productForm.selling_price),
        quantity_in_stock: parseInt(productForm.quantity_in_stock),
        reorder_level: parseInt(productForm.reorder_level)
      });
      toast.success('Product added successfully');
      setOpenProduct(false);
      setProductForm({ name: '', barcode: '', cost_price: '', selling_price: '', quantity_in_stock: '', reorder_level: '10', category: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.selling_price,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.product_id === productId ? { ...item, quantity } : item
    ));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    try {
      await api.post('/sales', {
        items: cart,
        payment_method: 'cash'
      });
      toast.success('Sale completed successfully');
      setCart([]);
      loadData();
    } catch (error) {
      toast.error('Failed to complete sale');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="pos-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">POS & Inventory</h1>
          <p className="text-slate-600 mt-1">Manage products and process sales</p>
        </div>
        <Dialog open={openProduct} onOpenChange={setOpenProduct}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white" data-testid="add-product-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleProductSubmit} className="space-y-4" data-testid="product-form">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required data-testid="product-name-input" />
              </div>
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input id="barcode" value={productForm.barcode} onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })} data-testid="barcode-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost_price">Cost Price (NGN)</Label>
                  <Input id="cost_price" type="number" step="0.01" value={productForm.cost_price} onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })} required data-testid="cost-price-input" />
                </div>
                <div>
                  <Label htmlFor="selling_price">Selling Price (NGN)</Label>
                  <Input id="selling_price" type="number" step="0.01" value={productForm.selling_price} onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })} required data-testid="selling-price-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity_in_stock">Quantity in Stock</Label>
                  <Input id="quantity_in_stock" type="number" value={productForm.quantity_in_stock} onChange={(e) => setProductForm({ ...productForm, quantity_in_stock: e.target.value })} required data-testid="quantity-input" />
                </div>
                <div>
                  <Label htmlFor="reorder_level">Reorder Level</Label>
                  <Input id="reorder_level" type="number" value={productForm.reorder_level} onChange={(e) => setProductForm({ ...productForm, reorder_level: e.target.value })} required data-testid="reorder-level-input" />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} data-testid="category-input" />
              </div>
              <Button type="submit" className="w-full bg-primary text-white" data-testid="submit-product-button">Add Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="sell" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="sell" data-testid="tab-sell">Point of Sale</TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sales" data-testid="tab-sales">Sales History</TabsTrigger>
        </TabsList>

        <TabsContent value="sell">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Products</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="p-4 border border-slate-100 hover:border-primary/50 cursor-pointer transition-all" onClick={() => addToCart(product)} data-testid={`product-card-${product.id}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-sm text-slate-900">{product.name}</h4>
                      </div>
                      <p className="text-lg font-bold text-primary">{formatCurrency(product.selling_price)}</p>
                      <p className="text-xs text-slate-500">Stock: {product.quantity_in_stock}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart
                </h3>
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center pb-3 border-b border-slate-100" data-testid={`cart-item-${item.product_id}`}>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{formatCurrency(item.price)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</Button>
                      </div>
                    </div>
                  ))}
                </div>
                {cart.length === 0 && (
                  <p className="text-center text-slate-500 py-8 text-sm">Cart is empty</p>
                )}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(cartTotal)}</span>
                  </div>
                  <Button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-primary text-white h-12" data-testid="checkout-button">
                    Complete Sale
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cost</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-testid={`inventory-row-${product.id}`}>
                      <td className="py-3 px-4 text-sm text-slate-900 font-medium">{product.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{product.product_code}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{formatCurrency(product.cost_price)}</td>
                      <td className="py-3 px-4 text-sm text-slate-700 font-medium">{formatCurrency(product.selling_price)}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{product.quantity_in_stock}</td>
                      <td className="py-3 px-4">
                        {product.quantity_in_stock <= product.reorder_level ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">Low Stock</span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">In Stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {products.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No products in inventory</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales">
          <div className="space-y-4">
            {sales.map((sale) => (
              <Card key={sale.id} className="p-6 border border-slate-100" data-testid={`sale-card-${sale.id}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Receipt #{sale.receipt_number}</p>
                    <p className="text-xs text-slate-400">{new Date(sale.sale_date).toLocaleString()}</p>
                  </div>
                  <p className="text-xl font-bold text-primary">{formatCurrency(sale.total)}</p>
                </div>
                <div className="space-y-2">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-700">{item.name} x{item.quantity}</span>
                      <span className="text-slate-900 font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          {sales.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500">No sales recorded yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}