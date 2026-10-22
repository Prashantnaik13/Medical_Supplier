const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Invoice', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'order_id' },
  invoiceNumber: { type: DataTypes.STRING(40), allowNull: false, unique: true, field: 'invoice_number' },
  pdfPath: { type: DataTypes.STRING(500), allowNull: true, field: 'pdf_path' },
  supplierGstin: { type: DataTypes.STRING(15), allowNull: true, field: 'supplier_gstin' },
  buyerGstin: { type: DataTypes.STRING(15), allowNull: true, field: 'buyer_gstin' },
  placeOfSupply: { type: DataTypes.STRING(100), allowNull: true, field: 'place_of_supply' },
  subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  tax: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  issuedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'issued_at' },
}, { tableName: 'invoices', indexes: [{ fields: ['issued_at'] }] });
