import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/common/EmptyState";
import { OrdersService } from "../../services/orders.service";
import { PaymentsService } from "../../services/payments.service";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  // filter
  const [statusFilter, setStatusFilter] = useState("all"); // all | open | closed

  // payment modal
  const [payOpen, setPayOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [payMethod, setPayMethod] = useState("cash");
  const [tendered, setTendered] = useState("");
  const [payErr, setPayErr] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const load = async () => {
    setErr("");
    try {
      // ✅ load ALL orders (open + closed)
      const data = await OrdersService.listAll();
      setOrders(data);
    } catch (e) {
      setErr(e?.message || "Failed to load orders");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
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
      setPayErr(e?.message || "Failed to load order");
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

  const paidSoFar = useMemo(() => {
    if (!selectedOrder?.payments) return 0;
    return selectedOrder.payments.reduce((s, p) => s + toNum(p.amount), 0);
  }, [selectedOrder]);

  const billTotal = toNum(selectedOrder?.grandTotal);
  const dueNow = Math.max(0, round2(billTotal - paidSoFar));
  const changePreview = Math.max(0, round2(toNum(tendered) - dueNow));

  const payNow = async () => {
    setPayErr("");
    try {
      if (!selectedOrder?.id) throw new Error("No order selected");
      if (selectedOrder.status !== "open")
        throw new Error("Only open orders can be paid");

      const t = toNum(tendered);
      if (t <= 0) throw new Error("Enter tendered amount");

      setPayLoading(true);

      const res = await PaymentsService.create({
        orderId: selectedOrder.id,
        method: payMethod,
        tendered: t.toFixed(2),
      });

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
    <div className="grid gap-4">
      <Card title="Orders">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "ghost"}
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "open" ? "default" : "ghost"}
              onClick={() => setStatusFilter("open")}
            >
              Open
            </Button>
            <Button
              variant={statusFilter === "closed" ? "default" : "ghost"}
              onClick={() => setStatusFilter("closed")}
            >
              Closed
            </Button>
          </div>

          <Button variant="ghost" onClick={load}>
            Refresh
          </Button>
        </div>

        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

        {filteredOrders.length === 0 ? (
          <EmptyState title="No orders found" />
        ) : (
          <div className="overflow-auto mt-3">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-600">
                <tr>
                  <th className="py-2">Order</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2 font-semibold">{o.orderNumber}
                        <span className="text-xs text-zinc-600 ml-2">(ID: {o.id})</span>
                    </td>
                    
                    <td>{o.type}</td>
                    <td>
                      <span
                        className={
                          o.status === "closed"
                            ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700"
                            : o.status === "open"
                            ? "rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700"
                            : o.status === "refunded"
                            ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
                            : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700"
                        }
                      >
                        {o.status}
                      </span>
                    </td>
                    <td>{o.grandTotal}</td>
                    <td>{o.items?.length || 0}</td>
                    <td className="text-right">
                      {o.status === "open" ? (
                        <Button size="sm" onClick={() => openPay(o)}>
                          Pay
                        </Button>
                      ) : (
                        <span
                          className={
                            o.status === "closed"
                              ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700"
                              : o.status === "refunded"
                              ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
                              : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700"
                          }
                        >
                          {o.status === "closed"
                            ? "Paid"
                            : o.status === "refunded"
                            ? "Refunded"
                            : o.status}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <div className="font-semibold">Pay Order</div>
              <Button variant="ghost" onClick={closePay}>
                Close
              </Button>
            </div>

            <div className="p-4 grid gap-4">
              {payErr && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {payErr}
                </div>
              )}

              {!selectedOrder ? (
                <EmptyState title="Loading order..." />
              ) : (
                <>
                  <div className="rounded-xl bg-zinc-50 p-3 text-sm">
                    <div className="flex justify-between">
                      <span>Order</span>
                      <b>{selectedOrder.orderNumber}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Total</span>
                      <b>LKR {billTotal.toFixed(2)}</b>
                      
                    </div>
                    <div className="flex justify-between">
                      <span>Paid</span>
                      <b>LKR {paidSoFar.toFixed(2)}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Due</span>
                      <b>LKR {dueNow.toFixed(2)}</b>
                    </div>
                  </div>

                  <label className="text-sm font-medium">Pay Method</label>
                  <select
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>

                  <Input
                    label="Customer Gives (Tendered)"
                    value={tendered}
                    onChange={(e) => setTendered(e.target.value)}
                    placeholder="e.g. 500"
                  />

                  <div className="text-xs text-zinc-600">
                    Change: <b>LKR {changePreview.toFixed(2)}</b>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="w-full"
                      onClick={payNow}
                      disabled={payLoading}
                    >
                      {payLoading ? "Processing..." : "Pay"}
                    </Button>
                    <Button variant="ghost" onClick={closePay}>
                      Cancel
                    </Button>
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
