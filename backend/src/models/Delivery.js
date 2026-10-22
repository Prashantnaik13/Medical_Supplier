const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Delivery', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'order_id' },
  assignedToId: { type: DataTypes.UUID, allowNull: true, field: 'assigned_to_id' },
  trackingCode: { type: DataTypes.STRING(40), allowNull: false, unique: true, field: 'tracking_code' },
  status: { type: DataTypes.ENUM('QUEUED', 'PICKING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'), allowNull: false, defaultValue: 'QUEUED' },
  estimatedDeliveryAt: { type: DataTypes.DATE, allowNull: true, field: 'estimated_delivery_at' },
  pickedAt: { type: DataTypes.DATE, allowNull: true, field: 'picked_at' },
  dispatchedAt: { type: DataTypes.DATE, allowNull: true, field: 'dispatched_at' },
  deliveredAt: { type: DataTypes.DATE, allowNull: true, field: 'delivered_at' },
  proofUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'proof_url' },
  vehicleNumber: { type: DataTypes.STRING(30), allowNull: true, field: 'vehicle_number' },
  routeJson: { type: DataTypes.JSON, allowNull: true, field: 'route_json' },
}, { tableName: 'deliveries', indexes: [{ fields: ['assigned_to_id', 'status'] }] });
