const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  organizationId: { type: DataTypes.UUID, allowNull: true, field: 'organization_id' },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(190), allowNull: false, unique: true, set(value) { this.setDataValue('email', value?.trim().toLowerCase()); } },
  passwordHash: { type: DataTypes.STRING(100), allowNull: true, field: 'password_hash' },
  role: { type: DataTypes.ENUM('ADMIN', 'SUPPLIER', 'BUYER', 'FULFILLMENT'), allowNull: false, defaultValue: 'BUYER' },
  phone: { type: DataTypes.STRING(25), allowNull: true },
  gstin: { type: DataTypes.STRING(15), allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
  invitationToken: { type: DataTypes.STRING(80), allowNull: true, unique: true, field: 'invitation_token' },
  invitationExpiresAt: { type: DataTypes.DATE, allowNull: true, field: 'invitation_expires_at' },
  lastLoginAt: { type: DataTypes.DATE, allowNull: true, field: 'last_login_at' },
}, {
  tableName: 'users',
  indexes: [{ fields: ['role'] }, { fields: ['organization_id'] }],
});
