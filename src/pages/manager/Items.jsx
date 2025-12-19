import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import { ItemsService } from '../../services/items.service';
import { CategoriesService } from '../../services/categories.service';

export default function Items() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [err, setErr] = useState('');
  const [categories, setCategories] = useState([]);


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
      setCats(c);
      if (!form.categoryId && c[0]) setForm(f => ({ ...f, categoryId: String(c[0].id) }));
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
  CategoriesService.list()
    .then(setCategories)
    .catch(console.error);
}, []);


  return (
    <div className="grid gap-4">
      <Card title="Create Item">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
  label="Item Name"
  value={form.name}
  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
 />

<Input
  label="Price"
  value={form.price}
  onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
 />

<Input
  label="Tax Rate (%)"
  value={form.taxRate}
  onChange={(e) => setForm(f => ({ ...f, taxRate: e.target.value }))}
 />

<label className="text-sm font-medium">Category</label>
<select
  className="w-full rounded-xl border px-3 py-2 text-sm"
  value={form.categoryId}
  onChange={(e) =>
    setForm(f => ({ ...f, categoryId: Number(e.target.value) }))
  }
>
  <option value="">Select category</option>
  {categories.map(c => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ))}
</select>


          <div className="flex items-end gap-2">
            <Button onClick={async () => {
              try {
                await ItemsService.create({
                  ...form,
                  categoryId: Number(form.categoryId),
                  price: String(form.price),
                  taxRate: String(form.taxRate)
                });
                setForm(f => ({...f, name:'', sku:''}));
                load();
              } catch (e) { setErr(e.message); }
            }}>Create</Button>
            <Button variant="ghost" onClick={load}>Refresh</Button>
          </div>
        </div>

        <div className="mt-3 text-xs text-zinc-600">
          Categories: {cats.map(c => `${c.id}:${c.name}`).join(' | ')}
        </div>

        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
      </Card>

      <Card title="Items">
        {items.length === 0 ? <EmptyState title="No items" /> : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-600">
                <tr>
                  <th className="py-2">ID</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Tax%</th>
                  <th>Category</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id} className="border-t">
                    <td className="py-2">{i.id}</td>
                    <td className="font-semibold">{i.name}</td>
                    <td className="text-zinc-600">{i.sku || '-'}</td>
                    <td>{i.price}</td>
                    <td>{i.taxRate}</td>
                    <td>{i.name}</td>
                    <td>{String(i.isActive)}</td>
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
