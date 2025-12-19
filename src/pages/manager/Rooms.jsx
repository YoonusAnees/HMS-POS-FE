import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import { RoomsService } from '../../services/rooms.service';
import { api } from '../../services/api';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    roomNumber: '',
    type: '',
    floor: '',
    status: 'vacant'
  });

  const load = async () => {
    setErr('');
    try {
      const data = await RoomsService.list();
      setRooms(data);
    } catch (e) {
      setErr(e.message || 'Failed to load rooms');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createRoom = async () => {
    try {
      await api.post('/rooms', {
        roomNumber: form.roomNumber,
        type: form.type,
        floor: Number(form.floor),
        status: form.status
      });
      setForm({ roomNumber: '', type: '', floor: '', status: 'vacant' });
      load();
    } catch (e) {
      setErr(e.message || 'Failed to create room');
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/rooms/${id}/status`, { status });
      load();
    } catch (e) {
      setErr(e.message || 'Failed to update status');
    }
  };

  return (
    <div className="grid gap-6">
      {/* CREATE ROOM */}
      <Card title="Create New Room">
        <div className="grid gap-5 md:grid-cols-4">
          <Input
            label="Room Number"
            value={form.roomNumber}
            onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))}
            placeholder="e.g. 101"
          />

          <Input
            label="Room Type"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            placeholder="Deluxe / Standard"
          />

          <Input
            label="Floor"
            type="number"
            value={form.floor}
            onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
          />

          <div>
            <label className="block mb-1.5 text-sm font-medium text-[var(--color-tropical-teal-800)]">
              Status
            </label>
            <select
              className="w-full rounded-xl border border-[var(--color-tropical-teal-300)] bg-white px-4 py-2.5 text-sm"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="out_of_order">Out of Order</option>
            </select>
          </div>

          <div className="flex items-end gap-3 md:col-span-4">
            <Button onClick={createRoom}>Create Room</Button>
            <Button variant="ghost" onClick={load}>Refresh</Button>
          </div>
        </div>

        {err && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {err}
          </div>
        )}
      </Card>

      {/* ROOMS TABLE */}
      <Card title="All Rooms">
        {rooms.length === 0 ? (
          <EmptyState title="No rooms yet" hint="Create your first room above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-tropical-teal-100)] text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Room No</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Floor</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-tropical-teal-200)]">
                {rooms.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`${idx % 2 === 0 ? 'bg-[var(--color-tropical-teal-50)]' : 'bg-white'} hover:bg-[var(--color-tropical-teal-100)]`}
                  >
                    <td className="py-3 px-4">{r.id}</td>
                    <td className="py-3 px-4 font-semibold">{r.roomNumber}</td>
                    <td className="py-3 px-4">{r.type}</td>
                    <td className="py-3 px-4">{r.floor}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                          ${r.status === 'vacant' && 'bg-green-100 text-green-800'}
                          ${r.status === 'occupied' && 'bg-yellow-100 text-yellow-800'}
                          ${r.status === 'out_of_order' && 'bg-red-100 text-red-800'}
                        `}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <Button size="sm" onClick={() => changeStatus(r.id, 'vacant')}>Vacant</Button>
                      <Button size="sm" onClick={() => changeStatus(r.id, 'occupied')}>Occupied</Button>
                      <Button size="sm" variant="danger" onClick={() => changeStatus(r.id, 'out_of_order')}>
                        Out
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
