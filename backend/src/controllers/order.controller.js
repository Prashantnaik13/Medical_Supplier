const { Op } = require('sequelize');
const { z } = require('zod');
const { randomBytes } = require('node:crypto');
const { sequelize, Product, Order, OrderItem, User, Organization, Address, Invoice, Delivery, Payment } = require('../models');
const { fail } = require('../utils/http');
const { serializeOrder } = require('../services/orderFormat.service');
const { createPaymentForOrder } = require('../services/payment.service');
const { ensureInvoiceForOrder } = require('../services/invoicePdf.service');
const { notifyOrderPlaced, notifyOrderStatus } = require('../services/notification.service');
const { audit } = require('../services/audit.service');

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.coerce.number().int().min(1).max(1000) })).min(1).max(50),
  paymentMethod: z.enum(['UPI', 'CARD', 'BANK_TRANSFER', 'COD', 'RAZORPAY']).default('COD'),
  shippingAddress: z.object({
    recipient: z.string().trim().min(2).max(120), organization: z.string().trim().min(2).max(160),
    line1: z.string().trim().min(4).max(180), line2: z.string().trim().max(180).optional().nullable(),
    city: z.string().trim().min(2).max(80), state: z.string().trim().min(2).max(80),
    pincode: z.string().trim().min(4).max(10), gstin: z.string().trim().max(15).optional().nullable(),
  }), notes: z.string().max(2000).optional().nullable(),
});
const statusSchema = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'PICKING', 'PACKED', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']) });

const orderIncludes = [
  { model: OrderItem, as: 'items' },
  { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'gstin', 'organizationId'], include: [{ model: Organization, as: 'organizationRecord', attributes: ['id', 'name', 'gstin'] }] },
  { model: Address, as: 'shippingAddressRecord' },
  { model: Invoice, as: 'invoice' },
  { model: Delivery, as: 'delivery' },
  { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'phone'] },
];

function makeOrderNumber() {
  const year = String(new Date().getFullYear()).slice(-2);
  const suffix = String(randomBytes(4).readUInt32BE(0) % 1000000).padStart(6, '0');
  return `MD-${year}${suffix}`;
}
function round2(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }

