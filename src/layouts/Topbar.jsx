import React from 'react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-tropical-teal-200)] bg-white/90 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="text-lg font-semibold text-[var(--color-tropical-teal-700)]">Dashboard</div>
        <Button variant="ghost" onClick={() => { logout(); nav('/login'); }}>
          Logout
        </Button>
      </div>
    </header>
  );
}
