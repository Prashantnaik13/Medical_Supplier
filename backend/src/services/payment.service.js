const crypto = require('node:crypto');
const Razorpay = require('razorpay');
const { Payment, Order, User, sequelize } = require('../models');
const { fail } = require('../utils/http');
const { notifyUser } = require('./notification.service');

let razorpayClient;
function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  if (!razorpayClient) razorpayClient = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  return razorpayClient;
}

async function createPaymentForOrder(order) {
  const method = order.paymentMethod || 'COD';
  const razorpay = ['UPI', 'CARD', 'RAZORPAY'].includes(method) ? getRazorpayClient() : null;
  if (razorpay) {
    const providerOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.total) * 100), currency: 'INR', receipt: order.orderNumber,
      notes: { medoraOrderId: order.id, orderNumber: order.orderNumber },
    });
    const payment = await Payment.create({ orderId: order.id, method, provider: 'RAZORPAY', providerOrderId: providerOrder.id, amount: order.total, currency: 'INR', status: 'PENDING', metadata: { receipt: order.orderNumber } });
    return { payment, checkout: { keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: providerOrder.id, amount: providerOrder.amount, currency: providerOrder.currency, paymentId: payment.id, orderNumber: order.orderNumber } };
  }
  const payment = await Payment.create({ orderId: order.id, method, provider: method === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'MANUAL', amount: order.total, currency: 'INR', status: 'PENDING', metadata: { note: 'Payment confirmation is recorded by the finance workflow.' } });
  return { payment, checkout: null };
}

async function verifyRazorpayPayment(user, payload) {
  const { razorpay_order_id: providerOrderId, razorpay_payment_id: providerPaymentId, razorpay_signature: signature } = payload;
  if (!providerOrderId || !providerPaymentId || !signature) throw fail(422, 'Payment verification details are incomplete.');
  if (!/^[a-f0-9]{64}$/i.test(signature)) throw fail(400, 'Payment signature could not be verified.');
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${providerOrderId}|${providerPaymentId}`).digest();
  const provided = Buffer.from(signature, 'hex');
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) throw fail(400, 'Payment signature could not be verified.');

  return sequelize.transaction(async (transaction) => {
    const payment = await Payment.findOne({ where: { providerOrderId }, include: [{ model: Order, as: 'order' }], transaction, lock: transaction.LOCK.UPDATE });
    if (!payment) throw fail(404, 'Payment session not found.');
    if (payment.order.userId !== user.id && !['ADMIN', 'SUPPLIER'].includes(user.role)) throw fail(403, 'You cannot update this payment.');
    if (payment.status === 'PAID') return { payment, order: payment.order };
    await payment.update({ status: 'PAID', providerPaymentId, signature, paidAt: new Date() }, { transaction });
    await payment.order.update({ paymentStatus: 'PAID' }, { transaction });
    const buyer = await User.findByPk(payment.order.userId, { attributes: ['id', 'name', 'email'], transaction });
    transaction.afterCommit(async () => {
      if (buyer) await notifyUser(buyer, { title: 'Payment received', body: `Payment for ${payment.order.orderNumber} was successfully recorded.`, type: 'invoice', link: `/orders/${payment.order.id}` });
    });
    return { payment, order: payment.order };
  });
}

module.exports = { createPaymentForOrder, verifyRazorpayPayment, getRazorpayClient };
