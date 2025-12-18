import React from 'react';
import Card from '../../components/ui/Card';

export default function ManagerDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Manager Dashboard">
        <div className="text-sm text-zinc-600">
          Manage categories, items, tables, reports.
        </div>
      </Card>
      <Card title="Tip">
        <div className="text-sm text-zinc-600">
          Use Items bulk insert for initial menu.
        </div>
      </Card>
    </div>
  );
}
