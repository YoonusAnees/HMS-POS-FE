import React from 'react';
import Card from '../../components/ui/Card';

export default function CashierDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Cashier Dashboard">
        <div className="text-sm text-zinc-600">Go to POS → create orders → take payments.</div>
      </Card>
      <Card title="Shortcuts">
        <div className="text-sm text-zinc-600">POS and Open Orders are in sidebar.</div>
      </Card>
    </div>
  );
}
