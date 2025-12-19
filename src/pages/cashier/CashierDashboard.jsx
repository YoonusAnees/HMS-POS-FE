import React, { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/common/EmptyState';
import { OrdersService } from '../../services/orders.service';
import { RefundsService } from '../../services/refunds.service';
import { ReportsService } from '../../services/reports.service';

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// YYYY-MM-DD local
const todayLocal = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function CashierDashboard() {
  // ✅ Receipt (Closed Orders)
  const [receiptOrderId, setReceiptOrderId] = useState('');
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [receiptErr, setReceiptErr] = useState('');
  const [receiptLoading, setReceiptLoading] = useState(false);

  // ✅ Refund
  const [refundOrderId, setRefundOrderId] = useState('');
  const [refundMethod, setRefundMethod] = useState('cash');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundErr, setRefundErr] = useState('');
  const [refundOk, setRefundOk] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  // ✅ End of Day report
  const [eodDate, setEodDate] = useState(todayLocal());
  const [eodCurrency, setEodCurrency] = useState('LKR');
  const [eod, setEod] = useState(null);
  const [eodErr, setEodErr] = useState('');
  const [eodLoading, setEodLoading] = useState(false);

  const loadReceipt = async () => {
    setReceiptErr('');
    setReceiptOrder(null);
    setReceiptLoading(true);
    try {
      const id = Number(receiptOrderId);
      if (!id) throw new Error('Enter valid Order ID');

      const order = await OrdersService.getById(id);

      // ✅ allow viewing any order, but highlight closed receipt
      setReceiptOrder(order);

      if (order.status !== 'closed') {
        setReceiptErr('This order is not CLOSED. Receipt is usually for closed orders.');
      }
    } catch (e) {
      setReceiptErr(e?.message || 'Failed to load order');
    } finally {
      setReceiptLoading(false);
    }
  };

  const receiptSummary = useMemo(() => {
    if (!receiptOrder) return null;

    const total = toNum(receiptOrder.grandTotal);
    const pays = receiptOrder.payments || [];

    const gross = pays.filter(p => toNum(p.amount) > 0).reduce((s, p) => s + toNum(p.amount), 0);
    const refunds = pays.filter(p => toNum(p.amount) < 0).reduce((s, p) => s + Math.abs(toNum(p.amount)), 0);
    const netPaid = gross - refunds;
    const balance = round2(total - netPaid);

    return {
      total,
      gross,
      refunds,
      netPaid: round2(netPaid),
      balance,
    };
  }, [receiptOrder]);

  const doRefund = async () => {
    setRefundErr('');
    setRefundOk('');
    setRefundLoading(true);
    try {
      const orderId = Number(refundOrderId);
      const amount = toNum(refundAmount);

      if (!orderId) throw new Error('Order ID is required');
      if (amount <= 0) throw new Error('Refund amount must be > 0');

      const res = await RefundsService.create({
        orderId,
        method: refundMethod,
        amount: amount.toFixed(2),
        currency: 'LKR',
      });

      setRefundOk(`Refund created. Order status: ${res.summary?.orderStatus || 'ok'}`);
      setRefundAmount('');

      // refresh receipt if same order
      if (receiptOrder?.id === orderId) {
        const refreshed = await OrdersService.getById(orderId);
        setReceiptOrder(refreshed);
      }
    } catch (e) {
      setRefundErr(e?.message || 'Refund failed');
    } finally {
      setRefundLoading(false);
    }
  };

  const loadEOD = async () => {
    setEodErr('');
    setEod(null);
    setEodLoading(true);
    try {
      const res = await ReportsService.eod({ date: eodDate, currency: eodCurrency });
      setEod(res);
    } catch (e) {
      setEodErr(e?.message || 'Failed to load report');
    } finally {
      setEodLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* ✅ Receipt */}
      <Card title="Receipt View (Closed Orders)">
        <div className="grid gap-3">
          <Input
            label="Order ID"
            value={receiptOrderId}
            onChange={(e) => setReceiptOrderId(e.target.value)}
            placeholder="e.g. 12"
          />
          <Button onClick={loadReceipt} disabled={receiptLoading}>
            {receiptLoading ? 'Loading...' : 'View Receipt'}
          </Button>

          {receiptErr && <div className="text-sm text-red-600">{receiptErr}</div>}

          {!receiptOrder ? (
            <EmptyState title="No receipt loaded" hint="Enter an order ID to preview receipt." />
          ) : (
            <div className="rounded-xl border p-3 text-sm">
              <div className="flex justify-between">
                <span><b>Order</b></span>
                <span>{receiptOrder.orderNumber} (#{receiptOrder.id})</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-semibold">{receiptOrder.status}</span>
              </div>

              <div className="mt-2 border-t pt-2">
                <div className="flex justify-between"><span>Total</span><b>LKR {receiptSummary.total.toFixed(2)}</b></div>
                <div className="flex justify-between"><span>Paid</span><b>LKR {receiptSummary.netPaid.toFixed(2)}</b></div>
                <div className="flex justify-between"><span>Refunds</span><b>LKR {receiptSummary.refunds.toFixed(2)}</b></div>
                <div className="flex justify-between"><span>Balance</span><b>LKR {receiptSummary.balance.toFixed(2)}</b></div>
              </div>

              <div className="mt-2 border-t pt-2">
                <div className="font-semibold mb-1">Payments</div>
                <div className="space-y-1">
                  {(receiptOrder.payments || []).map((p) => {
                    const amt = toNum(p.amount);
                    return (
                      <div key={p.id} className="flex justify-between text-xs">
                        <span>{p.method} {amt < 0 ? '(refund)' : ''}</span>
                        <span>
                          LKR {amt.toFixed(2)}
                          {p.tendered != null ? ` • Tendered ${toNum(p.tendered).toFixed(2)}` : ''}
                          {p.change != null ? ` • Change ${toNum(p.change).toFixed(2)}` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button variant="ghost" onClick={() => window.print()}>Print</Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ✅ Refund */}
      <Card title="Refund">
        <div className="grid gap-3">
          <Input
            label="Order ID"
            value={refundOrderId}
            onChange={(e) => setRefundOrderId(e.target.value)}
            placeholder="e.g. 12"
          />
          <Input
            label="Method (cash/card/room/online)"
            value={refundMethod}
            onChange={(e) => setRefundMethod(e.target.value)}
          />
          <Input
            label="Refund Amount"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            placeholder="e.g. 250.00"
          />
          <Button onClick={doRefund} disabled={refundLoading}>
            {refundLoading ? 'Refunding...' : 'Create Refund'}
          </Button>

          {refundErr && <div className="text-sm text-red-600">{refundErr}</div>}
          {refundOk && <div className="text-sm text-green-700">{refundOk}</div>}

          <div className="text-xs text-zinc-600">
            Refund creates a negative payment entry. It will show in receipt and EOD report.
          </div>
        </div>
      </Card>

      {/* ✅ EOD Report */}
      <Card title="End of Day (EOD) Report">
        <div className="grid gap-3">
          <Input
            label="Date (YYYY-MM-DD)"
            value={eodDate}
            onChange={(e) => setEodDate(e.target.value)}
          />
          <Input
            label="Currency"
            value={eodCurrency}
            onChange={(e) => setEodCurrency(e.target.value)}
          />
          <Button onClick={loadEOD} disabled={eodLoading}>
            {eodLoading ? 'Loading...' : 'Load Report'}
          </Button>

          {eodErr && <div className="text-sm text-red-600">{eodErr}</div>}

          {!eod ? (
            <EmptyState title="No report loaded" hint="Pick a date and load." />
          ) : (
            <div className="rounded-xl border p-3 text-sm">
              <div className="flex justify-between"><span>Date</span><b>{eod.date}</b></div>
              <div className="flex justify-between"><span>Orders Closed</span><b>{eod.ordersClosed}</b></div>

              <div className="mt-2 border-t pt-2">
                <div className="flex justify-between"><span>Revenue (Closed Orders)</span><b>{eod.currency} {eod.revenueNet}</b></div>
                <div className="flex justify-between"><span>Tax Total</span><b>{eod.currency} {eod.taxTotal}</b></div>
              </div>

              {/* If you added grossPayments/refundPayments/netPayments in backend, show them */}
              {eod.grossPayments && (
                <div className="mt-2 border-t pt-2">
                  <div className="flex justify-between"><span>Gross Payments</span><b>{eod.currency} {eod.grossPayments}</b></div>
                  <div className="flex justify-between"><span>Refund Payments</span><b>{eod.currency} {eod.refundPayments}</b></div>
                  <div className="flex justify-between"><span>Net Payments</span><b>{eod.currency} {eod.netPayments}</b></div>
                </div>
              )}

              <div className="mt-2 border-t pt-2">
                <div className="font-semibold mb-1">Totals By Method</div>
                <div className="space-y-1">
                  {(eod.totalsByMethod || []).map((m) => (
                    <div key={m.method} className="flex justify-between text-xs">
                      <span>{m.method}</span>
                      <span>Gross {m.gross} • Refund {m.refunds} • Net {m.net}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Shortcuts */}
      <Card title="Shortcuts">
        <div className="text-sm text-zinc-600">POS and Orders are in sidebar.</div>
      </Card>
    </div>
  );
}
