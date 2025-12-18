import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import { OrdersService } from '../../services/orders.service';

export default function Orders() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');

  const load = async () => {
    setErr('');
    try {
      setList(await OrdersService.listOpen());
    } catch (e) { setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-4">
      <Card title="Open Orders">
        <div className="flex justify-end">
          <Button variant="ghost" onClick={load}>Refresh</Button>
        </div>

        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

        {list.length === 0 ? <EmptyState title="No open orders" /> : (
          <div className="overflow-auto mt-3">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-600">
                <tr>
                  <th className="py-2">Order</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {list.map(o => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2 font-semibold">{o.orderNumber}</td>
                    <td>{o.type}</td>
                    <td>{o.status}</td>
                    <td>{o.grandTotal}</td>
                    <td>{o.items?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
