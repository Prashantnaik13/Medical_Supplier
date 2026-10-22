import { jsPDF } from 'jspdf';

const money = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateLabel = (value) => new Date(value || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export function downloadInvoicePdf(order, buyer = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 18;
  const invoiceYear = String(new Date(order.createdAt || Date.now()).getFullYear()).slice(-2);
  const orderReference = String(order.orderNumber || '000000').replace(/^MD-/, '');
  const invoiceNo = order.invoiceNumber || `INV-${invoiceYear}-${orderReference}`;
  const lines = order.items || [];

  doc.setFillColor(17, 94, 89);
  doc.rect(0, 0, pageWidth, 49, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.text('MEDORA', margin, 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('MEDICAL SUPPLY CO.  ·  CARE, DELIVERED.', margin, 30);
  doc.setFontSize(19);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 192, 22, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(invoiceNo, 192, 30, { align: 'right' });
  doc.text('GSTIN 27AAFCM4821D1Z4', 192, 37, { align: 'right' });

  doc.setTextColor(33, 54, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BILL TO', margin, 62);
  doc.text('INVOICE DETAILS', 123, 62);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(String(order.buyerOrg || buyer.organization || 'Healthcare facility'), margin, 70);
  doc.text(String(order.buyerName || buyer.name || ''), margin, 76);
  const address = String(order.shippingAddress || 'Pune, Maharashtra');
  doc.text(doc.splitTextToSize(address, 78), margin, 83);
  doc.setFontSize(9);
  doc.text(`Invoice date: ${dateLabel(order.createdAt)}`, 123, 70);
  doc.text(`Order reference: ${order.orderNumber || '—'}`, 123, 77);
  doc.text(`Payment: ${String(order.paymentStatus || 'Pending').replaceAll('_', ' ')}`, 123, 84);
  doc.text(`Place of supply: Maharashtra (27)`, 123, 91);

  const tableY = 108;
  doc.setFillColor(240, 246, 244);
  doc.roundedRect(margin, tableY, 174, 11, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(61, 83, 85);
  doc.text('ITEM DESCRIPTION', margin + 4, tableY + 7);
  doc.text('QTY', 125, tableY + 7, { align: 'right' });
  doc.text('UNIT PRICE', 151, tableY + 7, { align: 'right' });
  doc.text('AMOUNT', 188, tableY + 7, { align: 'right' });

  let y = tableY + 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  lines.forEach((item, index) => {
    if (y > 235) {
      doc.addPage();
      y = 24;
    }
    doc.setTextColor(32, 54, 58);
    doc.setFont('helvetica', 'bold');
    doc.text(String(item.name || item.productName || 'Medical supply'), margin + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(117, 137, 137);
    doc.text(String(item.sku || 'SKU'), margin + 4, y + 5);
    doc.setFontSize(9);
    doc.setTextColor(42, 64, 66);
    const quantity = Number(item.quantity || 1);
    const unitPrice = Number(item.unitPrice || item.price || 0);
    const amount = Number(item.total || quantity * unitPrice);
    doc.text(String(quantity), 125, y, { align: 'right' });
    doc.text(money(unitPrice), 151, y, { align: 'right' });
    doc.text(money(amount), 188, y, { align: 'right' });
    y += 15;
    if (index < lines.length - 1) {
      doc.setDrawColor(232, 239, 237);
      doc.line(margin, y - 4, 192, y - 4);
    }
  });

  y = Math.max(y + 6, 164);
  doc.setDrawColor(226, 235, 232);
  doc.line(116, y, 192, y);
  const subtotal = Number(order.subtotal ?? lines.reduce((sum, item) => sum + Number(item.total || 0), 0));
  const tax = Number(order.tax || 0);
  const shipping = Number(order.shippingFee || order.shipping || 0);
  const total = Number(order.total || subtotal + tax + shipping);
  const summary = [
    ['Subtotal', money(subtotal)],
    ['GST', money(tax)],
    ['Delivery', shipping === 0 ? 'Complimentary' : money(shipping)],
  ];
  doc.setFontSize(9);
  doc.setTextColor(88, 108, 108);
  summary.forEach((row, index) => {
    const rowY = y + 9 + index * 7;
    doc.text(row[0], 121, rowY);
    doc.text(row[1], 188, rowY, { align: 'right' });
  });
  const totalY = y + 35;
  doc.setFillColor(17, 94, 89);
  doc.roundedRect(116, totalY - 6, 76, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL DUE', 121, totalY + 4);
  doc.text(money(total), 188, totalY + 4, { align: 'right' });

  doc.setTextColor(103, 123, 122);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for the care you provide. For invoice support, contact billing@medora.health.', margin, 267);
  doc.setDrawColor(226, 235, 232);
  doc.line(margin, 273, 192, 273);
  doc.setFontSize(7);
  doc.text('Medora Supply Co.  ·  Pune, Maharashtra  ·  GST compliant invoice', margin, 280);
  doc.save(`${invoiceNo}.pdf`);
}
