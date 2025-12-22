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
import { RoomsService } from '../../services/rooms.service';
import { toast } from 'react-hot-toast';
const toNum = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export default function POS() {
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState('');

  const [type, setType] = useState('dine_in');
  const [tableId, setTableId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [serviceChargeRate, setServiceChargeRate] = useState('10');

  const [cart, setCart] = useState([]);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [payMethod, setPayMethod] = useState('cash');
  const [payTendered, setPayTendered] = useState('');

  // --- Load data ---
  const load = async () => {
    setErr('');
    try {
      const [c, i, t, r] = await Promise.all([
        CategoriesService.list(),
        ItemsService.list(),
        TablesService.list(),
        RoomsService.listVacant(),
      ]);

      const activeCats = c.filter(x => x.isActive);
      const activeItems = i.filter(x => x.isActive);
      const activeTables = t.filter(x => x.isActive);

      setCats(activeCats);
      setItems(activeItems);
      setTables(activeTables);
      setRooms(r);

      if (activeTables.length > 0 && !tableId) setTableId(String(activeTables[0].id));
      if (r.length > 0 && !roomId) setRoomId(String(r[0].id));
    } catch (e) {
      setErr(e?.message || 'Failed to load POS data');
    }
  };

  useEffect(() => { load(); }, []);

  // --- Organize items by category ---
  const itemsByCat = useMemo(() => {
    const map = new Map();
    items.forEach(it => {
      const arr = map.get(it.categoryId) || [];
      arr.push(it);
      map.set(it.categoryId, arr);
    });
    return map;
  }, [items]);

  // --- Cart totals ---
  const totals = useMemo(() => {
    let subtotal = 0, discountTotal = 0, taxTotal = 0;
    cart.forEach(line => {
      const base = toNum(line.price) * line.qty;
      const disc = toNum(line.discount || 0);
      const afterDisc = Math.max(0, base - disc);
      const tax = afterDisc * (toNum(line.taxRate) / 100);
      subtotal += base;
      discountTotal += disc;
      taxTotal += tax;
    });
    const baseAfter = Math.max(0, subtotal - discountTotal);
    const sc = baseAfter * (toNum(serviceChargeRate) / 100);
    const grand = round2(baseAfter + taxTotal + sc);
    return { subtotal, discountTotal, taxTotal, serviceCharge: sc, grandTotal: grand };
  }, [cart, serviceChargeRate]);

  const addToCart = (it) => {
    setCart(prev => {
      const existing = prev.find(x => x.itemId === it.id);
      if (existing) return prev.map(x => x.itemId === it.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { itemId: it.id, name: it.name, price: it.price, taxRate: it.taxRate, qty: 1, discount: '0.00' }];
    });
  };

  // --- Create Order ---
  const createOrder = async () => {
    setErr('');
    try {
      if (cart.length === 0) throw new Error('Add items to cart first');

      const payload = {
        type,
        tableId: type === 'dine_in' ? Number(tableId || 0) : undefined,
        roomId: type === 'room' ? Number(roomId) : undefined,
        items: cart.map(c => ({ itemId: c.itemId, qty: c.qty, discount: c.discount || '0.00' })),
        serviceChargeRate,
      };

      const order = await OrdersService.create(payload);
      const full = await OrdersService.getById(order.id);
      toast.success('Order Created');

      setCreatedOrder(full);
    } catch (e) {
      setErr(e?.message || 'Failed to create order');
      toast.error(e?.message || 'Failed to create order');

    }
  };

  const orderPaid = useMemo(() => createdOrder?.payments?.reduce((s, p) => s + toNum(p.amount), 0) || 0, [createdOrder]);
  const orderTotal = toNum(createdOrder?.grandTotal ?? totals.grandTotal);
  const orderDue = Math.max(0, round2(orderTotal - orderPaid));
  const changePreview = Math.max(0, round2(toNum(payTendered) - orderDue));

  const takePayment = async () => {
  setErr('');
  try {
    if (!createdOrder?.id) throw new Error('Create order first');

    const tendered = toNum(payTendered);
    if (tendered <= 0) throw new Error('Enter tendered amount');

    await PaymentsService.create({
      orderId: createdOrder.id,
      method: payMethod,
      tendered: tendered.toFixed(2),
    });

    const refreshed = await OrdersService.getById(createdOrder.id);
    setCreatedOrder(refreshed);
    setPayTendered('');

    toast.success(`Payment successful! Change: LKR ${changePreview.toFixed(2)}`);

    if (refreshed.status === 'closed') {
      setCart([]);
      setCreatedOrder(null);
      setPayTendered('');
    }

  } catch (e) {
    setErr(e?.message || 'Payment failed');

    toast.error(e?.message || 'Payment failed');
  }
};


  const clearPOS = () => {
    setCart([]);
    setCreatedOrder(null);
    setPayTendered('');
    setErr('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Menu */}
      <div className="lg:col-span-2">
        <Card title="Menu" className="h-full">
          {err && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>}

          <div className="grid gap-6">
            {cats.map(cat => {
              const catItems = itemsByCat.get(cat.id) || [];
              if (catItems.length === 0) return null;
              return (
                <div key={cat.id}>
                  <h3 className="text-lg font-bold text-[var(--color-tropical-teal-800)] mb-3">{cat.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {catItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className="rounded-2xl bg-white border-2 border-[var(--color-tropical-teal-200)] p-5 text-left hover:border-[var(--color-tropical-teal-600)] hover:shadow-lg transition-all"
                      >
                        <div className="font-bold text-[var(--color-tropical-teal-800)]">{item.name}</div>
                        <div className="text-sm text-[var(--color-tropical-teal-600)] mt-2">
                          LKR {item.price} <span className="text-xs">(Tax {item.taxRate}%)</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {cats.length === 0 && <EmptyState title="No menu items" hint="Add categories and items first." />}
        </Card>
      </div>

      {/* Cart & Payment */}
      <div className="space-y-6">
        {cart.length === 0 ? (
          <Card title="Cart Empty">
            <EmptyState title="Start adding items" hint="Click any menu item to begin an order." />
          </Card>
        ) : (
          <>
            <Card title="Order Details">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[var(--color-tropical-teal-800)]">Order Type</label>
                  <select
                    className="w-full rounded-xl border border-[var(--color-tropical-teal-300)] bg-white px-4 py-3"
                    value={type}
                    onChange={e => setType(e.target.value)}
                  >
                    <option value="dine_in">Dine In</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="room">Room</option>
                  </select>
                </div>

                {type === 'dine_in' && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-[var(--color-tropical-teal-800)]">Table</label>
                    <select
                      className="w-full rounded-xl border border-[var(--color-tropical-teal-300)] bg-white px-4 py-3"
                      value={tableId}
                      onChange={e => setTableId(e.target.value)}
                    >
                      {tables.map(t => <option key={t.id} value={t.id}>{t.code} ({t.capacity} seats)</option>)}
                    </select>
                  </div>
                )}

                {type === 'room' && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-[var(--color-tropical-teal-800)]">Room</label>
                    <select
                      className="w-full rounded-xl border border-[var(--color-tropical-teal-300)] bg-white px-4 py-3"
                      value={roomId}
                      onChange={e => setRoomId(e.target.value)}
                    >
                      {rooms.map(r => (
                        <option key={r.id} value={r.id}>
                          Room {r.roomNumber} {r.floor ? `- Floor ${r.floor}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Input label="Service Charge (%)" value={serviceChargeRate} onChange={e => setServiceChargeRate(e.target.value)} />
              </div>
            </Card>

            <Card title="Cart Items">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.itemId} className="flex items-center justify-between bg-[var(--color-tropical-teal-50)] rounded-xl p-4">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-[var(--color-tropical-teal-600)]">LKR {item.price} × {item.qty}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setCart(prev => prev.map(x => x.itemId === item.itemId ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}>-</Button>
                      <span className="font-bold w-8 text-center">{item.qty}</span>
                      <Button size="sm" variant="ghost" onClick={() => setCart(prev => prev.map(x => x.itemId === item.itemId ? { ...x, qty: x.qty + 1 } : x))}>+</Button>
                      <Button size="sm" variant="danger" onClick={() => setCart(prev => prev.filter(x => x.itemId !== item.itemId))}>×</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between"><span>Subtotal</span><b>LKR {totals.subtotal.toFixed(2)}</b></div>
                <div className="flex justify-between"><span>Discount</span><b>-LKR {totals.discountTotal.toFixed(2)}</b></div>
                <div className="flex justify-between"><span>Tax</span><b>LKR {totals.taxTotal.toFixed(2)}</b></div>
                <div className="flex justify-between"><span>Service Charge</span><b>LKR {totals.serviceCharge.toFixed(2)}</b></div>
                <div className="flex justify-between text-xl font-black text-[var(--color-tropical-teal-800)] pt-3 border-t">
                  <span>Grand Total</span><b>LKR {totals.grandTotal.toFixed(2)}</b>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="flex-1" onClick={createOrder}>Create Order</Button>
                <Button variant="ghost" onClick={clearPOS}>Clear All</Button>
              </div>

              {createdOrder && (
                <div className="mt-4 p-4 bg-[var(--color-tropical-teal-100)] rounded-xl text-center">
                  <div className="font-bold text-lg">Order #{createdOrder.orderNumber}</div>
                  <div className="text-sm">Status: <b>{createdOrder.status.toUpperCase()}</b></div>
                </div>
              )}
            </Card>

            {createdOrder && (
              <Card title="Take Payment">
                <div className="space-y-4">
                  <div className="bg-[var(--color-tropical-teal-50)] rounded-xl p-4 space-y-2">
                    <div className="flex justify-between"><span>Bill Total</span><b>LKR {orderTotal.toFixed(2)}</b></div>
                    <div className="flex justify-between"><span>Paid</span><b>LKR {orderPaid.toFixed(2)}</b></div>
                    <div className="flex justify-between text-xl font-bold"><span>Due</span><b className="text-red-600">LKR {orderDue.toFixed(2)}</b></div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-[var(--color-tropical-teal-800)]">Method</label>
                    <select className="w-full rounded-xl border border-[var(--color-tropical-teal-300)] bg-white px-4 py-3" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="room">Room Charge</option>
                    </select>
                  </div>

                  <Input label="Customer Tendered" value={payTendered} onChange={e => setPayTendered(e.target.value)} placeholder="e.g. 2000.00" />

                  <div className="text-center text-2xl font-black text-[var(--color-tropical-teal-700)]">
                    Change: LKR {changePreview.toFixed(2)}
                  </div>

                  <Button className="w-full text-lg py-4" onClick={takePayment}>
                    Complete Payment
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
