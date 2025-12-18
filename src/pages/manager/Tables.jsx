import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import { TablesService } from '../../services/tables.service';

export default function Tables() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');

  const [code, setCode] = useState('T-01');
  const [capacity, setCapacity] = useState('4');

  const load = async () => {
    setErr('');
    try { setList(await TablesService.list()); }
    catch (e) { setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-4">
      <Card title="Create Table">
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input label="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          <div className="flex items-end gap-2">
            <Button onClick={async () => {
              try {
                await TablesService.create({ code, capacity: Number(capacity), status: 'free', isActive: true });
                load();
              } catch (e) { setErr(e.message); }
            }}>Create</Button>
            <Button variant="ghost" onClick={load}>Refresh</Button>
          </div>
        </div>
        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
      </Card>

      <Card title="Tables">
        {list.length === 0 ? <EmptyState title="No tables" /> : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-600">
                <tr>
                  <th className="py-2">ID</th>
                  <th>Code</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {list.map(t => (
                  <tr key={t.id} className="border-t">
                    <td className="py-2">{t.id}</td>
                    <td className="font-semibold">{t.code}</td>
                    <td>{t.capacity}</td>
                    <td>{t.status}</td>
                    <td>{String(t.isActive)}</td>
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
