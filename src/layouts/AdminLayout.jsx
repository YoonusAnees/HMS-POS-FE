import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from './AppShell';

export default function AdminLayout() {
  const nav = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/settings', label: 'Settings' }
  ];

  return (
    <AppShell nav={nav}>
      <Outlet />
    </AppShell>
  );
}
