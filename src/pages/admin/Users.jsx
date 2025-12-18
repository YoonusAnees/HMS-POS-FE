import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { UsersService } from '../../services/users.service';

export default function Users() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'cashier'
  });

  const load = async () => {
    setErr('');
    try { setList(await UsersService.list()); }
    catch (e) { setErr(e.message); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-4">
      <Card title="Create User (Admin)">
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Username" value={form.username} onChange={(e) => setForm(f => ({...f, username: e.target.value}))}/>
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm(f => ({...f, password: e.target.value}))}/>
          <Input label="Role (admin/manager/cashier/reception)" value={form.role} onChange={(e) => setForm(f => ({...f, role: e.target.value}))}/>
          <Input label="Full Name" value={form.fullName} onChange={(e) => setForm(f => ({...f, fullName: e.target.value}))}/>
          <Input label="Email" value={form.email} onChange={(e) => setForm(f => ({...f, email: e.target.value}))}/>
          <div className="flex items-end gap-2">
            <Button onClick={async () => {
              try {
                await UsersService.create(form);
                setForm({ username:'', password:'', fullName:'', email:'', role:'cashier' });
                load();
              } catch (e) { setErr(e.message); }
            }}>Create</Button>
            <Button variant="ghost" onClick={load}>Refresh</Button>
          </div>
        </div>
        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
      </Card>

      <Card title="Users">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-600">
              <tr>
                <th className="py-2">ID</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {list.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="py-2">{u.id}</td>
                  <td className="font-semibold">{u.username}</td>
                  <td>{u.fullName}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.role}</td>
                  <td>{String(u.isActive)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
