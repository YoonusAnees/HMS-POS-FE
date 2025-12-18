import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from './AppShell';

export default function CashierLayout() {
  const nav = [
    { to: '/cashier', label: 'Dashboard' },
    { to: '/cashier/pos', label: 'POS' },
    { to: '/cashier/orders', label: 'Orders' }
  ];

  return (
    <AppShell nav={nav}>
      <Outlet />
    </AppShell>
  );
}
