const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Service', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(140), allowNull: false },
  slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  category: { type: DataTypes.STRING(60), allowNull: false },
  basePrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'base_price' },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60, field: 'duration_minutes' },
  responseSla: { type: DataTypes.STRING(80), allowNull: true, field: 'response_sla' },
  icon: { type: DataTypes.STRING(50), allowNull: true },
  color: { type: DataTypes.STRING(30), allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
}, { tableName: 'services' });
