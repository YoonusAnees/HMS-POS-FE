import React from 'react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="text-sm text-zinc-600">Hotel POS</div>
        <Button
          variant="ghost"
          onClick={() => {
            logout();
            nav('/login');
          }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
