import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ nav = [] }) {
  const { user } = useAuth();

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-[var(--color-tropical-teal-200)] bg-white p-5 shadow-lg">
      <div className="mb-8">
        <div className="text-2xl font-black text-[var(--color-tropical-teal-700)]">Anexxa Hotel POS</div>
        <div className="mt-1 text-sm text-[var(--color-tropical-teal-600)]">Signed in as {user?.username} ({user?.role})</div>
      </div>

      <nav className="space-y-2">
        {nav.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-[var(--color-tropical-teal-600)] text-white shadow-md' 
                  : 'text-[var(--color-tropical-teal-700)] hover:bg-[var(--color-tropical-teal-100)] hover:shadow'
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
