const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Organization = require('./Organization')(sequelize);
const Address = require('./Address')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);
const Service = require('./Service')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const ServiceBooking = require('./ServiceBooking')(sequelize);
const Notification = require('./Notification')(sequelize);
const Invoice = require('./Invoice')(sequelize);
const Payment = require('./Payment')(sequelize);
const Delivery = require('./Delivery')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);
const EmailLog = require('./EmailLog')(sequelize);

Organization.hasMany(User, { foreignKey: 'organizationId', as: 'members' });
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organizationRecord' });
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Organization.hasMany(Address, { foreignKey: 'organizationId', as: 'addresses' });
Address.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organizationRecord' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'categoryRecord' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'buyer' });
User.hasMany(Order, { foreignKey: 'assignedToId', as: 'assignedOrders' });
Order.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignee' });
Address.hasMany(Order, { foreignKey: 'shippingAddressId', as: 'orders' });
Order.belongsTo(Address, { foreignKey: 'shippingAddressId', as: 'shippingAddressRecord' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderLines' });
Order.hasOne(Invoice, { foreignKey: 'orderId', as: 'invoice' });
Invoice.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasOne(Delivery, { foreignKey: 'orderId', as: 'delivery' });
Delivery.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
User.hasMany(Delivery, { foreignKey: 'assignedToId', as: 'deliveries' });
Delivery.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignee' });

Service.hasMany(ServiceBooking, { foreignKey: 'serviceId', as: 'bookings' });
ServiceBooking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
User.hasMany(ServiceBooking, { foreignKey: 'userId', as: 'serviceBookings' });
ServiceBooking.belongsTo(User, { foreignKey: 'userId', as: 'customer' });
User.hasMany(ServiceBooking, { foreignKey: 'assignedToId', as: 'assignedBookings' });
ServiceBooking.belongsTo(User, { foreignKey: 'assignedToId', as: 'technician' });
Address.hasMany(ServiceBooking, { foreignKey: 'addressId', as: 'serviceBookings' });
ServiceBooking.belongsTo(Address, { foreignKey: 'addressId', as: 'addressRecord' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AuditLog, { foreignKey: 'actorId', as: 'auditEvents' });
AuditLog.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

module.exports = {
  sequelize, User, Organization, Address, Category, Product, Service, Order,
  OrderItem, ServiceBooking, Notification, Invoice, Payment, Delivery, AuditLog, EmailLog,
};
