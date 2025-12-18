import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ nav = [] }) {
  const { user } = useAuth();

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-zinc-200 bg-white p-4">
      <div className="mb-6">
        <div className="text-lg font-black">Anexxa Hotel POS</div>
        <div className="text-xs text-zinc-600">Signed in as {user?.username} ({user?.role})</div>
      </div>

      <nav className="space-y-1">
        {nav.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2 text-sm font-semibold ${
                isActive ? 'bg-zinc-100' : 'hover:bg-zinc-50'
              }`
            }
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
