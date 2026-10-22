const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('ServiceBooking', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  bookingNumber: { type: DataTypes.STRING(30), allowNull: false, unique: true, field: 'booking_number' },
  serviceId: { type: DataTypes.UUID, allowNull: false, field: 'service_id' },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  assignedToId: { type: DataTypes.UUID, allowNull: true, field: 'assigned_to_id' },
  status: { type: DataTypes.ENUM('REQUESTED', 'CONFIRMED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'), allowNull: false, defaultValue: 'REQUESTED' },
  preferredDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'preferred_date' },
  preferredTime: { type: DataTypes.STRING(60), allowNull: false, field: 'preferred_time' },
  addressId: { type: DataTypes.UUID, allowNull: true, field: 'address_id' },
  addressSnapshot: { type: DataTypes.JSON, allowNull: true, field: 'address_snapshot' },
  equipmentModel: { type: DataTypes.STRING(160), allowNull: true, field: 'equipment_model' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  quotedPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true, field: 'quoted_price' },
  technicianName: { type: DataTypes.STRING(120), allowNull: true, field: 'technician_name' },
  completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
}, { tableName: 'service_bookings', indexes: [{ fields: ['user_id', 'preferred_date'] }, { fields: ['status'] }, { fields: ['assigned_to_id'] }] });
