import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { DashboardService } from '../../services/dashboard.service';

import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

const todayLocal = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const daysAgoLocal = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  const [from, setFrom] = useState(daysAgoLocal(6));
  const [to, setTo] = useState(todayLocal());
  const [currency, setCurrency] = useState('LKR');

  const load = async () => {
    setErr('');
    setData(null);
    try {
      const d = await DashboardService.summary({ from, to, currency });
      setData(d);
    } catch (e) {
      setErr(e?.message || 'Failed to load dashboard');
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const paymentsByMethodData = useMemo(() => {
    if (!data?.payments?.byMethod) return [];
    return data.payments.byMethod.map(x => ({
      method: x.method,
      gross: x.gross,
      refunds: x.refunds,
      net: x.net,
    }));
  }, [data]);

  if (err) return <Card title="Error">{err}</Card>;
  if (!data) return <Loading />;

  return (
    <div className="grid gap-4">
      {/* Filters */}
      <Card title="Admin Dashboard Filters">
        <div className="grid gap-3 md:grid-cols-4">
          <Input label="From (YYYY-MM-DD)" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To (YYYY-MM-DD)" value={to} onChange={(e) => setTo(e.target.value)} />
          <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          <div className="flex items-end">
            <Button className="w-full" onClick={load}>Reload</Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Users">
          <div className="text-2xl font-black">{data.users.total}</div>
          <div className="text-sm text-zinc-600 mt-1">Active: {data.users.active}</div>
          <div className="mt-2 text-xs text-zinc-600 space-y-1">
            {data.users.byRole.map(r => (
              <div key={r.role} className="flex justify-between">
                <span>{r.role}</span><b>{r.count}</b>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Orders (range)">
          <div className="text-sm text-zinc-600">{data.range.from} → {data.range.to}</div>
          <div className="mt-2 text-sm space-y-1">
            <div className="flex justify-between"><span>Open</span><b>{data.counts.open}</b></div>
            <div className="flex justify-between"><span>Closed</span><b>{data.counts.closed}</b></div>
            <div className="flex justify-between"><span>Cancelled</span><b>{data.counts.cancelled}</b></div>
          </div>
        </Card>

        <Card title="Revenue (Closed Orders)">
          <div className="text-2xl font-black">{data.range.currency} {data.revenueClosed}</div>
          <div className="text-sm text-zinc-600 mt-1">Tax: {data.taxClosed}</div>
        </Card>

        <Card title="Payments (Net)">
          <div className="text-2xl font-black">{data.range.currency} {data.payments.net}</div>
          <div className="mt-2 text-sm space-y-1">
            <div className="flex justify-between"><span>Gross</span><b>{data.payments.gross}</b></div>
            <div className="flex justify-between"><span>Refunds</span><b>{data.payments.refunds}</b></div>
            <div className="flex justify-between"><span>Refund count</span><b>{data.payments.refundsCount}</b></div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Daily Orders Trend">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={data.charts.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ordersOpen" />
                <Line type="monotone" dataKey="ordersClosed" />
                <Line type="monotone" dataKey="ordersCancelled" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Daily Payments Trend">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={data.charts.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="paymentsGross" />
                <Line type="monotone" dataKey="paymentsRefunds" />
                <Line type="monotone" dataKey="paymentsNet" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Payments By Method">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={paymentsByMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="gross" />
                <Bar dataKey="refunds" />
                <Bar dataKey="net" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Quick Notes">
          <div className="text-sm text-zinc-600">
            This dashboard uses: Users, Orders, Payments (including refunds as negative payments), and daily trends.
          </div>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Recent Orders">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-600">
                <tr>
                  <th className="py-2">Order</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Opened</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.orders.map(o => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2 font-semibold">{o.orderNumber}</td>
                    <td>{o.type}</td>
                    <td>{o.status}</td>
                    <td>{o.grandTotal}</td>
                    <td className="text-xs text-zinc-600">
                      {new Date(o.openedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Recent Payments / Refunds">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-600">
                <tr>
                  <th className="py-2">OrderId</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Tendered</th>
                  <th>Change</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.payments.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 font-semibold">#{p.orderId}</td>
                    <td>{p.method}</td>
                    <td className={Number(p.amount) < 0 ? 'text-red-600 font-semibold' : ''}>
                      {p.amount}
                    </td>
                    <td>{p.tendered ?? '-'}</td>
                    <td>{p.change ?? '-'}</td>
                    <td className="text-xs text-zinc-600">
                      {new Date(p.paidAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
