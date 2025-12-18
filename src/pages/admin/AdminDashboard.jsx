import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Loading from '../../components/common/Loading';
import { DashboardService } from '../../services/dashboard.service';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

    DashboardService.summary({ from: weekAgo, to: today })
      .then(setData)
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <Card title="Error">{err}</Card>;
  if (!data) return <Loading />;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Orders (range)">
        <div className="text-sm text-zinc-600">{data.range.from} → {data.range.to}</div>
        <div className="mt-2 text-sm">
          Open: <b>{data.counts.open}</b><br/>
          Closed: <b>{data.counts.closed}</b><br/>
          Cancelled: <b>{data.counts.cancelled}</b>
        </div>
      </Card>

      <Card title="Revenue (Closed)">
        <div className="text-2xl font-black">LKR {data.revenueClosed}</div>
        <div className="text-sm text-zinc-600 mt-1">Tax: {data.taxClosed}</div>
      </Card>

      <Card title="Quick note">
        <div className="text-sm text-zinc-600">
          Next: add charts + table occupancy summary.
        </div>
      </Card>
    </div>
  );
}
