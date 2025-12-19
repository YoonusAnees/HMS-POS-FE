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

const CHART_COLORS = {
  ordersOpen: '#76bcbc',        // tropical-teal-400
  ordersClosed: '#438989',      // tropical-teal-600
  ordersCancelled: '#224444',   // tropical-teal-800
  paymentsGross: '#54abab',     // tropical-teal-500
  paymentsNet: '#438989',       // tropical-teal-600
  paymentsRefunds: '#992222',   // reddish accent for negative
  barGross: '#98cdcd',          // tropical-teal-300
  barNet: '#438989',            // tropical-teal-600
  barRefunds: '#224444',        // tropical-teal-800
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

  useEffect(() => { load(); }, []);

  const paymentsByMethodData = useMemo(() => {
    if (!data?.payments?.byMethod) return [];
    return data.payments.byMethod.map(x => ({
      method: x.method,
      gross: x.gross,
      refunds: x.refunds,
      net: x.net,
    }));
  }, [data]);

  if (err) return <Card title="Error"><div className="text-red-600">{err}</div></Card>;
  if (!data) return <Loading />;

  return (
    <div className="grid gap-6">
      {/* Filters */}
      <Card title="Dashboard Filters">
        <div className="grid gap-4 md:grid-cols-4">
          <Input label="From (YYYY-MM-DD)" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To (YYYY-MM-DD)" value={to} onChange={(e) => setTo(e.target.value)} />
          <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          <div className="flex items-end">
            <Button className="w-full" onClick={load}>Reload Data</Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card title="Users">
          <div className="text-3xl font-black text-[var(--color-tropical-teal-800)]">{data.users.total}</div>
          <div className="text-sm text-[var(--color-tropical-teal-600)] mt-2">Active: {data.users.active}</div>
          <div className="mt-4 text-sm space-y-1">
            {data.users.byRole.map(r => (
              <div key={r.role} className="flex justify-between">
                <span className="text-[var(--color-tropical-teal-700)]">{r.role}</span>
                <b className="font-semibold">{r.count}</b>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Orders (Selected Range)">
          <div className="text-sm text-[var(--color-tropical-teal-600)]">{data.range.from} → {data.range.to}</div>
          <div className="mt-4 text-sm space-y-2">
            <div className="flex justify-between"><span>Open</span><b className="font-semibold">{data.counts.open}</b></div>
            <div className="flex justify-between"><span>Closed</span><b className="font-semibold">{data.counts.closed}</b></div>
            <div className="flex justify-between"><span>Cancelled</span><b className="font-semibold">{data.counts.cancelled}</b></div>
          </div>
        </Card>

        <Card title="Revenue (Closed Orders)">
          <div className="text-3xl font-black text-[var(--color-tropical-teal-800)]">
            {data.range.currency} {data.revenueClosed}
          </div>
          <div className="text-sm text-[var(--color-tropical-teal-600)] mt-2">Tax: {data.taxClosed}</div>
        </Card>

        <Card title="Payments (Net)">
          <div className="text-3xl font-black text-[var(--color-tropical-teal-800)]">
            {data.range.currency} {data.payments.net}
          </div>
          <div className="mt-4 text-sm space-y-2">
            <div className="flex justify-between"><span>Gross</span><b>{data.payments.gross}</b></div>
            <div className="flex justify-between"><span>Refunds</span><b className="text-red-600">-{data.payments.refunds}</b></div>
            <div className="flex justify-between"><span>Refund count</span><b>{data.payments.refundsCount}</b></div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Daily Orders Trend">
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={data.charts.daily}>
                <CartesianGrid strokeDasharray="4 4" stroke="#ddeeee" />
                <XAxis dataKey="day" stroke="#438989" />
                <YAxis stroke="#438989" />
                <Tooltip contentStyle={{ backgroundColor: '#eef7f7', border: '1px solid #bbdddd' }} />
                <Legend />
                <Line type="monotone" dataKey="ordersOpen" stroke={CHART_COLORS.ordersOpen} strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="ordersClosed" stroke={CHART_COLORS.ordersClosed} strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="ordersCancelled" stroke={CHART_COLORS.ordersCancelled} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Daily Payments Trend">
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={data.charts.daily}>
                <CartesianGrid strokeDasharray="4 4" stroke="#ddeeee" />
                <XAxis dataKey="day" stroke="#438989" />
                <YAxis stroke="#438989" />
                <Tooltip contentStyle={{ backgroundColor: '#eef7f7', border: '1px solid #bbdddd' }} />
                <Legend />
                <Line type="monotone" dataKey="paymentsGross" stroke={CHART_COLORS.paymentsGross} strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="paymentsNet" stroke={CHART_COLORS.paymentsNet} strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="paymentsRefunds" stroke={CHART_COLORS.paymentsRefunds} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Payments By Method">
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={paymentsByMethodData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#ddeeee" />
                <XAxis dataKey="method" stroke="#438989" />
                <YAxis stroke="#438989" />
                <Tooltip contentStyle={{ backgroundColor: '#eef7f7', border: '1px solid #bbdddd' }} />
                <Legend />
                <Bar dataKey="gross" fill={CHART_COLORS.barGross} />
                <Bar dataKey="net" fill={CHART_COLORS.barNet} />
                <Bar dataKey="refunds" fill={CHART_COLORS.barRefunds} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Quick Notes">
          <div className="text-sm text-[var(--color-tropical-teal-700)] leading-relaxed">
            This dashboard displays key metrics: Users, Orders, Payments (including refunds shown as negative), and daily trends.
          </div>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Recent Orders">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-tropical-teal-100)] text-left text-[var(--color-tropical-teal-800)]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold">Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-tropical-teal-200)]">
                {data.recent.orders.map((o, i) => (
                  <tr
                    key={o.id}
                    className={`transition-colors ${
                      i % 2 === 0 ? 'bg-[var(--color-tropical-teal-50)]' : 'bg-white'
                    } hover:bg-[var(--color-tropical-teal-100)]`}
                  >
                    <td className="py-3 px-4 font-semibold text-[var(--color-tropical-teal-800)]">{o.orderNumber}</td>
                    <td className="py-3 px-4">{o.type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        o.status === 'Closed' ? 'bg-[var(--color-tropical-teal-200)] text-[var(--color-tropical-teal-800)]' :
                        o.status === 'Open' ? 'bg-[var(--color-tropical-teal-100)] text-[var(--color-tropical-teal-700)]' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{o.grandTotal}</td>
                    <td className="py-3 px-4 text-xs text-[var(--color-tropical-teal-600)]">
                      {new Date(o.openedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Recent Payments / Refunds">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-tropical-teal-100)] text-left text-[var(--color-tropical-teal-800)]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Tendered</th>
                  <th className="py-3 px-4 font-semibold">Change</th>
                  <th className="py-3 px-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-tropical-teal-200)]">
                {data.recent.payments.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      i % 2 === 0 ? 'bg-[var(--color-tropical-teal-50)]' : 'bg-white'
                    } hover:bg-[var(--color-tropical-teal-100)]`}
                  >
                    <td className="py-3 px-4 font-semibold text-[var(--color-tropical-teal-800)]">#{p.orderId}</td>
                    <td className="py-3 px-4">{p.method}</td>
                    <td className={`py-3 px-4 font-semibold ${Number(p.amount) < 0 ? 'text-red-600' : 'text-[var(--color-tropical-teal-700)]'}`}>
                      {p.amount}
                    </td>
                    <td className="py-3 px-4">{p.tendered ?? '-'}</td>
                    <td className="py-3 px-4">{p.change ?? '-'}</td>
                    <td className="py-3 px-4 text-xs text-[var(--color-tropical-teal-600)]">
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