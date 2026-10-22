const { Order, User, Organization } = require('../models');
const { Op } = require('sequelize');
const { fail } = require('../utils/http');

function csv(value) { const text = String(value ?? ''); return `"${text.replaceAll('"', '""')}"`; }

async function salesCsv(req, res) {
  const where = {};
  if (req.query.from || req.query.to) where.createdAt = { ...(req.query.from ? { [Op.gte]: new Date(req.query.from) } : {}), ...(req.query.to ? { [Op.lte]: new Date(req.query.to) } : {}) };
  const orders = await Order.findAll({ where, include: [{ model: User, as: 'buyer', attributes: ['name'], include: [{ model: Organization, as: 'organizationRecord', attributes: ['name', 'gstin'] }] }], order: [['createdAt', 'DESC']], limit: 10000 });
  const lines = [['order_number', 'created_at', 'facility', 'buyer', 'subtotal_inr', 'gst_inr', 'delivery_inr', 'total_inr', 'order_status', 'payment_status', 'payment_method'].join(',')];
  for (const order of orders) {
    lines.push([order.orderNumber, order.createdAt?.toISOString(), order.buyer?.organizationRecord?.name || order.buyerOrg, order.buyer?.name || order.buyerName, order.subtotal, order.tax, order.shippingFee, order.total, order.status, order.paymentStatus, order.paymentMethod].map(csv).join(','));
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="medora-sales-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(`\uFEFF${lines.join('\n')}`);
}

async function emailHealth(req, res) {
  const { deliveryHealth } = require('../services/emailQueue.service');
  res.json({ success: true, data: { smtpConfigured: Boolean(process.env.SMTP_HOST), logs: await deliveryHealth() } });
}

module.exports = { salesCsv, emailHealth };
