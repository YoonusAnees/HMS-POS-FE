import React from 'react';
import Card from '../../components/ui/Card';

export default function ReceptionDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Reception Dashboard">
        <div className="text-sm text-zinc-600">Room orders + payments.</div>
      </Card>
      <Card title="Tip">
        <div className="text-sm text-zinc-600">Use order type = room + roomId.</div>
      </Card>
    </div>
  );
}
