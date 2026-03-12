import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary to-emerald-700">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1748002766408-781073724c5f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxhZnJpY2FuJTIwY29tbXVuaXR5JTIwZmluYW5jZSUyMGdyb3d0aHxlbnwwfHx8fDE3NzMzNTY3NDl8MA&ixlib=rb-4.1.0&q=85"
            alt="Community Finance"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-heading font-bold mb-6">
            NaijaFinance
          </h1>
          <p className="text-xl text-emerald-50 leading-relaxed">
            Enterprise financial management platform for community finance companies
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 border border-slate-100">
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-semibold text-slate-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                  placeholder="you@example.com"
                  data-testid="email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20"
                  placeholder="Enter your password"
                  data-testid="password-input"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary text-white hover:bg-primary/90 font-medium shadow-md"
                disabled={loading}
                data-testid="login-submit-button"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline" data-testid="register-link">
                  Register here
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            <p>Default Admin: admin@naijafinance.ng / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}