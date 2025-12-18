import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from './AppShell';

export default function ManagerLayout() {
  const nav = [
    { to: '/manager', label: 'Dashboard' },
    { to: '/manager/categories', label: 'Categories' },
    { to: '/manager/items', label: 'Items' },
    { to: '/manager/tables', label: 'Tables' },
    { to: '/manager/reports', label: 'Reports' }
  ];

  return (
    <AppShell nav={nav}>
      <Outlet />
    </AppShell>
  );
}
