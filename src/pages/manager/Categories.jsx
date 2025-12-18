import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import { CategoriesService } from '../../services/categories.service';

export default function Categories() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setErr('');
    try {
      setList(await CategoriesService.list());
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-4">
      <Card title="Create Category">
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex items-end gap-2">
            <Button onClick={async () => {
              try {
                await CategoriesService.create({ name, description, isActive: true });
                setName(''); setDescription('');
                await load();
              } catch (e) { setErr(e.message); }
            }}>Create</Button>
            <Button variant="ghost" onClick={load}>Refresh</Button>
          </div>
        </div>
        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
      </Card>

      <Card title="Categories">
        {list.length === 0 ? <EmptyState title="No categories" /> : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-600">
                <tr>
                  <th className="py-2">ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Active</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(c => (
                  <tr key={c.id} className="border-t">
                    <td className="py-2">{c.id}</td>
                    <td className="font-semibold">{c.name}</td>
                    <td className="text-zinc-600">{c.description || '-'}</td>
                    <td>{String(c.isActive)}</td>
                    <td className="text-right space-x-2">
                      <Button variant="ghost" onClick={async () => {
                        await CategoriesService.update(c.id, { isActive: !c.isActive });
                        load();
                      }}>{c.isActive ? 'Deactivate' : 'Activate'}</Button>
                      <Button variant="danger" onClick={async () => {
                        await CategoriesService.remove(c.id);
                        load();
                      }}>Delete</Button>
                    </td>
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
