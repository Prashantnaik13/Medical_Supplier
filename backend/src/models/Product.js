const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  categoryId: { type: DataTypes.UUID, allowNull: true, field: 'category_id' },
  sku: { type: DataTypes.STRING(60), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(180), allowNull: false },
  brand: { type: DataTypes.STRING(120), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  unit: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'piece' },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  mrp: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  gstRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 12, field: 'gst_rate' },
  stock: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  reorderLevel: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 10, field: 'reorder_level' },
  expiryDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'expiry_date' },
  batchNumber: { type: DataTypes.STRING(80), allowNull: true, field: 'batch_number' },
  imageUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'image_url' },
  art: { type: DataTypes.STRING(50), allowNull: true },
  badge: { type: DataTypes.STRING(60), allowNull: true },
  isFeatured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_featured' },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
}, { tableName: 'products', indexes: [{ fields: ['category_id'] }, { fields: ['is_active', 'is_featured'] }, { fields: ['expiry_date'] }] });
