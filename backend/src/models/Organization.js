const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Organization', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  type: { type: DataTypes.ENUM('SUPPLIER', 'BUYER'), allowNull: false, defaultValue: 'BUYER' },
  facilityType: { type: DataTypes.STRING(80), allowNull: true, field: 'facility_type' },
  gstin: { type: DataTypes.STRING(15), allowNull: true },
  email: { type: DataTypes.STRING(190), allowNull: true },
  phone: { type: DataTypes.STRING(25), allowNull: true },
  address: { type: DataTypes.STRING(300), allowNull: true },
  city: { type: DataTypes.STRING(80), allowNull: true },
  state: { type: DataTypes.STRING(80), allowNull: true },
  pincode: { type: DataTypes.STRING(10), allowNull: true },
  latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  preferences: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
}, { tableName: 'organizations' });
