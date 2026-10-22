const { Order, Invoice, OrderItem, User, Organization } = require('../models');
const { fail } = require('../utils/http');
const { ensureInvoiceForOrder } = require('../services/invoicePdf.service');
const { Op } = require('sequelize');

async function listInvoices(req, res) {
  const where = req.user.role === 'BUYER' ? { userId: req.user.id } : {};
  const orders = await Order.findAll({ where, include: [
    { model: OrderItem, as: 'items' }, { model: Invoice, as: 'invoice' },
    { model: User, as: 'buyer', attributes: ['id', 'name', 'organizationId'], include: [{ model: Organization, as: 'organizationRecord', attributes: ['name', 'gstin'] }] },
  ], order: [['createdAt', 'DESC']], limit: 200 });
  const data = [];
  for (const order of orders) {
    let invoice = order.invoice;
    if (!invoice) {
      try { ({ invoice } = await ensureInvoiceForOrder(order.id)); }
      catch (error) { console.error('[invoice:list]', error.message); }
    }
    data.push({
      id: order.id, orderId: order.id, orderNumber: order.orderNumber, invoiceNumber: invoice?.invoiceNumber || null,
      buyerName: order.buyer?.name || order.buyerName, buyerOrg: order.buyer?.organizationRecord?.name || order.buyerOrg,
      subtotal: Number(order.subtotal), tax: Number(order.tax), total: Number(order.total), paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod, createdAt: order.createdAt, issuedAt: invoice?.issuedAt || order.createdAt,
      buyerGstin: invoice?.buyerGstin || order.billingGstin || null, supplierGstin: invoice?.supplierGstin || null,
    });
  }
  res.json({ success: true, data: { rows: data, total: data.length } });
}

async function downloadInvoice(req, res) {
  const order = await Order.findByPk(req.params.orderId);
  if (!order) throw fail(404, 'Invoice not found.');
  if (req.user.role === 'BUYER' && order.userId !== req.user.id) throw fail(403, 'You cannot access this invoice.');
  if (req.user.role === 'FULFILLMENT') throw fail(403, 'Delivery staff cannot access invoices.');
  const { invoice, filePath } = await ensureInvoiceForOrder(order.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.sendFile(filePath);
}

async function getInvoice(req, res) {
  const { invoice, order } = await ensureInvoiceForOrder(req.params.orderId);
  if (req.user.role === 'BUYER' && order.userId !== req.user.id) throw fail(403, 'You cannot access this invoice.');
  res.json({ success: true, data: { ...invoice.get({ plain: true }), orderNumber: order.orderNumber } });
}

module.exports = { listInvoices, downloadInvoice, getInvoice };
