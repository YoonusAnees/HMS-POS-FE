import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from './AppShell';

export default function ReceptionLayout() {
  const nav = [
    { to: '/reception', label: 'Dashboard' },
    { to: '/reception/pos', label: 'POS' },
    { to: '/reception/orders', label: 'Orders' }
  ];

  return (
    <AppShell nav={nav}>
      <Outlet />
    </AppShell>
  );
}
