import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import { ItemsService } from '../../services/items.service';
import { CategoriesService } from '../../services/categories.service';

export default function Items() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '0',
    taxRate: '10',
    categoryId: '',
    isActive: true
  });

  const load = async () => {
    setErr('');
    try {
      const [i, c] = await Promise.all([ItemsService.list(), CategoriesService.list()]);
      setItems(i);
      setCategories(c);
      if (c.length > 0 && !form.categoryId) {
        setForm(f => ({ ...f, categoryId: String(c[0].id) }));
      }
    } catch (e) {
      setErr(e.message || 'Failed to load');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-6">
      <Card title="Create New Item">
        <div className="grid gap-5 md:grid-cols-3">
          <Input label="Item Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Chicken Fried Rice" />
          <Input label="SKU (Optional)" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
          <Input label="Price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />

          <Input label="Tax Rate (%)" type="number" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: e.target.value }))} />

          <div>
            <label className="block mb-1.5 text-sm font-medium text-[var(--color-tropical-teal-800)]">Category</label>
            <select
              className="w-full rounded-xl border border-[var(--color-tropical-teal-300)] bg-white px-4 py-2.5 text-sm focus:ring-4 focus:ring-[var(--color-tropical-teal-300)]"
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-3">
            <Button onClick={async () => {
              try {
                await ItemsService.create({
                  ...form,
                  categoryId: Number(form.categoryId || 0),
                  price: Number(form.price),
                  taxRate: Number(form.taxRate)
                });
                setForm(f => ({ ...f, name: '', sku: '', price: '0' }));
                load();
              } catch (e) { setErr(e.message); }
            }}>
              Create Item
            </Button>
            <Button variant="ghost" onClick={load}>Refresh</Button>
          </div>
        </div>
        {err && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>}
      </Card>

      <Card title="All Items">
        {items.length === 0 ? (
          <EmptyState title="No items yet" hint="Create your first menu item above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-tropical-teal-100)] text-left text-[var(--color-tropical-teal-800)]">
                <tr>
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">SKU</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Tax %</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-tropical-teal-200)]">
                {items.map((i, idx) => (
                  <tr key={i.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-[var(--color-tropical-teal-50)]' : 'bg-white'} hover:bg-[var(--color-tropical-teal-100)]`}>
                    <td className="py-3 px-4 text-[var(--color-tropical-teal-600)]">{i.id}</td>
                    <td className="py-3 px-4 font-semibold">{i.name}</td>
                    <td className="py-3 px-4">{i.sku || '-'}</td>
                    <td className="py-3 px-4 font-medium">{i.price}</td>
                    <td className="py-3 px-4">{i.taxRate}</td>
                    <td className="py-3 px-4">{categories.find(c => c.id === i.categoryId)?.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${i.isActive ? 'bg-[var(--color-tropical-teal-200)] text-[var(--color-tropical-teal-800)]' : 'bg-gray-200 text-gray-700'}`}>
                        {i.isActive ? 'Active' : 'Inactive'}
                      </span>
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