const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Category', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(500), allowNull: true },
  icon: { type: DataTypes.STRING(50), allowNull: true },
  imageUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'image_url' },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' },
}, { tableName: 'categories' });
