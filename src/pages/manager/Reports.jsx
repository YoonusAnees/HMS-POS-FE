import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ReportsService } from '../../services/reports.service';

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [currency, setCurrency] = useState('LKR');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  return (
    <div className="grid gap-4">
      <Card title="End-of-day Report">
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Date (YYYY-MM-DD)" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          <div className="flex items-end gap-2">
            <Button onClick={async () => {
              setErr('');
              try {
                const r = await ReportsService.eod({ date, currency });
                setData(r);
              } catch (e) { setErr(e.message); }
            }}>Generate</Button>
            <Button variant="ghost" onClick={() => setData(null)}>Clear</Button>
          </div>
        </div>
        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
      </Card>

      {data && (
        <Card title="Report Result">
          <div className="text-sm">
            <div><b>Date:</b> {data.date}</div>
            <div><b>Orders Closed:</b> {data.ordersClosed}</div>
            <div><b>Revenue Net:</b> {data.revenueNet}</div>
            <div><b>Tax Total:</b> {data.taxTotal}</div>
          </div>

          <div className="mt-3 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-600">
                <tr>
                  <th className="py-2">Method</th>
                  <th>Gross</th>
                  <th>Refunds</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {data.totalsByMethod.map(m => (
                  <tr key={m.method} className="border-t">
                    <td className="py-2 font-semibold">{m.method}</td>
                    <td>{m.gross}</td>
                    <td>{m.refunds}</td>
                    <td>{m.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