async function listOrders(req, res) {
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
  const where = {};
  if (req.user.role === 'BUYER') where.userId = req.user.id;
  if (req.user.role === 'FULFILLMENT') where[Op.or] = [{ assignedToId: req.user.id }, { status: { [Op.in]: ['PACKED', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY'] } }];
  if (req.query.status) where.status = req.query.status;
  if (req.query.from || req.query.to) where.createdAt = { ...(req.query.from ? { [Op.gte]: new Date(req.query.from) } : {}), ...(req.query.to ? { [Op.lte]: new Date(req.query.to) } : {}) };
  const { count, rows } = await Order.findAndCountAll({ where, include: orderIncludes, order: [['createdAt', 'DESC']], limit: pageSize, offset: (page - 1) * pageSize, distinct: true });
  res.json({ success: true, data: { rows: rows.map(serializeOrder), page, pageSize, total: count } });
}

async function getOrder(req, res) {
  const order = await Order.findByPk(req.params.id, { include: orderIncludes });
  if (!order) throw fail(404, 'Order not found.');
  if (req.user.role === 'BUYER' && order.userId !== req.user.id) throw fail(403, 'You cannot view this order.');
  if (req.user.role === 'FULFILLMENT' && order.assignedToId && order.assignedToId !== req.user.id) throw fail(403, 'This order is assigned to another delivery team member.');
  res.json({ success: true, data: serializeOrder(order) });
}

async function createOrder(req, res) {
  const body = createOrderSchema.parse(req.body);
  const order = await sequelize.transaction(async (transaction) => {
    const ids = [...new Set(body.items.map((item) => item.productId))];
    const products = await Product.findAll({ where: { id: ids, isActive: true }, transaction, lock: transaction.LOCK.UPDATE });
    const productById = new Map(products.map((product) => [product.id, product]));
    if (products.length !== ids.length) throw fail(422, 'One or more products are no longer available. Refresh the catalog and try again.');
    const lines = body.items.map((requestLine) => {
      const product = productById.get(requestLine.productId);
      if (!product) throw fail(422, 'Product not found.');
      if (Number(product.stock) < requestLine.quantity) throw fail(409, `${product.name} has only ${product.stock} units available.`);
      const unitPrice = Number(product.price);
      const lineSubtotal = round2(unitPrice * requestLine.quantity);
      const taxAmount = round2(lineSubtotal * Number(product.gstRate) / 100);
      return { product, quantity: requestLine.quantity, unitPrice, gstRate: Number(product.gstRate), lineSubtotal, taxAmount, total: lineSubtotal };
    });
    const subtotal = round2(lines.reduce((sum, line) => sum + line.lineSubtotal, 0));
    const tax = round2(lines.reduce((sum, line) => sum + line.taxAmount, 0));
    const shippingFee = subtotal >= 5000 ? 0 : 100;
    const total = round2(subtotal + tax + shippingFee);
    const buyer = await User.findByPk(req.user.id, { include: [{ model: Organization, as: 'organizationRecord' }], transaction });
    const address = await Address.create({
      userId: req.user.id, organizationId: buyer.organizationId, label: 'Checkout delivery', recipient: body.shippingAddress.recipient,
      organization: body.shippingAddress.organization, line1: body.shippingAddress.line1, line2: body.shippingAddress.line2 || null,
      city: body.shippingAddress.city, state: body.shippingAddress.state, pincode: body.shippingAddress.pincode,
      gstin: body.shippingAddress.gstin || null, isDefault: false, addressType: 'SHIPPING',
    }, { transaction });
    const order = await Order.create({
      orderNumber: makeOrderNumber(), userId: req.user.id, shippingAddressId: address.id, buyerName: body.shippingAddress.recipient,
      buyerOrg: body.shippingAddress.organization, billingGstin: body.shippingAddress.gstin || buyer.gstin || null,
      shippingAddressJson: body.shippingAddress, status: 'CONFIRMED', paymentStatus: 'PENDING', paymentMethod: body.paymentMethod,
      subtotal, tax, shippingFee, total, expectedDelivery: 'Within 24–48 hours', notes: body.notes || null, placedAt: new Date(),
    }, { transaction });
    await OrderItem.bulkCreate(lines.map((line) => ({ orderId: order.id, productId: line.product.id, sku: line.product.sku, name: line.product.name, quantity: line.quantity, unitPrice: line.unitPrice, gstRate: line.gstRate, taxAmount: line.taxAmount, total: line.total })), { transaction });
    for (const line of lines) await line.product.update({ stock: Number(line.product.stock) - line.quantity }, { transaction });
    await Delivery.create({ orderId: order.id, trackingCode: `MDT-${randomBytes(4).toString('hex').toUpperCase()}`, status: 'QUEUED', routeJson: { serviceArea: body.shippingAddress.city } }, { transaction });
    return order;
  });

  let checkout = null;
  try {
    const paymentResult = await createPaymentForOrder(order);
    checkout = paymentResult.checkout;
  } catch (error) {
    console.error('[payment:create]', error.message);
    await Payment.create({ orderId: order.id, method: body.paymentMethod, provider: 'MANUAL', amount: order.total, currency: 'INR', status: 'PENDING', metadata: { note: 'Payment service is temporarily unavailable.' } }).catch(() => {});
  }

  let invoicePath = null;
  try { const createdInvoice = await ensureInvoiceForOrder(order.id); invoicePath = createdInvoice.filePath; }
  catch (error) { console.error('[invoice:generate]', error.message); }
  const fullOrder = await Order.findByPk(order.id, { include: orderIncludes });
  try { await notifyOrderPlaced(fullOrder, invoicePath); }
  catch (error) { console.error('[notification:order]', error.message); }
  await audit({ actorId: req.user.id, action: 'order.create', entityType: 'order', entityId: order.id, req, metadata: { orderNumber: order.orderNumber, total: order.total } });
  res.status(201).json({ success: true, data: serializeOrder(fullOrder), ...(checkout ? { checkout } : {}) });
}

function validTransition(from, to) {
  const allowed = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['PICKING', 'CANCELLED'],
    PICKING: ['PACKED', 'CANCELLED'],
    PACKED: ['READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'CANCELLED'],
    READY_FOR_DISPATCH: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED'],
    DELIVERED: [], CANCELLED: [],
  };
  return from === to || (allowed[from] || []).includes(to);
}

async function updateOrderStatus(req, res) {
  const { status } = statusSchema.parse(req.body);
  const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'items' }, { model: Delivery, as: 'delivery' }, { model: User, as: 'buyer' }] });
  if (!order) throw fail(404, 'Order not found.');
  if (req.user.role === 'FULFILLMENT') {
    if (order.assignedToId && order.assignedToId !== req.user.id) throw fail(403, 'This order is assigned to another team member.');
    const allowed = (order.status === 'PACKED' || order.status === 'READY_FOR_DISPATCH') && status === 'OUT_FOR_DELIVERY' || order.status === 'OUT_FOR_DELIVERY' && status === 'DELIVERED';
    if (!allowed) throw fail(422, `Delivery staff cannot change ${order.status} to ${status}.`);
  } else if (!validTransition(order.status, status)) {
    throw fail(422, `Order cannot move from ${order.status} to ${status}.`);
  }
  if (order.status === status) return res.json({ success: true, data: serializeOrder(order) });

  await sequelize.transaction(async (transaction) => {
    if (status === 'CANCELLED') {
      const lines = await OrderItem.findAll({ where: { orderId: order.id }, transaction });
      for (const line of lines) if (line.productId) await Product.increment('stock', { by: Number(line.quantity), where: { id: line.productId }, transaction });
      await order.update({ status, cancelledAt: new Date() }, { transaction });
    } else {
      await order.update({ status, ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}) }, { transaction });
    }
    if (order.delivery) {
      const deliveryStatus = status === 'PACKED' ? 'PACKED' : status === 'OUT_FOR_DELIVERY' ? 'OUT_FOR_DELIVERY' : status === 'DELIVERED' ? 'DELIVERED' : status === 'CANCELLED' ? 'FAILED' : null;
      if (deliveryStatus) await order.delivery.update({ status: deliveryStatus, ...(status === 'OUT_FOR_DELIVERY' ? { dispatchedAt: new Date() } : {}), ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}) }, { transaction });
    }
  });
  const updated = await Order.findByPk(order.id, { include: orderIncludes });
  await notifyOrderStatus(updated, status).catch((error) => console.error('[notification:status]', error.message));
  await audit({ actorId: req.user.id, action: 'order.status.update', entityType: 'order', entityId: order.id, req, metadata: { from: order.status, to: status } });
  res.json({ success: true, data: serializeOrder(updated) });
}

