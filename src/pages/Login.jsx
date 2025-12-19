import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErr('');
    setLoading(true);
    try {
      const u = await login({ username, password });
      if (u.role === 'admin') nav('/admin');
      else if (u.role === 'manager') nav('/manager');
      else if (u.role === 'cashier') nav('/cashier');
      else if (u.role === 'reception') nav('/reception');
      else nav('/');
    } catch (e) {
      setErr(e.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[var(--color-tropical-teal-50)] p-6">
      <Card 
        className="w-full max-w-md shadow-2xl transition-all duration-300 hover:shadow-3xl"
        title="Welcome Back"
      >
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-black text-[var(--color-tropical-teal-800)]">Anexxa Hotel POS</h1>
            <p className="mt-2 text-sm text-[var(--color-tropical-teal-600)]">Sign in to access your dashboard</p>
          </div>

          <div className="space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />

            {err && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {err}
              </div>
            )}

            <Button
              className="w-full text-lg py-3 shadow-lg"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </div>

          <div className="pt-4 border-t border-[var(--color-tropical-teal-200)]">
           
            
          </div>
        </div>
      </Card>
    </div>
  );
}