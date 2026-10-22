const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Address', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  organizationId: { type: DataTypes.UUID, allowNull: true, field: 'organization_id' },
  label: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'Main facility' },
  recipient: { type: DataTypes.STRING(120), allowNull: true },
  organization: { type: DataTypes.STRING(160), allowNull: true },
  line1: { type: DataTypes.STRING(180), allowNull: false },
  line2: { type: DataTypes.STRING(180), allowNull: true },
  city: { type: DataTypes.STRING(80), allowNull: false },
  state: { type: DataTypes.STRING(80), allowNull: false },
  pincode: { type: DataTypes.STRING(10), allowNull: false },
  gstin: { type: DataTypes.STRING(15), allowNull: true },
  latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_default' },
  addressType: { type: DataTypes.ENUM('BILLING', 'SHIPPING', 'BOTH'), allowNull: false, defaultValue: 'BOTH', field: 'address_type' },
}, { tableName: 'addresses', indexes: [{ fields: ['user_id'] }, { fields: ['organization_id'] }] });