async function assignOrder(req, res) {
  const body = z.object({ userId: z.string().uuid() }).parse(req.body);
  const [order, assignee] = await Promise.all([Order.findByPk(req.params.id), User.findByPk(body.userId)]);
  if (!order) throw fail(404, 'Order not found.');
  if (!assignee || assignee.role !== 'FULFILLMENT' || !assignee.isActive) throw fail(422, 'Choose an active delivery team member.');
  await order.update({ assignedToId: assignee.id });
  await Delivery.update({ assignedToId: assignee.id }, { where: { orderId: order.id } });
  await audit({ actorId: req.user.id, action: 'order.assign', entityType: 'order', entityId: order.id, req, metadata: { assignedToId: assignee.id } });
  res.json({ success: true, data: serializeOrder(await Order.findByPk(order.id, { include: orderIncludes })) });
}

async function cancelOwnOrder(req, res) {
  const order = await Order.findByPk(req.params.id);
  if (!order || order.userId !== req.user.id) throw fail(404, 'Order not found.');
  if (!['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)) throw fail(409, 'This order can no longer be cancelled online. Contact the care team for help.');
  const previousStatus = order.status;
  await sequelize.transaction(async (transaction) => {
    const locked = await Order.findByPk(order.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!locked || locked.userId !== req.user.id) throw fail(404, 'Order not found.');
    if (!['PENDING', 'CONFIRMED', 'PROCESSING'].includes(locked.status)) throw fail(409, 'This order can no longer be cancelled online.');
    const lines = await OrderItem.findAll({ where: { orderId: locked.id }, transaction });
    for (const line of lines) if (line.productId) await Product.increment('stock', { by: Number(line.quantity), where: { id: line.productId }, transaction });
    await locked.update({ status: 'CANCELLED', cancelledAt: new Date() }, { transaction });
    await Delivery.update({ status: 'FAILED' }, { where: { orderId: locked.id }, transaction });
  });
  const updated = await Order.findByPk(order.id, { include: orderIncludes });
  await notifyOrderStatus(updated, 'CANCELLED').catch((error) => console.error('[notification:cancel]', error.message));
  await audit({ actorId: req.user.id, action: 'order.cancel', entityType: 'order', entityId: order.id, req, metadata: { from: previousStatus, to: 'CANCELLED' } });
  res.json({ success: true, data: serializeOrder(updated) });
}

module.exports = { listOrders, getOrder, createOrder, updateOrderStatus, assignOrder, cancelOwnOrder, validTransition, createOrderSchema };
