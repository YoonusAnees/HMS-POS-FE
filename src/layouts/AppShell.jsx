import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';


export default function AppShell({ nav, children }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex">
        <Sidebar nav={nav} />
        <div className="flex-1">
          <Topbar />
          <main className="p-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
