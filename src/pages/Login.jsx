import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md" title="Login">
        <div className="space-y-3">
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          {err && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>}

          <Button
            className="w-full"
            onClick={async () => {
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
                setErr(e.message);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="text-xs text-zinc-500">
            API Base URL: <span className="font-mono">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
