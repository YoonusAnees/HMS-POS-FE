import React, { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/common/EmptyState';
import { OrdersService } from '../../services/orders.service';
import { RefundsService } from '../../services/refunds.service';
import { ReportsService } from '../../services/reports.service';

// Import jsPDF correctly
import jsPDF from 'jspdf';

// Import autoTable function separately
import autoTable from 'jspdf-autotable';

const toNum = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const todayLocal = () => new Date().toISOString().slice(0, 10);

// Add autoTable plugin to jsPDF prototype
// This makes autoTable available on all jsPDF instances
if (typeof window !== 'undefined') {
  // This ensures autoTable is available in the browser
  window.jsPDF = window.jsPDF || jsPDF;
}

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

  const generateReceiptPDF = () => {
    if (!receiptOrder) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      let yPos = 20;

      // Header
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Anexxa Hotel', pageWidth / 2, yPos, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPos += 8;
      doc.text('Official Receipt', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 12;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      
      // Order Details
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Details', margin, yPos);
      
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Order Number: ${receiptOrder.orderNumber || receiptOrder.id}`, margin, yPos);
      yPos += 5;
      doc.text(`Order ID: #${receiptOrder.id}`, margin, yPos);
      yPos += 5;
      doc.text(`Status: ${receiptOrder.status.toUpperCase()}`, margin, yPos);
      yPos += 5;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
      yPos += 5;
      doc.text(`Time: ${new Date().toLocaleTimeString()}`, margin, yPos);
      
      yPos += 8;
      doc.line(margin, yPos, pageWidth - margin, yPos);
      
      // Summary Section
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', margin, yPos);
      
      const summaryData = [
        ['Bill Total', `LKR ${receiptSummary.total.toFixed(2)}`],
        ['Amount Paid', `LKR ${receiptSummary.netPaid.toFixed(2)}`],
        ['Refunds', `-LKR ${receiptSummary.refunds.toFixed(2)}`],
      ];
      
      yPos += 8;
      summaryData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(value, pageWidth - margin - 30, yPos, { align: 'right' });
        yPos += 6;
      });
      
      yPos += 3;
      doc.line(pageWidth - margin - 60, yPos, pageWidth - margin, yPos);
      
      yPos += 8;
      doc.setFontSize(12);
      doc.text('Balance', margin, yPos);
      const balanceText = `LKR ${receiptSummary.balance.toFixed(2)}`;
      const balanceColor = receiptSummary.balance > 0 ? [255, 0, 0] : [0, 128, 0];
      doc.setTextColor(...balanceColor);
      doc.text(balanceText, pageWidth - margin - 30, yPos, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      
      // Payments Section
      if (receiptOrder.payments?.length > 0) {
        yPos += 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Payment Details', margin, yPos);
        
        yPos += 8;
        const paymentHeaders = [['Method', 'Amount', 'Details']];
        const paymentRows = receiptOrder.payments.map(p => {
          const amt = toNum(p.amount);
          const details = [];
          if (p.tendered) details.push(`Given: ${p.tendered}`);
          if (p.change) details.push(`Change: ${p.change}`);
          return [
            `${p.method} ${amt < 0 ? '(Refund)' : ''}`,
            `LKR ${Math.abs(amt).toFixed(2)}`,
            details.join(' • ')
          ];
        });
        
        // Use autoTable function directly
        autoTable(doc, {
          startY: yPos,
          head: paymentHeaders,
          body: paymentRows,
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });
        
        yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : yPos + 50;
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for choosing Anexxa Hotel!', pageWidth / 2, pageWidth - 10, { align: 'center' });
      doc.text('Generated by Cashier System', pageWidth / 2, pageWidth - 5, { align: 'center' });
      
      // Save PDF
      doc.save(`Receipt-${receiptOrder.orderNumber || receiptOrder.id}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const generateEODPDF = () => {
    if (!eod) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      let yPos = 20;

      // Header
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Anexxa Hotel', pageWidth / 2, yPos, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      yPos += 10;
      doc.text('End of Day Report', pageWidth / 2, yPos, { align: 'center' });
      
      doc.setFontSize(10);
      yPos += 8;
      doc.text(`Date: ${eod.date}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      doc.text(`Currency: ${eodCurrency}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 12;
      doc.setDrawColor(52, 152, 219);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      
      // Summary Section
      yPos += 15;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Daily Summary', margin, yPos);
      
      yPos += 12;
      const summaryHeaders = [['Metric', 'Value']];
      const summaryRows = [
        ['Orders Closed', eod.ordersClosed || 0],
        ['Net Revenue', eod.revenueNet || '0.00'],
        ['Tax Total', eod.taxTotal || '0.00'],
        ['Gross Revenue', eod.revenueGross || '0.00']
      ];
      
      // Use autoTable function directly
      autoTable(doc, {
        startY: yPos,
        head: summaryHeaders,
        body: summaryRows,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : yPos + 50;
      
      // Payment Methods Breakdown
      if (eod.totalsByMethod?.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Method Breakdown', margin, yPos);
        
        yPos += 10;
        const paymentHeaders = [['Method', 'Gross Amount', 'Net Amount']];
        const paymentRows = eod.totalsByMethod.map(m => [m.method, m.gross, m.net]);
        
        autoTable(doc, {
          startY: yPos,
          head: paymentHeaders,
          body: paymentRows,
          margin: { left: margin, right: margin },
          styles: { fontSize: 9, cellPadding: 4 },
          headStyles: { fillColor: [155, 89, 182], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' }
          }
        });
        
        yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : yPos + 50;
      }
      
      // Additional Details Section
      if (eod.additionalDetails || eod.notes) {
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Additional Information', margin, yPos);
        
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const additionalInfo = [
          eod.additionalDetails,
          eod.notes,
          `Report generated for cashier operations on ${eod.date}`
        ].filter(Boolean).join('\n\n');
        
        const splitText = doc.splitTextToSize(additionalInfo, pageWidth - 2 * margin);
        doc.text(splitText, margin, yPos);
      }
      
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Anexxa Hotel EOD Report - Confidential', pageWidth / 2, pageHeight - 15, { align: 'center' });
      doc.text('Page 1 of 1', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save PDF
      doc.save(`EOD-Report-${eod.date}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error generating EOD PDF:', error);
      alert('Error generating EOD report PDF. Please try again.');
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Receipt Viewer */}
      <Card title="Receipt Preview">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              label="Order ID"
              value={receiptOrderId}
              onChange={e => setReceiptOrderId(e.target.value)}
              placeholder="e.g. 15"
              className="flex-1"
            />
            <div className="pt-6">
              <Button onClick={loadReceipt} disabled={receiptLoading}>
                {receiptLoading ? 'Loading...' : 'Load'}
              </Button>
            </div>
          </div>

          {receiptErr && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
              {receiptErr}
            </div>
          )}

          {!receiptOrder ? (
            <EmptyState 
              title="Enter Order ID" 
              hint="Load a closed order to preview/print receipt." 
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-[var(--color-tropical-teal-300)] bg-[var(--color-tropical-teal-50)] p-5 text-sm">
                <div className="text-center mb-4">
                  <div className="text-xl font-black text-[var(--color-tropical-teal-800)]">Anexxa Hotel</div>
                  <div className="text-xs text-[var(--color-tropical-teal-600)]">Receipt</div>
                </div>

                <div className="space-y-2 border-b pb-3 border-[var(--color-tropical-teal-200)]">
                  <div className="flex justify-between">
                    <span>Order</span>
                    <b>{receiptOrder.orderNumber} (#{receiptOrder.id})</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${receiptOrder.status === 'closed' ? 'bg-[var(--color-tropical-teal-200)] text-[var(--color-tropical-teal-800)]' : 'bg-orange-100 text-orange-800'}`}>
                      {receiptOrder.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="my-4 space-y-2 font-medium">
                  <div className="flex justify-between">
                    <span>Bill Total</span>
                    <b>LKR {receiptSummary.total.toFixed(2)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid</span>
                    <b className="text-green-700">LKR {receiptSummary.netPaid.toFixed(2)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Refunds</span>
                    <b className="text-red-600">-LKR {receiptSummary.refunds.toFixed(2)}</b>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Balance</span>
                    <b className={receiptSummary.balance > 0 ? 'text-red-600' : 'text-green-700'}>
                      LKR {receiptSummary.balance.toFixed(2)}
                    </b>
                  </div>
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
                          {p.tendered && ` • Given ${p.tendered}`}
                          {p.change && ` • Change ${p.change}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant="primary" 
                  onClick={generateReceiptPDF}
                  disabled={!receiptOrder}
                >
                  Download PDF
                </Button>
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Refund Tool */}
      <Card title="Issue Refund">
        <div className="space-y-4">
          <Input 
            label="Order ID" 
            value={refundOrderId} 
            onChange={e => setRefundOrderId(e.target.value)} 
            placeholder="e.g. 15" 
          />
          
          <div>
            <label className="block mb-1.5 text-sm font-medium text-[var(--color-tropical-teal-800)]">
              Refund Method
            </label>
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

          <Input 
            label="Refund Amount (LKR)" 
            value={refundAmount} 
            onChange={e => setRefundAmount(e.target.value)} 
            placeholder="e.g. 150.00" 
          />

          <Button 
            className="w-full" 
            onClick={doRefund} 
            disabled={refundLoading}
            variant="primary"
          >
            {refundLoading ? 'Processing...' : 'Issue Refund'}
          </Button>

          {refundErr && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {refundErr}
            </div>
          )}
          {refundOk && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              {refundOk}
            </div>
          )}
        </div>
      </Card>

      {/* EOD Report */}
      <Card title="End of Day Report">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="Date" 
              type="date" 
              value={eodDate} 
              onChange={e => setEodDate(e.target.value)} 
            />
            <Input 
              label="Currency" 
              value={eodCurrency} 
              onChange={e => setEodCurrency(e.target.value)} 
            />
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={loadEOD} 
              disabled={eodLoading}
            >
              {eodLoading ? 'Loading...' : 'Generate'}
            </Button>
            <Button 
              className="flex-1" 
              variant="primary"
              onClick={generateEODPDF}
              disabled={!eod || eodLoading}
            >
              Download PDF
            </Button>
          </div>

          {eodErr && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {eodErr}
            </div>
          )}

          {!eod ? (
            <EmptyState 
              title="No report generated" 
              hint="Select date and generate report to view details." 
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[var(--color-tropical-teal-50)] border border-[var(--color-tropical-teal-300)] p-5 text-sm space-y-3">
                <div className="text-center font-bold text-[var(--color-tropical-teal-800)] text-lg">
                  EOD - {eod.date}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>Orders Closed</div>
                  <b className="text-right">{eod.ordersClosed}</b>
                  <div>Net Revenue</div>
                  <b className="text-right">{eod.revenueNet}</b>
                  <div>Tax Total</div>
                  <b className="text-right">{eod.taxTotal}</b>
                  <div>Gross Revenue</div>
                  <b className="text-right">{eod.revenueGross || '0.00'}</b>
                </div>

                <div className="border-t pt-3">
                  <div className="font-semibold mb-2 text-[var(--color-tropical-teal-800)]">
                    By Payment Method
                  </div>
                  {(eod.totalsByMethod || []).map(m => (
                    <div key={m.method} className="flex justify-between text-xs py-1">
                      <span>{m.method}</span>
                      <span>
                        Gross {m.gross} • Net <b>{m.net}</b>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}