const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  actorId: { type: DataTypes.UUID, allowNull: true, field: 'actor_id' },
  action: { type: DataTypes.STRING(120), allowNull: false },
  entityType: { type: DataTypes.STRING(80), allowNull: false, field: 'entity_type' },
  entityId: { type: DataTypes.STRING(80), allowNull: true, field: 'entity_id' },
  ipAddress: { type: DataTypes.STRING(45), allowNull: true, field: 'ip_address' },
  userAgent: { type: DataTypes.STRING(500), allowNull: true, field: 'user_agent' },
  metadata: { type: DataTypes.JSON, allowNull: true },
}, { tableName: 'audit_logs', indexes: [{ fields: ['actor_id', 'created_at'] }, { fields: ['entity_type', 'entity_id'] }] });
