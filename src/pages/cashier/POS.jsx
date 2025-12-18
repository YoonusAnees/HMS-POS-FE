import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/common/EmptyState';
import { CategoriesService } from '../../services/categories.service';
import { ItemsService } from '../../services/items.service';
import { TablesService } from '../../services/tables.service';
import { OrdersService } from '../../services/orders.service';
import { PaymentsService } from '../../services/payments.service';

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function POS() {
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [err, setErr] = useState('');

  const [type, setType] = useState('dine_in');
  const [tableId, setTableId] = useState('');
  const [serviceChargeRate, setServiceChargeRate] = useState('10');

  const [cart, setCart] = useState([]); // { itemId, name, price, taxRate, qty, discount }
  const [createdOrder, setCreatedOrder] = useState(null);

  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');

  const load = async () => {
    setErr('');
    try {
      const [c, i, t] = await Promise.all([
        CategoriesService.list(),
        ItemsService.list(),
        TablesService.list()
      ]);

      setCats(c.filter(x => x.isActive));
      setItems(i.filter(x => x.isActive));
      setTables(t.filter(x => x.isActive));

      if (!tableId && t[0]) setTableId(String(t[0].id));
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const itemsByCat = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const key = it.categoryId;
      const arr = map.get(key) || [];
      arr.push(it);
      map.set(key, arr);
    }
    return map;
  }, [items]);

  const totals = useMemo(() => {
    let subtotal = 0, discountTotal = 0, taxTotal = 0;
    for (const line of cart) {
      const base = toNum(line.price) * toNum(line.qty);
      const disc = toNum(line.discount);
      const baseAfter = Math.max(0, base - disc);
      const tax = baseAfter * (toNum(line.taxRate) / 100);
      subtotal += base;
      discountTotal += disc;
      taxTotal += tax;
    }
    const baseAfter = Math.max(0, subtotal - discountTotal);
    const sc = baseAfter * (toNum(serviceChargeRate)/100);
    const grand = baseAfter + taxTotal + sc;
    return {
      subtotal, discountTotal, taxTotal, serviceCharge: sc, grandTotal: grand
    };
  }, [cart, serviceChargeRate]);

  const addToCart = (it) => {
    setCart(prev => {
      const idx = prev.findIndex(x => x.itemId === it.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { itemId: it.id, name: it.name, price: it.price, taxRate: it.taxRate, qty: 1, discount: '0.00' }];
    });
  };

  const createOrder = async () => {
    setErr('');
    try {
      if (cart.length === 0) throw new Error('Cart is empty');

      const payload = {
        type,
        tableId: type === 'dine_in' ? Number(tableId) : undefined,
        items: cart.map(c => ({ itemId: c.itemId, qty: c.qty, discount: String(c.discount || '0.00') })),
        serviceChargeRate: String(serviceChargeRate)
      };

      const order = await OrdersService.create(payload);
      setCreatedOrder(order);
    } catch (e) {
      setErr(e.message);
    }
  };

  const takePayment = async () => {
    setErr('');
    try {
      if (!createdOrder?.id) throw new Error('Create an order first');
      const amount = String(payAmount || '');
      if (!amount) throw new Error('Enter payment amount');

      const res = await PaymentsService.create({
        orderId: createdOrder.id,
        method: payMethod,
        amount
      });

      // refresh order (status may auto-close)
      const refreshed = await OrdersService.getById(createdOrder.id);
      setCreatedOrder(refreshed);
      setPayAmount('');

      // if closed, reset POS
      if (refreshed.status === 'closed') {
        setCart([]);
        setType('dine_in');
      }
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Left: Menu */}
      <div className="lg:col-span-2 grid gap-4">
        <Card title="POS - Menu">
          {err && <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>}

          <div className="flex flex-wrap gap-2">
            {cats.map(c => (
              <span key={c.id} className="rounded-xl border px-3 py-1 text-xs font-semibold">
                {c.name}
              </span>
            ))}
          </div>

          <div className="mt-4 grid gap-3">
            {cats.map(c => {
              const list = itemsByCat.get(c.id) || [];
              if (list.length === 0) return null;
              return (
                <div key={c.id}>
                  <div className="mb-2 text-sm font-bold">{c.name}</div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {list.map(it => (
                      <button
                        key={it.id}
                        onClick={() => addToCart(it)}
                        className="rounded-2xl border bg-white p-3 text-left hover:bg-zinc-50"
                      >
                        <div className="font-semibold">{it.name}</div>
                        <div className="text-xs text-zinc-600">
                          LKR {it.price} • Tax {it.taxRate}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {cats.length === 0 && <EmptyState title="No categories" hint="Create categories first." />}
        </Card>
      </div>

      {/* Right: Cart + Create Order + Payment */}
      <div className="grid gap-4">
        <Card title="Order Settings">
          <div className="grid gap-3">
            <Input label="Order Type" value={type} onChange={(e) => setType(e.target.value)} />
            {type === 'dine_in' && (
              <Input label="Table ID" value={tableId} onChange={(e) => setTableId(e.target.value)} />
            )}
            <Input label="Service Charge (%)" value={serviceChargeRate} onChange={(e) => setServiceChargeRate(e.target.value)} />
            <div className="text-xs text-zinc-600">
              Tables: {tables.map(t => `${t.id}:${t.code}`).join(' | ')}
            </div>
          </div>
        </Card>

        <Card title="Cart">
          {cart.length === 0 ? <EmptyState title="Cart empty" hint="Click menu items to add." /> : (
            <div className="space-y-2">
              {cart.map((c) => (
                <div key={c.itemId} className="flex items-center justify-between rounded-xl border p-2">
                  <div>
                    <div className="text-sm font-semibold">{c.name}</div>
                    <div className="text-xs text-zinc-600">
                      LKR {c.price} • Tax {c.taxRate}% • Qty {c.qty}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setCart(prev => prev.map(x => x.itemId === c.itemId ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}>-</Button>
                    <Button variant="ghost" onClick={() => setCart(prev => prev.map(x => x.itemId === c.itemId ? { ...x, qty: x.qty + 1 } : x))}>+</Button>
                    <Button variant="danger" onClick={() => setCart(prev => prev.filter(x => x.itemId !== c.itemId))}>X</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t pt-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><b>{totals.subtotal.toFixed(2)}</b></div>
            <div className="flex justify-between"><span>Discount</span><b>{totals.discountTotal.toFixed(2)}</b></div>
            <div className="flex justify-between"><span>Tax</span><b>{totals.taxTotal.toFixed(2)}</b></div>
            <div className="flex justify-between"><span>Service Charge</span><b>{totals.serviceCharge.toFixed(2)}</b></div>
            <div className="flex justify-between text-base mt-2"><span>Grand Total</span><b>{totals.grandTotal.toFixed(2)}</b></div>
          </div>

          <div className="mt-4">
            <Button className="w-full" onClick={createOrder}>Create Order</Button>
          </div>

          {createdOrder && (
            <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm">
              <div><b>Order:</b> {createdOrder.orderNumber} (#{createdOrder.id})</div>
              <div><b>Status:</b> {createdOrder.status}</div>
              <div><b>Total:</b> {createdOrder.grandTotal}</div>
            </div>
          )}
        </Card>

        <Card title="Payments (Split / Partial)">
          <div className="grid gap-3">
            <Input label="Method (cash/card/room/online)" value={payMethod} onChange={(e) => setPayMethod(e.target.value)} />
            <Input label="Amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="e.g. 500.00" />
            <Button onClick={takePayment}>Pay</Button>
            <div className="text-xs text-zinc-600">
              Tip: enter 500, then another 300 → order auto-closes when fully paid.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
