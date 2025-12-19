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
      setErr(e.message || 'Failed to load');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-6">
      <Card title="Create New Category">
        <div className="grid gap-5 md:grid-cols-3">
          <Input label="Category Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Beverages" />
          <Input label="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} />
          <div className="flex items-end gap-3">
            <Button onClick={async () => {
              if (!name.trim()) return;
              try {
                await CategoriesService.create({ name: name.trim(), description: description.trim() || null });
                setName(''); setDescription('');
                load();
              } catch (e) { setErr(e.message); }
            }}>
              Create Category
            </Button>
            <Button variant="ghost" onClick={load}>Refresh</Button>
          </div>
        </div>
        {err && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>}
      </Card>

      <Card title="All Categories">
        {list.length === 0 ? (
          <EmptyState title="No categories" hint="Start by creating one above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-tropical-teal-100)] text-left text-[var(--color-tropical-teal-800)]">
                <tr>
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-tropical-teal-200)]">
                {list.map((c, i) => (
                  <tr key={c.id} className={`transition-colors ${i % 2 === 0 ? 'bg-[var(--color-tropical-teal-50)]' : 'bg-white'} hover:bg-[var(--color-tropical-teal-100)]`}>
                    <td className="py-3 px-4 text-[var(--color-tropical-teal-600)]">{c.id}</td>
                    <td className="py-3 px-4 font-semibold">{c.name}</td>
                    <td className="py-3 px-4">{c.description || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-[var(--color-tropical-teal-200)] text-[var(--color-tropical-teal-800)]' : 'bg-gray-200 text-gray-700'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await CategoriesService.update(c.id, { isActive: !c.isActive });
                          load();
                        }}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={async () => {
                          if (confirm('Delete this category?')) {
                            await CategoriesService.remove(c.id);
                            load();
                          }
                        }}
                      >
                        Delete
                      </Button>
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