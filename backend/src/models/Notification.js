const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  title: { type: DataTypes.STRING(160), allowNull: false },
  body: { type: DataTypes.STRING(800), allowNull: false },
  type: { type: DataTypes.ENUM('order', 'delivery', 'inventory', 'service', 'invoice', 'system'), allowNull: false, defaultValue: 'system' },
  link: { type: DataTypes.STRING(300), allowNull: true },
  readAt: { type: DataTypes.DATE, allowNull: true, field: 'read_at' },
  metadata: { type: DataTypes.JSON, allowNull: true },
}, { tableName: 'notifications', indexes: [{ fields: ['user_id', 'read_at'] }, { fields: ['created_at'] }] });
