import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';


export default function AppShell({ nav, children }) {
  return (
    <div className="min-h-screen bg-[var(--color-tropical-teal-50)]">
      <div className="flex">
        <Sidebar nav={nav} />
        <div className="flex-1">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
