const fs = require('node:fs');
const path = require('node:path');
const PDFDocument = require('pdfkit');
const { Order, Invoice, Organization, User, OrderItem, Address } = require('../models');
const { addressToString } = require('./orderFormat.service');

const INVOICE_DIR = path.resolve(__dirname, '../../storage/invoices');
const asMoney = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function safeFileName(value) { return String(value).replace(/[^A-Za-z0-9._-]/g, '_'); }

async function writeInvoicePdf(invoice, order, supplier) {
  await fs.promises.mkdir(INVOICE_DIR, { recursive: true });
  const target = path.join(INVOICE_DIR, `${safeFileName(invoice.invoiceNumber)}.pdf`);
  const doc = new PDFDocument({ size: 'A4', margins: { top: 45, left: 48, right: 48, bottom: 45 }, info: { Title: `Tax invoice ${invoice.invoiceNumber}`, Author: 'Medora Supply Co.' } });
  const stream = fs.createWriteStream(target);
  doc.pipe(stream);
  const left = 48;
  const right = 548;
  doc.rect(0, 0, 595, 125).fill('#115e59');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(23).text('MEDORA', left, 38);
  doc.font('Helvetica').fontSize(8).fillColor('#c4dfd5').text('MEDICAL SUPPLY CO.  ·  CARE, DELIVERED.', left, 67);
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#ffffff').text('TAX INVOICE', 350, 43, { width: 197, align: 'right' });
  doc.font('Helvetica').fontSize(9).fillColor('#d8ebe3').text(invoice.invoiceNumber, 350, 72, { width: 197, align: 'right' });
  doc.fontSize(8).text(`GSTIN ${supplier?.gstin || invoice.supplierGstin || '27AAFCM4821D1Z4'}`, 350, 88, { width: 197, align: 'right' });

  const snapshot = order.shippingAddressJson || {};
  const buyer = order.buyer || {};
  const buyerOrg = buyer.organizationRecord?.name || order.buyerOrg || snapshot.organization || 'Healthcare facility';
  const buyerName = buyer.name || order.buyerName || snapshot.recipient || '';
  doc.fillColor('#36514d').font('Helvetica-Bold').fontSize(8).text('BILL TO', left, 151);
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#284540').text(buyerOrg, left, 169, { width: 220 });
  doc.font('Helvetica').fontSize(9).fillColor('#667c73').text(buyerName, left, 184);
  doc.fontSize(8).text(addressToString(order) || 'Pune, Maharashtra', left, 199, { width: 215, lineGap: 3 });
  doc.fontSize(8).text(`GSTIN ${order.billingGstin || snapshot.gstin || 'Not provided'}`, left, 227);

  doc.font('Helvetica-Bold').fontSize(8).fillColor('#36514d').text('INVOICE DETAILS', 350, 151);
  doc.font('Helvetica').fontSize(9).fillColor('#667c73');
  doc.text(`Invoice date: ${new Date(invoice.issuedAt).toLocaleDateString('en-IN')}`, 350, 169);
  doc.text(`Order reference: ${order.orderNumber}`, 350, 185);
  doc.text(`Payment status: ${order.paymentStatus}`, 350, 201);
  doc.text(`Place of supply: ${invoice.placeOfSupply || 'Maharashtra (27)'}`, 350, 217);

  const tableTop = 265;
  doc.roundedRect(left, tableTop, right - left, 26, 4).fill('#eff5f1');
  doc.fillColor('#60756c').font('Helvetica-Bold').fontSize(8);
  doc.text('ITEM DESCRIPTION', left + 10, tableTop + 9);
  doc.text('QTY', 383, tableTop + 9, { width: 35, align: 'right' });
  doc.text('UNIT PRICE', 419, tableTop + 9, { width: 62, align: 'right' });
  doc.text('AMOUNT', 484, tableTop + 9, { width: 54, align: 'right' });

  let y = tableTop + 40;
  const items = order.items || [];
  for (const item of items) {
    if (y > 690) { doc.addPage(); y = 54; }
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#334e48').text(item.name, left + 10, y, { width: 270, ellipsis: true });
    doc.font('Helvetica').fontSize(7).fillColor('#8a9a93').text(`SKU ${item.sku}  ·  GST ${Number(item.gstRate)}%`, left + 10, y + 14, { width: 270 });
    doc.fontSize(9).fillColor('#4c625b').text(String(item.quantity), 383, y, { width: 35, align: 'right' });
    doc.text(asMoney(item.unitPrice), 419, y, { width: 62, align: 'right' });
    doc.text(asMoney(item.total), 484, y, { width: 54, align: 'right' });
    y += 39;
    doc.moveTo(left, y - 7).lineTo(right, y - 7).strokeColor('#edf1ef').lineWidth(.7).stroke();
  }

  y = Math.max(y + 14, 355);
  const summaryX = 350;
  doc.moveTo(summaryX, y).lineTo(right, y).strokeColor('#e5ece8').lineWidth(1).stroke();
  doc.font('Helvetica').fontSize(9).fillColor('#72847c');
  doc.text('Subtotal', summaryX, y + 12); doc.text(asMoney(order.subtotal), summaryX, y + 12, { width: right - summaryX, align: 'right' });
  doc.text('GST', summaryX, y + 31); doc.text(asMoney(order.tax), summaryX, y + 31, { width: right - summaryX, align: 'right' });
  doc.text('Delivery', summaryX, y + 50); doc.text(Number(order.shippingFee) ? asMoney(order.shippingFee) : 'Complimentary', summaryX, y + 50, { width: right - summaryX, align: 'right' });
  const grandY = y + 77;
  doc.roundedRect(summaryX, grandY, right - summaryX, 35, 5).fill('#115e59');
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff').text('TOTAL DUE', summaryX + 11, grandY + 12);
  doc.text(asMoney(order.total), summaryX + 11, grandY + 12, { width: right - summaryX - 22, align: 'right' });

  const footerY = 741;
  doc.moveTo(left, footerY).lineTo(right, footerY).strokeColor('#e5ece8').lineWidth(.8).stroke();
  doc.font('Helvetica').fontSize(8).fillColor('#7a8c84').text('Thank you for the care you provide. For invoice support, email billing@medora.health.', left, footerY + 12, { width: 490, align: 'center' });
  doc.fontSize(7).fillColor('#9aa8a2').text(`${supplier?.name || 'Medora Supply Co.'}  ·  Pune, Maharashtra  ·  Computer-generated tax invoice`, left, footerY + 28, { width: 500, align: 'center' });

  const written = new Promise((resolve, reject) => { stream.once('finish', resolve); stream.once('error', reject); doc.once('error', reject); });
  doc.end();
  await written;
  return target;
}

