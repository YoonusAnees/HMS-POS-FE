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
    try {
      setList(await TablesService.list());
    } catch (e) {
      setErr(e.message || 'Failed to load tables');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-6">
      <Card title="Add New Table">
        <div className="grid gap-5 md:grid-cols-3">
          <Input label="Table Code" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. T-05" />
          <Input label="Seating Capacity" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} />
          <div className="flex items-end gap-3">
            <Button onClick={async () => {
              try {
                await TablesService.create({
                  code: code.trim(),
                  capacity: Number(capacity),
                  status: 'free',
                  isActive: true
                });
                setCode(''); setCapacity('4');
                load();
              } catch (e) { setErr(e.message); }
            }}>
              Create Table
            </Button>
            <Button variant="ghost" onClick={load}>Refresh</Button>
          </div>
        </div>
        {err && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>}
      </Card>

      <Card title="All Tables">
        {list.length === 0 ? (
          <EmptyState title="No tables configured" hint="Add your restaurant tables above." />
        ) : (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {list.map(table => (
              <div
                key={table.id}
                className="rounded-2xl border border-[var(--color-tropical-teal-200)] bg-white p-6 shadow-md text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-2xl font-black text-[var(--color-tropical-teal-800)]">{table.code}</div>
                <div className="mt-2 text-sm text-[var(--color-tropical-teal-600)]">
                  Capacity: <b>{table.capacity}</b> guests
                </div>
                <div className="mt-3">
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-medium ${
                    table.status === 'free' ? 'bg-[var(--color-tropical-teal-200)] text-[var(--color-tropical-teal-800)]' :
                    table.status === 'occupied' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {table.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-3 text-xs text-[var(--color-tropical-teal-600)]">
                  {table.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}