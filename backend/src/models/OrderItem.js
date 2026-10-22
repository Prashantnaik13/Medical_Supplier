const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false, field: 'order_id' },
  productId: { type: DataTypes.UUID, allowNull: true, field: 'product_id' },
  sku: { type: DataTypes.STRING(60), allowNull: false },
  name: { type: DataTypes.STRING(180), allowNull: false },
  quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'unit_price' },
  gstRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'gst_rate' },
  taxAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'tax_amount' },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, { tableName: 'order_items', indexes: [{ fields: ['order_id'] }, { fields: ['product_id'] }] });
