const { z } = require('zod');
const { Op } = require('sequelize');
const { Payment, Order } = require('../models');
const { fail } = require('../utils/http');
const { verifyRazorpayPayment } = require('../services/payment.service');
const { audit } = require('../services/audit.service');
const { notifyUser } = require('../services/notification.service');

const razorpaySchema = z.object({ razorpay_order_id: z.string().min(4), razorpay_payment_id: z.string().min(4), razorpay_signature: z.string().min(20) });

async function verifyRazorpay(req, res) {
  const body = razorpaySchema.parse(req.body);
  const result = await verifyRazorpayPayment(req.user, body);
  await audit({ actorId: req.user.id, action: 'payment.razorpay.verify', entityType: 'payment', entityId: result.payment.id, req, metadata: { orderId: result.order.id } });
  res.json({ success: true, data: { payment: result.payment, orderId: result.order.id, paymentStatus: 'PAID' } });
}

async function recordManualPayment(req, res) {
  const body = z.object({ status: z.enum(['PAID', 'FAILED', 'REFUNDED']), reference: z.string().trim().max(120).optional().nullable(), note: z.string().trim().max(500).optional().nullable() }).parse(req.body);
  const order = await Order.findByPk(req.params.orderId);
  if (!order) throw fail(404, 'Order not found.');
  const payment = await Payment.findOne({ where: { orderId: order.id }, order: [['createdAt', 'DESC']] });
  if (!payment) throw fail(404, 'Payment record not found for this order.');
  await payment.update({ status: body.status, providerPaymentId: body.reference || payment.providerPaymentId, paidAt: body.status === 'PAID' ? new Date() : payment.paidAt, metadata: { ...(payment.metadata || {}), note: body.note || null, updatedBy: req.user.id } });
  await order.update({ paymentStatus: body.status });
  if (body.status === 'PAID') await notifyUser(await require('../models').User.findByPk(order.userId), { title: 'Payment received', body: `Payment for ${order.orderNumber} has been recorded.`, type: 'invoice', link: `/orders/${order.id}` });
  await audit({ actorId: req.user.id, action: 'payment.manual.update', entityType: 'payment', entityId: payment.id, req, metadata: { status: body.status, reference: body.reference } });
  res.json({ success: true, data: { payment, orderId: order.id, paymentStatus: body.status } });
}

async function listOrderPayments(req, res) {
  const order = await Order.findByPk(req.params.orderId);
  if (!order) throw fail(404, 'Order not found.');
  if (req.user.role === 'BUYER' && order.userId !== req.user.id) throw fail(403, 'You cannot view this payment.');
  const rows = await Payment.findAll({ where: { orderId: order.id }, order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: rows });
}

module.exports = { verifyRazorpay, recordManualPayment, listOrderPayments };
