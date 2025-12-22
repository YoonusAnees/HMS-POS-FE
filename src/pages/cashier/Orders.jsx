import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/common/EmptyState";
import { OrdersService } from "../../services/orders.service";
import { PaymentsService } from "../../services/payments.service";
import {toast} from 'react-hot-toast';


const toNum = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  

  // Payment Modal
  const [payOpen, setPayOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [payMethod, setPayMethod] = useState("cash");
  const [tendered, setTendered] = useState("");
  const [payErr, setPayErr] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const load = async () => {
    setErr("");
    try {
      const data = await OrdersService.listAll();
      setOrders(data);
    } catch (e) {
      setErr(e?.message || "Failed to load orders");
    }
  };

  useEffect(() => { load(); }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter(o => o.status === statusFilter);
  }, [orders, statusFilter]);

  const openPay = async (order) => {
    setPayErr("");
    setTendered("");
    setPayMethod("cash");
    setPayOpen(true);
    try {
      const full = await OrdersService.getById(order.id);
      setSelectedOrder(full);
    } catch (e) {
      setPayErr(e?.message || "Failed to load order details");
    }
  };

  const closePay = () => {
    setPayOpen(false);
    setSelectedOrder(null);
    setTendered("");
    setPayMethod("cash");
    setPayErr("");
    setPayLoading(false);
  };

  const paidSoFar = useMemo(() => selectedOrder?.payments?.reduce((s, p) => s + toNum(p.amount), 0) || 0, [selectedOrder]);
  const billTotal = toNum(selectedOrder?.grandTotal);
  const dueNow = Math.max(0, round2(billTotal - paidSoFar));
  const changePreview = Math.max(0, round2(toNum(tendered) - dueNow));

  const payNow = async () => {
    setPayErr("");
    try {
      if (selectedOrder.status !== "open") throw new Error("Only open orders can be paid");
      const t = toNum(tendered);
      if (t <= 0) throw new Error("Enter tendered amount");

      setPayLoading(true);
      const res = await PaymentsService.create({
        orderId: selectedOrder.id,
        method: payMethod,
        tendered: t.toFixed(2),
      });


      toast.success(`Payment successful! Change: LKR ${changePreview.toFixed(2)}`);


      await load();
      if (res.order.status === "closed") {
        closePay();
      } else {
        setSelectedOrder(res.order);
        setTendered("");
      }
    } catch (e) {
      setPayErr(e?.message || "Payment failed");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card title="All Orders">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-3">
            {['all', 'open', 'closed' ,'refunded'].map(st => (
              <Button
                key={st}
                variant={statusFilter === st ? "primary" : "ghost"}
                onClick={() => setStatusFilter(st)}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)} Orders
              </Button>
            ))}
          </div>
          <Button variant="ghost" onClick={load}>Refresh List</Button>
        </div>

        {err && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">{err}</div>}

        {filteredOrders.length === 0 ? (
          <EmptyState title="No orders" hint="Orders will appear here once created." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-tropical-teal-100)] text-left text-[var(--color-tropical-teal-800)]">
                <tr>
                  <th className="py-4 px-5 font-semibold">Order #</th>
                  <th className="py-4 px-5 font-semibold">Type</th>
                  <th className="py-4 px-5 font-semibold">Status</th>
                  <th className="py-4 px-5 font-semibold">Total</th>
                  <th className="py-4 px-5 font-semibold">Items</th>
                  <th className="py-4 px-5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-tropical-teal-200)]">
                {filteredOrders.map((o, i) => (
                  <tr key={o.id} className={`transition-colors ${i % 2 === 0 ? 'bg-[var(--color-tropical-teal-50)]' : 'bg-white'} hover:bg-[var(--color-tropical-teal-100)]`}>
                    <td className="py-4 px-5 font-bold text-[var(--color-tropical-teal-800)]">
                      {o.orderNumber} <span className="text-xs font-normal text-[var(--color-tropical-teal-600)]">(ID: {o.id})</span>
                    </td>
                    <td className="py-4 px-5">{o.type.replace('_', ' ')}</td>
                    <td className="py-4 px-5">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        o.status === 'closed' ? 'bg-[var(--color-tropical-teal-200)] text-[var(--color-tropical-teal-800)]' :
                        o.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold">LKR {o.grandTotal}</td>
                    <td className="py-4 px-5">{o.items?.length || 0}</td>
                    <td className="py-4 px-5 text-right">
                      {o.status === 'open' ? (
                        <Button onClick={() => openPay(o)}>Pay Now</Button>
                      ) : (
                        <span className="font-semibold text-[var(--color-tropical-teal-700)]">
                          {o.status === 'closed' ? 'Paid' : 'Refunded'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payment Modal */}
      {payOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-[var(--color-tropical-teal-600)] text-white p-6 text-center">
              <h2 className="text-2xl font-black">Complete Payment</h2>
            </div>

            <div className="p-6 space-y-5">
              {payErr && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{payErr}</div>}

              {!selectedOrder ? (
                <EmptyState title="Loading..." />
              ) : (
                <>
                  <div className="bg-[var(--color-tropical-teal-50)] rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between text-lg"><span>Order</span><b>{selectedOrder.orderNumber}</b></div>
                    <div className="flex justify-between"><span>Bill Total</span><b>LKR {billTotal.toFixed(2)}</b></div>
                    <div className="flex justify-between"><span>Paid So Far</span><b>LKR {paidSoFar.toFixed(2)}</b></div>
                    <div className="flex justify-between text-xl font-bold"><span>Due Now</span><b className="text-[var(--color-tropical-teal-700)]">LKR {dueNow.toFixed(2)}</b></div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-[var(--color-tropical-teal-800)]">Payment Method</label>
                    <select
                      className="w-full rounded-xl border border-[var(--color-tropical-teal-300)] bg-white px-4 py-3 text-sm focus:ring-4 focus:ring-[var(--color-tropical-teal-300)]"
                      value={payMethod}
                      onChange={e => setPayMethod(e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="room">Room Charge</option>
                    </select>
                  </div>

                  <Input
                    label="Customer Tendered Amount"
                    value={tendered}
                    onChange={e => setTendered(e.target.value)}
                    placeholder="e.g. 1000.00"
                  />

                  <div className="text-center text-lg font-bold text-[var(--color-tropical-teal-700)]">
                    Change: LKR {changePreview.toFixed(2)}
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 text-lg py-4" onClick={payNow} disabled={payLoading}>
                      {payLoading ? 'Processing...' : 'Confirm Payment'}
                    </Button>
                    <Button variant="ghost" onClick={closePay}>Cancel</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}