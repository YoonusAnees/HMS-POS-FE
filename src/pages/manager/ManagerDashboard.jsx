import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { ReportsService } from '../../services/reports.service';

import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  LineChart, Line,
} from 'recharts';

const toNum = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;

const todayLocal = () => new Date().toISOString().slice(0, 10);
const daysAgoLocal = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const CHART_COLORS = {
  qty: '#76bcbc',
  revenue: '#438989',
  gross: '#54abab',
  net: '#438989',
  refunds: '#992222',
  barGross: '#98cdcd',
  barNet: '#438989',
  barRefunds: '#224444',
};

export default function ManagerDashboard() {
  const [from, setFrom] = useState(daysAgoLocal(6));
  const [to, setTo] = useState(todayLocal());
  const [currency, setCurrency] = useState('LKR');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('qty');

  const load = async () => {
    setErr('');
    setLoading(true);
    setData(null);
    try {
      const res = await ReportsService.managerSummary({ from, to, currency });
      setData(res);
    } catch (e) {
      setErr(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const topItemsFiltered = useMemo(() => {
    if (!data?.topItems) return [];
    let list = data.topItems;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(x => x.itemName?.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) =>
      sortBy === 'revenue' ? toNum(b.revenue) - toNum(a.revenue) : toNum(b.qty) - toNum(a.qty)
    );
  }, [data, search, sortBy]);

  const topItemsChart = useMemo(() => {
    return topItemsFiltered.slice(0, 10).map(x => ({
      name: x.itemName?.slice(0, 15) + (x.itemName?.length > 15 ? '...' : ''),
      qty: toNum(x.qty),
      revenue: toNum(x.revenue),
    }));
  }, [topItemsFiltered]);

  if (loading) return <Loading />;
  if (err) return <Card title="Error"><div className="text-red-600">{err}</div></Card>;

  return (
    <div className="grid gap-6">
      <Card title="Manager Dashboard – Sales & Fast-Moving Items">
        <div className="grid gap-4 md:grid-cols-4">
          <Input label="From Date" value={from} onChange={e => setFrom(e.target.value)} />
          <Input label="To Date" value={to} onChange={e => setTo(e.target.value)} />
          <Input label="Currency" value={currency} onChange={e => setCurrency(e.target.value)} />
          <div className="flex items-end">
            <Button className="w-full" onClick={load}>Reload Data</Button>
          </div>
        </div>
      </Card>

      {!data ? (
        <EmptyState title="No data available" hint="Try reloading with valid dates." />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card title="Closed Orders">
              <div className="text-sm text-[var(--color-tropical-teal-600)]">{data.range.from} → {data.range.to}</div>
              <div className="mt-3 text-3xl font-black text-[var(--color-tropical-teal-800)]">{data.ordersClosed}</div>
            </Card>
            <Card title="Net Revenue">
              <div className="text-3xl font-black text-[var(--color-tropical-teal-800)]">
                {data.range.currency} {data.revenueNet}
              </div>
              <div className="text-sm text-[var(--color-tropical-teal-600)] mt-2">Tax: {data.taxTotal}</div>
            </Card>
            <Card title="Net Payments">
              <div className="text-3xl font-black text-[var(--color-tropical-teal-800)]">
                {data.range.currency} {data.netPayments}
              </div>
              <div className="text-sm text-[var(--color-tropical-teal-600)] mt-2">
                Gross: {data.grossPayments} • Refunds: {data.refundPayments}
              </div>
            </Card>
            <Card title="Top Selling Item">
              <div className="text-sm text-[var(--color-tropical-teal-600)]">By {sortBy}</div>
              <div className="mt-3 text-lg font-bold text-[var(--color-tropical-teal-800)]">
                {topItemsFiltered[0]?.itemName || '—'}
              </div>
              <div className="text-sm text-[var(--color-tropical-teal-600)]">
                Qty: {topItemsFiltered[0]?.qty || 0} • Revenue: {data.range.currency} {toNum(topItemsFiltered[0]?.revenue || 0).toFixed(2)}
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Top 10 Fast-Selling Items">
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <Input label="Search Item" value={search} onChange={e => setSearch(e.target.value)} placeholder="e.g. Fried Rice" />
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[var(--color-tropical-teal-800)]">Sort By</label>
                  <select
                    className="w-full rounded-xl border border-[var(--color-tropical-teal-300)] bg-white px-4 py-2.5 text-sm focus:ring-4 focus:ring-[var(--color-tropical-teal-300)]"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="qty">Quantity</option>
                    <option value="revenue">Revenue</option>
                  </select>
                </div>
              </div>

              {topItemsChart.length === 0 ? (
                <EmptyState title="No items found" />
              ) : (
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={topItemsChart}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#ddeeee" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                      <YAxis stroke="#438989" />
                      <Tooltip contentStyle={{ backgroundColor: '#eef7f7', border: '1px solid #bbdddd' }} />
                      <Legend />
                      <Bar dataKey="qty" fill={CHART_COLORS.qty} />
                      <Bar dataKey="revenue" fill={CHART_COLORS.revenue} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card title="Daily Sales Trend">
              {(!data.daily || data.daily.length === 0) ? (
                <EmptyState title="No daily data" />
              ) : (
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <LineChart data={data.daily}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#ddeeee" />
                      <XAxis dataKey="day" stroke="#438989" />
                      <YAxis stroke="#438989" />
                      <Tooltip contentStyle={{ backgroundColor: '#eef7f7', border: '1px solid #bbdddd' }} />
                      <Legend />
                      <Line type="monotone" dataKey="gross" stroke={CHART_COLORS.gross} strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="net" stroke={CHART_COLORS.net} strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="refunds" stroke={CHART_COLORS.refunds} strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <Card title="Payments by Method">
            {(!data.totalsByMethod || data.totalsByMethod.length === 0) ? (
              <EmptyState title="No payment data" />
            ) : (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={data.totalsByMethod.map(m => ({
                    method: m.method,
                    gross: toNum(m.gross),
                    refunds: toNum(m.refunds),
                    net: toNum(m.net),
                  }))}>
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
            )}
          </Card>

          <Card title="Fast-Selling Items (Full List)">
            {topItemsFiltered.length === 0 ? (
              <EmptyState title="No items" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-tropical-teal-100)] text-left text-[var(--color-tropical-teal-800)]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Item Name</th>
                      <th className="py-3 px-4 font-semibold">Qty Sold</th>
                      <th className="py-3 px-4 font-semibold">Revenue</th>
                      <th className="py-3 px-4 font-semibold text-right">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-tropical-teal-200)]">
                    {topItemsFiltered.map((it, i) => {
                      const qty = toNum(it.qty);
                      const rev = toNum(it.revenue);
                      const avg = qty > 0 ? rev / qty : 0;
                      return (
                        <tr key={it.itemId} className={`transition-colors ${i % 2 === 0 ? 'bg-[var(--color-tropical-teal-50)]' : 'bg-white'} hover:bg-[var(--color-tropical-teal-100)]`}>
                          <td className="py-3 px-4 font-medium">{it.itemName}</td>
                          <td className="py-3 px-4 font-semibold text-[var(--color-tropical-teal-700)]">{qty}</td>
                          <td className="py-3 px-4">{data.range.currency} {rev.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">{data.range.currency} {avg.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}