async function ensureInvoiceForOrder(orderId) {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: OrderItem, as: 'items' },
      { model: User, as: 'buyer', include: [{ model: Organization, as: 'organizationRecord' }] },
      { model: Address, as: 'shippingAddressRecord' },
      { model: Invoice, as: 'invoice' },
    ],
  });
  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 });
  const supplier = await Organization.findOne({ where: { type: 'SUPPLIER' }, order: [['createdAt', 'ASC']] });
  let invoice = order.invoice;
  if (!invoice) {
    const year = String(new Date().getFullYear()).slice(-2);
    const suffix = order.orderNumber.replace(/^MD-/, '');
    invoice = await Invoice.create({ orderId: order.id, invoiceNumber: `INV-${year}-${suffix}`, supplierGstin: supplier?.gstin || '27AAFCM4821D1Z4', buyerGstin: order.billingGstin, placeOfSupply: `${order.shippingAddressJson?.state || 'Maharashtra'} (27)`, subtotal: order.subtotal, tax: order.tax, total: order.total, issuedAt: new Date() });
  }
  let filePath = invoice.pdfPath;
  if (!filePath || !fs.existsSync(filePath)) {
    filePath = await writeInvoicePdf(invoice, order, supplier);
    await invoice.update({ pdfPath: filePath });
  }
  order.invoice = invoice;
  return { invoice, order, filePath };
}

module.exports = { ensureInvoiceForOrder, writeInvoicePdf, INVOICE_DIR };
