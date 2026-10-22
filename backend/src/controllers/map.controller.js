const { Op } = require('sequelize');
const { Organization, User, Order, Address, ServiceBooking, Delivery } = require('../models');

const COVERAGE_ZONES = [
  { id: 'pune', name: 'Pune city', type: 'DELIVERY', sla: '24–48 hours', center: { lat: 18.5204, lng: 73.8567 }, active: true },
  { id: 'pcmc', name: 'Pimpri-Chinchwad', type: 'DELIVERY', sla: '24–48 hours', center: { lat: 18.6298, lng: 73.7997 }, active: true },
  { id: 'baner', name: 'Aundh & Baner', type: 'DELIVERY', sla: 'Same / next day', center: { lat: 18.565, lng: 73.798 }, active: true },
  { id: 'kothrud', name: 'Kothrud & Bavdhan', type: 'SERVICE', sla: 'Next available appointment', center: { lat: 18.5071, lng: 73.8077 }, active: true },
  { id: 'wakad', name: 'Wakad & Hinjawadi', type: 'DELIVERY', sla: '1–2 business days', center: { lat: 18.597, lng: 73.765 }, active: true },
];

function mapPosition(lat, lng, index) {
  if (!lat || !lng) return { x: 25 + (index * 17) % 55, y: 25 + (index * 23) % 55 };
  return { x: Math.max(10, Math.min(90, 50 + (Number(lng) - 73.84) * 280)), y: Math.max(12, Math.min(88, 50 - (Number(lat) - 18.55) * 230)) };
}

async function locations(req, res) {
  const supplier = await Organization.findOne({ where: { type: 'SUPPLIER', isActive: true } });
  const hub = supplier ? [{ id: supplier.id, name: supplier.name, subtitle: `Distribution hub · ${supplier.city || 'Pune'}`, kind: 'warehouse', lat: Number(supplier.latitude || 18.7606), lng: Number(supplier.longitude || 73.8636), status: 'Open · until 7 PM' }] : [];
  const deliveries = await Order.findAll({ where: { status: { [Op.in]: ['PACKED', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY'] }, ...(req.user.role === 'BUYER' ? { userId: req.user.id } : {}) }, include: [{ model: Address, as: 'shippingAddressRecord' }, { model: User, as: 'buyer', include: [{ model: Organization, as: 'organizationRecord' }] }], order: [['createdAt', 'DESC']], limit: 25 });
  const deliveryPins = deliveries.map((order, index) => {
    const address = order.shippingAddressRecord || {};
    const snapshot = order.shippingAddressJson || {};
    const lat = Number(address.latitude || snapshot.latitude || 18.54 + index * .01);
    const lng = Number(address.longitude || snapshot.longitude || 73.80 + index * .008);
    const position = mapPosition(lat, lng, index);
    const buyer = order.buyer;
    return { id: order.id, name: buyer?.organizationRecord?.name || order.buyerOrg || order.buyerName || order.orderNumber, subtitle: `Order ${order.orderNumber} · ${order.expectedDelivery || 'Today'}`, kind: 'delivery', lat, lng, status: order.status, orderId: order.id, ...position };
  });
  let locations = [...hub, ...deliveryPins];
  if (req.user.role !== 'BUYER') {
    const buyers = await Organization.findAll({ where: { type: 'BUYER', isActive: true, latitude: { [Op.not]: null }, longitude: { [Op.not]: null } }, limit: 15 });
    locations = locations.concat(buyers.map((organization, index) => ({ id: organization.id, name: organization.name, subtitle: `Care partner · ${organization.city || 'Pune'}`, kind: 'clinic', lat: Number(organization.latitude), lng: Number(organization.longitude), status: 'Covered', ...mapPosition(organization.latitude, organization.longitude, index + 2) })));
  }
  res.json({ success: true, data: locations });
}

async function coverage(req, res) {
  res.json({ success: true, data: COVERAGE_ZONES });
}

async function serviceLocations(req, res) {
  const where = req.user.role === 'BUYER' ? { userId: req.user.id } : {};
  const bookings = await ServiceBooking.findAll({ where, include: [{ model: Address, as: 'addressRecord' }, { model: User, as: 'customer', include: [{ model: Organization, as: 'organizationRecord' }] }], order: [['preferredDate', 'ASC']], limit: 40 });
  res.json({ success: true, data: bookings.map((booking, index) => {
    const address = booking.addressRecord || {};
    const name = booking.customer?.organizationRecord?.name || booking.customer?.name || 'Service visit';
    const lat = Number(address.latitude || 18.53 + index * .008); const lng = Number(address.longitude || 73.82 + index * .006);
    return { id: booking.id, name, subtitle: `${booking.bookingNumber} · ${booking.preferredDate}`, kind: 'clinic', status: booking.status, lat, lng, ...mapPosition(lat, lng, index) };
  }) });
}

module.exports = { locations, coverage, serviceLocations, COVERAGE_ZONES };
