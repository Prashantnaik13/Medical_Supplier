const { Op, fn, col, literal } = require('sequelize');
const { Order, Product, ServiceBooking, User, sequelize } = require('../models');

async function summary(req, res) {
  const where = {};
  if (req.user.role === 'BUYER') where.userId = req.user.id;
  if (req.user.role === 'FULFILLMENT') where.assignedToId = req.user.id;
  const [orderCount, pendingCount, salesRow, lowStockCount, bookingsCount, byStatus] = await Promise.all([
    Order.count({ where }),
    Order.count({ where: { ...where, status: { [Op.notIn]: ['DELIVERED', 'CANCELLED'] } } }),
    Order.findOne({ where, attributes: [[fn('COALESCE', fn('SUM', col('total')), 0), 'sales']], raw: true }),
    req.user.role === 'BUYER' ? Promise.resolve(0) : Product.count({ where: { isActive: true, stock: { [Op.lte]: col('reorder_level') } } }),
    ServiceBooking.count({ where: req.user.role === 'BUYER' ? { userId: req.user.id, status: { [Op.in]: ['REQUESTED', 'CONFIRMED', 'TECHNICIAN_ASSIGNED'] } } : { status: { [Op.in]: ['REQUESTED', 'CONFIRMED', 'TECHNICIAN_ASSIGNED'] } } }),
    Order.findAll({ where, attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
  ]);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthOrders = await Order.findAll({ where: { ...where, createdAt: { [Op.gte]: monthStart } }, attributes: ['id', 'total', 'createdAt'], raw: true });
  const monthlyTotal = monthOrders.reduce((sum, row) => sum + Number(row.total || 0), 0);
  res.json({ success: true, data: { orderCount, pendingCount, grossSales: Number(salesRow?.sales || 0), monthlyTotal, lowStockCount, bookingsCount, byStatus } });
}

module.exports = { summary };
