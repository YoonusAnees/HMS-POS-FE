import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ReportsService } from '../../services/reports.service';

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState('LKR');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  const generate = async () => {
    setErr('');
    setData(null);
    try {
      const r = await ReportsService.eod({ date, currency });
      setData(r);
    } catch (e) {
      setErr(e.message || 'Failed to generate report');
    }
  };

  return (
    <div className="grid gap-6">
      <Card title="End-of-Day Report Generator">
        <div className="grid gap-5 md:grid-cols-3">
          <Input label="Report Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <Input label="Currency" value={currency} onChange={e => setCurrency(e.target.value)} />
          <div className="flex items-end gap-3">
            <Button onClick={generate}>Generate Report</Button>
            <Button variant="ghost" onClick={() => { setData(null); setErr(''); }}>Clear</Button>
          </div>
        </div>
        {err && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>}
      </Card>

      {data && (
        <Card title={`EOD Report – ${data.date}`}>
          <div className="grid gap-6 md:grid-cols-4 text-center">
            <div>
              <div className="text-sm text-[var(--color-tropical-teal-600)]">Orders Closed</div>
              <div className="text-3xl font-black text-[var(--color-tropical-teal-800)] mt-2">{data.ordersClosed}</div>
            </div>
            <div>
              <div className="text-sm text-[var(--color-tropical-teal-600)]">Net Revenue</div>
              <div className="text-3xl font-black text-[var(--color-tropical-teal-800)] mt-2">{data.revenueNet}</div>
            </div>
            <div>
              <div className="text-sm text-[var(--color-tropical-teal-600)]">Tax Collected</div>
              <div className="text-3xl font-black text-[var(--color-tropical-teal-800)] mt-2">{data.taxTotal}</div>
            </div>
            <div>
              <div className="text-sm text-[var(--color-tropical-teal-600)]">Payments Net</div>
              <div className="text-3xl font-black text-[var(--color-tropical-teal-800)] mt-2">{data.netPayments}</div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-[var(--color-tropical-teal-800)] mb-3">Payments by Method</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-tropical-teal-100)] text-left text-[var(--color-tropical-teal-800)]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Method</th>
                    <th className="py-3 px-4 font-semibold text-right">Gross</th>
                    <th className="py-3 px-4 font-semibold text-right">Refunds</th>
                    <th className="py-3 px-4 font-semibold text-right">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-tropical-teal-200)]">
                  {data.totalsByMethod.map((m, i) => (
                    <tr key={m.method} className={i % 2 === 0 ? 'bg-[var(--color-tropical-teal-50)]' : 'bg-white'}>
                      <td className="py-3 px-4 font-semibold">{m.method}</td>
                      <td className="py-3 px-4 text-right">{m.gross}</td>
                      <td className="py-3 px-4 text-right text-red-600">{m.refunds}</td>
                      <td className="py-3 px-4 text-right font-bold text-[var(--color-tropical-teal-700)]">{m.net}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}