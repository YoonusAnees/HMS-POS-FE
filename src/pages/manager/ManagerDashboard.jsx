import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { ReportsService } from '../../services/reports.service';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

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

export default function ManagerDashboard() {
  const [from, setFrom] = useState(daysAgoLocal(6));
  const [to, setTo] = useState(todayLocal());
  const [currency, setCurrency] = useState('LKR');

  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('qty'); // qty | revenue

  const load = async () => {
    setErr('');
    setLoading(true);
    setData(null);
    try {
      const res = await ReportsService.managerSummary({ from, to, currency });
      setData(res);
    } catch (e) {
      setErr(e?.message || 'Failed to load manager dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topItemsFiltered = useMemo(() => {
    const list = data?.topItems || [];
    const q = search.trim().toLowerCase();

    let out = !q ? list : list.filter((x) => String(x.itemName || '').toLowerCase().includes(q));

    out = [...out].sort((a, b) => {
      if (sortBy === 'revenue') return toNum(b.revenue) - toNum(a.revenue);
      return toNum(b.qty) - toNum(a.qty);
    });

    return out;
  }, [data, search, sortBy]);

  const topItemsChart = useMemo(() => {
    return topItemsFiltered.slice(0, 10).map((x) => ({
      name: x.itemName,
      qty: toNum(x.qty),
      revenue: toNum(x.revenue),
    }));
  }, [topItemsFiltered]);

  if (loading) return <Loading />;
  if (err) return <Card title="Error">{err}</Card>;

  return (
    <div className="grid gap-4">
      {/* Filters */}
      <Card title="Manager Dashboard (Sales & Fast Moving Items)">
        <div className="grid gap-3 md:grid-cols-4">
          <Input label="From (YYYY-MM-DD)" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To (YYYY-MM-DD)" value={to} onChange={(e) => setTo(e.target.value)} />
          <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          <div className="flex items-end">
            <Button className="w-full" onClick={load}>Reload</Button>
          </div>
        </div>
      </Card>

      {!data ? (
        <Card title="Manager Dashboard">
          <EmptyState title="No data" hint="Reload to fetch sales + top items." />
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card title="Orders Closed">
              <div className="text-sm text-zinc-600">{data.range.from} → {data.range.to}</div>
              <div className="mt-2 text-2xl font-black">{data.ordersClosed}</div>
            </Card>

            <Card title="Revenue (Closed Orders)">
              <div className="text-2xl font-black">{data.range.currency} {data.revenueNet}</div>
              <div className="text-sm text-zinc-600 mt-1">Tax: {data.taxTotal}</div>
            </Card>

            <Card title="Payments (Net)">
              <div className="text-2xl font-black">{data.range.currency} {data.netPayments}</div>
              <div className="text-sm text-zinc-600 mt-1">
                Gross: {data.grossPayments} • Refunds: {data.refundPayments}
              </div>
            </Card>

            <Card title="Fastest Item">
              <div className="text-sm text-zinc-600">By {sortBy}</div>
              <div className="mt-2 text-base font-semibold">{topItemsFiltered?.[0]?.itemName || '—'}</div>
              <div className="text-sm text-zinc-600">
                Qty: {topItemsFiltered?.[0]?.qty || 0} • Revenue: {data.range.currency} {Number(topItemsFiltered?.[0]?.revenue || 0).toFixed(2)}
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Top 10 Fast Selling Items">
              <div className="grid gap-3 md:grid-cols-2 mb-3">
                <Input label="Search item" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. fried rice" />
                <Input label="Sort (qty/revenue)" value={sortBy} onChange={(e) => setSortBy(e.target.value)} />
              </div>

              {topItemsChart.length === 0 ? (
                <EmptyState title="No items" hint="No closed orders found in this date range." />
              ) : (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={topItemsChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" hide />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="qty" />
                      <Bar dataKey="revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card title="Daily Sales (Payments)">
              {(!data.daily || data.daily.length === 0) ? (
                <EmptyState title="No trend data" />
              ) : (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={data.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="gross" />
                      <Line type="monotone" dataKey="refunds" />
                      <Line type="monotone" dataKey="net" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* By Method */}
          <Card title="Payments By Method">
            {(!data.totalsByMethod || data.totalsByMethod.length === 0) ? (
              <EmptyState title="No payments" />
            ) : (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={data.totalsByMethod.map((m) => ({
                      method: m.method,
                      gross: toNum(m.gross),
                      refunds: toNum(m.refunds),
                      net: toNum(m.net),
                    }))}
                  >
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
            )}
          </Card>

          {/* Fast selling table */}
          <Card title="Fast Selling Items (Details)">
            {topItemsFiltered.length === 0 ? (
              <EmptyState title="No items" />
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-zinc-600">
                    <tr>
                      <th className="py-2">Item</th>
                      <th>Qty</th>
                      <th>Revenue</th>
                      <th className="text-right">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topItemsFiltered.map((it) => {
                      const qty = toNum(it.qty);
                      const rev = toNum(it.revenue);
                      const avg = qty > 0 ? rev / qty : 0;
                      return (
                        <tr key={it.itemId} className="border-t">
                          <td className="py-2 font-semibold">{it.itemName}</td>
                          <td>{qty}</td>
                          <td>{data.range.currency} {rev.toFixed(2)}</td>
                          <td className="text-right">{data.range.currency} {avg.toFixed(2)}</td>
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
