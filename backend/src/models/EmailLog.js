const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('EmailLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  to: { type: DataTypes.STRING(500), allowNull: false },
  subject: { type: DataTypes.STRING(250), allowNull: false },
  template: { type: DataTypes.STRING(80), allowNull: true },
  status: { type: DataTypes.ENUM('QUEUED', 'SENT', 'SIMULATED', 'FAILED'), allowNull: false, defaultValue: 'QUEUED' },
  providerMessageId: { type: DataTypes.STRING(200), allowNull: true, field: 'provider_message_id' },
  errorMessage: { type: DataTypes.TEXT, allowNull: true, field: 'error_message' },
  metadata: { type: DataTypes.JSON, allowNull: true },
}, { tableName: 'email_logs', indexes: [{ fields: ['status', 'created_at'] }] });
