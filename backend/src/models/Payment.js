const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false, field: 'order_id' },
  method: { type: DataTypes.ENUM('UPI', 'CARD', 'BANK_TRANSFER', 'COD', 'RAZORPAY'), allowNull: false },
  provider: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'MANUAL' },
  providerOrderId: { type: DataTypes.STRING(100), allowNull: true, field: 'provider_order_id' },
  providerPaymentId: { type: DataTypes.STRING(100), allowNull: true, field: 'provider_payment_id' },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'INR' },
  status: { type: DataTypes.ENUM('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED'), allowNull: false, defaultValue: 'PENDING' },
  signature: { type: DataTypes.STRING(200), allowNull: true },
  paidAt: { type: DataTypes.DATE, allowNull: true, field: 'paid_at' },
  metadata: { type: DataTypes.JSON, allowNull: true },
}, { tableName: 'payments', indexes: [{ fields: ['order_id'] }, { fields: ['provider_order_id'] }] });
