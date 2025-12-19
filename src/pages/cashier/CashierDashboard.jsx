import React, { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/common/EmptyState';
import { OrdersService } from '../../services/orders.service';
import { RefundsService } from '../../services/refunds.service';
import { ReportsService } from '../../services/reports.service';

const toNum = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const todayLocal = () => new Date().toISOString().slice(0, 10);

export default function CashierDashboard() {
  // Receipt
  const [receiptOrderId, setReceiptOrderId] = useState('');
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [receiptErr, setReceiptErr] = useState('');
  const [receiptLoading, setReceiptLoading] = useState(false);

  // Refund
  const [refundOrderId, setRefundOrderId] = useState('');
  const [refundMethod, setRefundMethod] = useState('cash');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundErr, setRefundErr] = useState('');
  const [refundOk, setRefundOk] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  // EOD Report
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
      if (!id) throw new Error('Enter a valid Order ID');
      const order = await OrdersService.getById(id);
      setReceiptOrder(order);
      if (order.status !== 'closed') {
        setReceiptErr('Warning: Order is not closed. Receipt is typically for closed orders.');
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
    return { total, gross, refunds, netPaid: round2(netPaid), balance };
  }, [receiptOrder]);

  const doRefund = async () => {
    setRefundErr('');
    setRefundOk('');
    setRefundLoading(true);
    try {
      const orderId = Number(refundOrderId);
      const amount = toNum(refundAmount);
      if (!orderId) throw new Error('Order ID required');
      if (amount <= 0) throw new Error('Refund amount must be positive');
      const res = await RefundsService.create({
        orderId,
        method: refundMethod,
        amount: amount.toFixed(2),
        currency: 'LKR',
      });
      setRefundOk(`Refund successful! Order status: ${res.summary?.orderStatus || 'updated'}`);
      setRefundAmount('');
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Receipt Viewer */}
      <Card title="Receipt Preview">
        <div className="space-y-4">
          <Input label="Order ID" value={receiptOrderId} onChange={e => setReceiptOrderId(e.target.value)} placeholder="e.g. 15" />
          <Button className="w-full" onClick={loadReceipt} disabled={receiptLoading}>
            {receiptLoading ? 'Loading...' : 'Load Receipt'}
          </Button>

          {receiptErr && <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">{receiptErr}</div>}

          {!receiptOrder ? (
            <EmptyState title="Enter Order ID" hint="Load a closed order to preview/print receipt." />
          ) : (
            <div className="rounded-2xl border-2 border-[var(--color-tropical-teal-300)] bg-[var(--color-tropical-teal-50)] p-5 text-sm">
              <div className="text-center mb-4">
                <div className="text-xl font-black text-[var(--color-tropical-teal-800)]">Anexxa Hotel</div>
                <div className="text-xs text-[var(--color-tropical-teal-600)]">Receipt</div>
              </div>

              <div className="space-y-2 border-b pb-3 border-[var(--color-tropical-teal-200)]">
                <div className="flex justify-between"><span>Order</span><b>{receiptOrder.orderNumber} (#{receiptOrder.id})</b></div>
                <div className="flex justify-between"><span>Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${receiptOrder.status === 'closed' ? 'bg-[var(--color-tropical-teal-200)] text-[var(--color-tropical-teal-800)]' : 'bg-orange-100 text-orange-800'}`}>
                    {receiptOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="my-4 space-y-2 font-medium">
                <div className="flex justify-between"><span>Bill Total</span><b>LKR {receiptSummary.total.toFixed(2)}</b></div>
                <div className="flex justify-between"><span>Paid</span><b className="text-green-700">LKR {receiptSummary.netPaid.toFixed(2)}</b></div>
                <div className="flex justify-between"><span>Refunds</span><b className="text-red-600">-LKR {receiptSummary.refunds.toFixed(2)}</b></div>
                <div className="flex justify-between text-lg"><span>Balance</span><b className={receiptSummary.balance > 0 ? 'text-red-600' : 'text-green-700'}>LKR {receiptSummary.balance.toFixed(2)}</b></div>
              </div>

              <div className="border-t pt-3">
                <div className="font-semibold text-[var(--color-tropical-teal-800)] mb-2">Payments</div>
                {(receiptOrder.payments || []).map(p => {
                  const amt = toNum(p.amount);
                  return (
                    <div key={p.id} className="flex justify-between text-xs mb-1">
                      <span>{p.method} {amt < 0 && '(Refund)'}</span>
                      <span className={amt < 0 ? 'text-red-600' : ''}>
                        LKR {Math.abs(amt).toFixed(2)}
                        {p.tendered && ` • Tendered ${p.tendered}`}
                        {p.change && ` • Change ${p.change}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Button className="w-full mt-5" variant="primary" onClick={() => window.print()}>
                Print Receipt
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Refund Tool */}
      <Card title="Issue Refund">
        <div className="space-y-4">
          <Input label="Order ID" value={refundOrderId} onChange={e => setRefundOrderId(e.target.value)} placeholder="e.g. 15" />
          
          <div>
            <label className="block mb-1.5 text-sm font-medium text-[var(--color-tropical-teal-800)]">Refund Method</label>
            <select
              className="w-full rounded-xl border border-[var(--color-tropical-teal-300)] bg-white px-4 py-2.5 text-sm focus:ring-4 focus:ring-[var(--color-tropical-teal-300)]"
              value={refundMethod}
              onChange={e => setRefundMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="room">Room Charge</option>
            </select>
          </div>

          <Input label="Refund Amount (LKR)" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} placeholder="e.g. 150.00" />

          <Button className="w-full" onClick={doRefund} disabled={refundLoading}>
            {refundLoading ? 'Processing...' : 'Issue Refund'}
          </Button>

          {refundErr && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{refundErr}</div>}
          {refundOk && <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{refundOk}</div>}
        </div>
      </Card>

      {/* EOD Report */}
      <Card title="End of Day Report">
        <div className="space-y-4">
          <Input label="Date" type="date" value={eodDate} onChange={e => setEodDate(e.target.value)} />
          <Input label="Currency" value={eodCurrency} onChange={e => setEodCurrency(e.target.value)} />

          <Button className="w-full" onClick={loadEOD} disabled={eodLoading}>
            {eodLoading ? 'Loading...' : 'Generate Report'}
          </Button>

          {eodErr && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{eodErr}</div>}

          {!eod ? (
            <EmptyState title="No report" hint="Select date and generate." />
          ) : (
            <div className="rounded-2xl bg-[var(--color-tropical-teal-50)] border border-[var(--color-tropical-teal-300)] p-5 text-sm space-y-3">
              <div className="text-center font-bold text-[var(--color-tropical-teal-800)] text-lg">EOD - {eod.date}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>Orders Closed</div><b className="text-right">{eod.ordersClosed}</b>
                <div>Net Revenue</div><b className="text-right">{eod.revenueNet}</b>
                <div>Tax Total</div><b className="text-right">{eod.taxTotal}</b>
              </div>

              <div className="border-t pt-3">
                <div className="font-semibold mb-2 text-[var(--color-tropical-teal-800)]">By Payment Method</div>
                {(eod.totalsByMethod || []).map(m => (
                  <div key={m.method} className="flex justify-between text-xs py-1">
                    <span>{m.method}</span>
                    <span>Gross {m.gross} • Net <b>{m.net}</b></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}