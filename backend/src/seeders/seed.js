const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Organization, Category, Product, Service, Address, Order, OrderItem, Payment, Delivery, ServiceBooking, Notification } = require('../models');

const categories = [
  { name: 'PPE & protection', slug: 'ppe-protection', icon: 'shield', sortOrder: 1 },
  { name: 'Diagnostics', slug: 'diagnostics', icon: 'heart', sortOrder: 2 },
  { name: 'Surgical supplies', slug: 'surgical-supplies', icon: 'syringe', sortOrder: 3 },
  { name: 'Equipment', slug: 'equipment', icon: 'activity', sortOrder: 4 },
  { name: 'Consumables', slug: 'consumables', icon: 'package', sortOrder: 5 },
];
const products = [
  ['PPE-GLV-100', 'Nitrile examination gloves', 'Medora Care', 'PPE & protection', 'Powder-free, latex-free examination gloves with a comfortable textured grip.', 'box · 100 pcs', 890, 1090, 12, 284, 80, '2028-04-30', 'gloves', 'Best seller', true],
  ['PPE-MSK-050', '3-ply surgical face masks', 'AeroShield', 'PPE & protection', 'Three-layer disposable masks with soft elastic ear loops. IS 16289 compliant.', 'box · 50 pcs', 450, 560, 5, 418, 100, '2028-01-31', 'mask', 'Value pack', true],
  ['DX-THR-001', 'Digital thermometer', 'VitaSense', 'Diagnostics', 'Fast, accurate oral and underarm temperature readings with a clear LCD display.', 'piece', 360, 450, 12, 42, 30, null, 'thermometer', 'Clinic essential', true],
  ['DX-BPM-002', 'Automatic BP monitor', 'CardioWell', 'Equipment', 'Clinically validated upper-arm blood pressure monitor with irregular heartbeat detection.', 'piece', 2150, 2790, 12, 18, 20, null, 'monitor', 'Low stock', true],
  ['SUR-GWN-010', 'Disposable surgical gowns', 'Medora Care', 'Surgical supplies', 'Fluid-resistant, breathable non-woven gowns for everyday clinical procedures.', 'pack · 10 pcs', 980, 1250, 5, 76, 25, '2028-09-30', 'gown', 'Sterile', false],
  ['PPE-N95-020', 'N95 respirator mask', 'AeroShield', 'PPE & protection', 'Four-layer particulate respirator with a secure nose bridge and soft head straps.', 'box · 20 pcs', 1250, 1490, 5, 96, 40, '2027-12-31', 'respirator', 'Certified', false],
  ['DX-OXI-001', 'Fingertip pulse oximeter', 'VitaSense', 'Diagnostics', 'Portable SpO2 and pulse-rate monitoring with OLED display and one-button operation.', 'piece', 1120, 1390, 12, 33, 15, null, 'oximeter', 'Popular', false],
  ['CON-BND-005', 'Sterile gauze bandage rolls', 'HealSure', 'Consumables', 'Soft, absorbent cotton gauze roll for wound dressing and first-aid care.', 'pack · 5 rolls', 280, 350, 5, 9, 24, '2027-06-30', 'bandage', 'Reorder soon', false],
  ['SUR-SYR-100', 'Disposable syringes · 5 ml', 'ClinixPro', 'Surgical supplies', 'Sterile single-use syringe with clear graduations and a smooth plunger.', 'box · 100 pcs', 640, 780, 5, 210, 70, '2028-06-30', 'syringe', 'Sterile', true],
  ['EQ-STH-001', 'Acoustic stethoscope', 'CardioWell', 'Equipment', 'Dual-head stainless steel chest piece with a lightweight, flexible tube.', 'piece', 1680, 2190, 12, 27, 10, null, 'stethoscope', 'Clinician pick', false],
  ['PPE-SNT-500', 'Hand sanitiser · 500 ml', 'PureCare', 'Consumables', '70% alcohol hand rub with a skin-friendly formula and convenient pump.', 'bottle', 195, 240, 18, 132, 45, '2027-05-31', 'sanitiser', 'Fast dispatch', false],
  ['DX-STH-002', 'Infrared forehead thermometer', 'VitaSense', 'Diagnostics', 'Contact-free temperature measurement with fever alert and memory recall.', 'piece', 1790, 2290, 12, 24, 12, null, 'infrared', 'Contact-free', false],
];
const services = [
  { slug: 'equipment-installation', name: 'Equipment installation', category: 'Installation', description: 'Professional setup and commissioning for new diagnostic and monitoring equipment.', basePrice: 1200, durationMinutes: 90, responseSla: 'Within 2 business days', icon: 'activity', color: 'mint' },
  { slug: 'preventive-maintenance', name: 'Preventive maintenance', category: 'Maintenance', description: 'Scheduled safety checks, cleaning, calibration review, and maintenance report.', basePrice: 1800, durationMinutes: 60, responseSla: 'Next available slot', icon: 'wrench', color: 'blue' },
  { slug: 'equipment-calibration', name: 'Equipment calibration', category: 'Calibration', description: 'Traceable calibration and performance verification by a trained technician.', basePrice: 2400, durationMinutes: 60, responseSla: 'Within 3 business days', icon: 'gauge', color: 'amber' },
  { slug: 'urgent-repair', name: 'Urgent repair visit', category: 'Repair', description: 'Priority on-site assessment and repair for critical clinical equipment.', basePrice: 950, durationMinutes: 45, responseSla: 'Same-day triage', icon: 'heart', color: 'rose' },
];

async function seedDemo() {
  const passwordHash = await bcrypt.hash('medora-demo', 12);
  const [supplierOrg] = await Organization.findOrCreate({ where: { name: 'Medora Supply Co.' }, defaults: { name: 'Medora Supply Co.', type: 'SUPPLIER', gstin: '27AAFCM4821D1Z4', email: 'care@medora.health', phone: '+91 20 6789 0123', address: 'Plot 14, Chakan MIDC', city: 'Pune', state: 'Maharashtra', pincode: '410501', latitude: 18.7606, longitude: 73.8636 } });
  const buyerDefs = [
    { email: 'meera@westsideclinic.demo', name: 'Dr. Meera Shah', organization: 'Westside Family Clinic', gstin: '27AAACW2039R1ZK', city: 'Pune', lat: 18.5594, lng: 73.8073, facilityType: 'Clinic' },
    { email: 'sanjay@citycare.demo', name: 'Sanjay Nair', organization: 'CityCare Hospital', gstin: '27AACCC7819D1Z8', city: 'Pune', lat: 18.5651, lng: 73.7791, facilityType: 'Hospital' },
    { email: 'kavita@medilife.demo', name: 'Dr. Kavita Rao', organization: 'MediLife Care Centre', gstin: '27AAFCM3052P1Z6', city: 'Pune', lat: 18.5071, lng: 73.8077, facilityType: 'Clinic' },
    { email: 'ritika@greenleaf.demo', name: 'Ritika Desai', organization: 'GreenLeaf Diagnostics', gstin: '27AAGFG7134F1Z4', city: 'Pimpri', lat: 18.6234, lng: 73.8009, facilityType: 'Diagnostics lab' },
    { email: 'sameer@sahyadri.demo', name: 'Dr. Sameer Kulkarni', organization: 'Sahyadri Day Surgery', gstin: '27AAWFS2584B1ZE', city: 'Pune', lat: 18.516, lng: 73.854, facilityType: 'Day surgery' },
  ];
  const buyers = {};
  for (const definition of buyerDefs) {
    const [organization] = await Organization.findOrCreate({ where: { name: definition.organization }, defaults: { name: definition.organization, type: 'BUYER', facilityType: definition.facilityType, gstin: definition.gstin, email: definition.email, city: definition.city, state: 'Maharashtra', pincode: definition.city === 'Pimpri' ? '411017' : '411007', latitude: definition.lat, longitude: definition.lng, preferences: { notifications: { orders: true, inventory: false, services: true, billing: false } } } });
    const [user] = await User.findOrCreate({ where: { email: definition.email }, defaults: { name: definition.name, email: definition.email, passwordHash, role: 'BUYER', organizationId: organization.id, gstin: definition.gstin, isActive: true } });
    buyers[definition.email] = { user, organization, ...definition };
  }
  const staffDefs = [
    { email: 'ananya@medora.demo', name: 'Ananya Kulkarni', role: 'ADMIN', phone: '+91 98222 10001' },
    { email: 'rahul@medora.demo', name: 'Rahul Deshmukh', role: 'SUPPLIER', phone: '+91 98222 10002' },
    { email: 'arjun@medora.demo', name: 'Arjun Patil', role: 'FULFILLMENT', phone: '+91 98222 10003' },
  ];
  const staff = {};
  for (const definition of staffDefs) {
    const [user] = await User.findOrCreate({ where: { email: definition.email }, defaults: { ...definition, passwordHash, organizationId: supplierOrg.id, gstin: supplierOrg.gstin, isActive: true } });
    staff[definition.role] = user;
  }
  const categoryByName = {};
  for (const category of categories) {
    const [record] = await Category.findOrCreate({ where: { slug: category.slug }, defaults: category });
    categoryByName[category.name] = record;
  }
  const productBySku = {};
  for (const row of products) {
    const [sku, name, brand, categoryName, description, unit, price, mrp, gstRate, stock, reorderLevel, expiryDate, art, badge, isFeatured] = row;
    const [product] = await Product.findOrCreate({ where: { sku }, defaults: { sku, name, brand, categoryId: categoryByName[categoryName].id, description, unit, price, mrp, gstRate, stock, reorderLevel, expiryDate, art, badge, isFeatured, isActive: true } });
    productBySku[sku] = product;
  }
  const serviceBySlug = {};
  for (const definition of services) {
    const [service] = await Service.findOrCreate({ where: { slug: definition.slug }, defaults: { ...definition, isActive: true } });
    serviceBySlug[definition.slug] = service;
  }
  const addresses = {};
  for (const [index, definition] of buyerDefs.entries()) {
    const buyer = buyers[definition.email];
    const [address] = await Address.findOrCreate({ where: { userId: buyer.user.id, label: 'Main facility' }, defaults: { userId: buyer.user.id, organizationId: buyer.organization.id, label: 'Main facility', recipient: buyer.user.name, organization: buyer.organization.name, line1: index === 0 ? '18 Aundh Road' : index === 1 ? '240 Baner Road' : index === 2 ? '76 Paud Road' : index === 3 ? '51 Pimpri Market' : '14 Sahyadri Road', city: definition.city, state: 'Maharashtra', pincode: index === 3 ? '411017' : '411007', gstin: definition.gstin, latitude: definition.lat, longitude: definition.lng, isDefault: true, addressType: 'BOTH' } });
    addresses[definition.email] = address;
  }
  const orderDefs = [
    { orderNumber: 'MD-260184', email: buyerDefs[0].email, status: 'OUT_FOR_DELIVERY', paymentStatus: 'PAID', paymentMethod: 'UPI', daysAgo: 0, expectedDelivery: 'Today, 2:30 PM', skuLines: [['PPE-GLV-100', 4], ['DX-THR-001', 2], ['PPE-N95-020', 2]], assigned: true },
    { orderNumber: 'MD-260183', email: buyerDefs[1].email, status: 'PACKED', paymentStatus: 'PENDING', paymentMethod: 'BANK_TRANSFER', daysAgo: 0, expectedDelivery: 'Today, 5:00 PM', skuLines: [['PPE-MSK-050', 10], ['SUR-GWN-010', 8]], assigned: true },
    { orderNumber: 'MD-260182', email: buyerDefs[0].email, status: 'CONFIRMED', paymentStatus: 'PAID', paymentMethod: 'CARD', daysAgo: 1, expectedDelivery: 'Tomorrow, 11:00 AM', skuLines: [['DX-BPM-002', 2]], assigned: true },
    { orderNumber: 'MD-260179', email: buyerDefs[2].email, status: 'DELIVERED', paymentStatus: 'PAID', paymentMethod: 'UPI', daysAgo: 2, expectedDelivery: 'Delivered yesterday', skuLines: [['DX-OXI-001', 1], ['EQ-STH-001', 1]], assigned: true },
    { orderNumber: 'MD-260177', email: buyerDefs[3].email, status: 'PROCESSING', paymentStatus: 'PENDING', paymentMethod: 'COD', daysAgo: 3, expectedDelivery: 'Oct 21, 2026', skuLines: [['SUR-SYR-100', 8]], assigned: false },
    { orderNumber: 'MD-260171', email: buyerDefs[0].email, status: 'DELIVERED', paymentStatus: 'PAID', paymentMethod: 'UPI', daysAgo: 8, expectedDelivery: 'Delivered Oct 11', skuLines: [['PPE-GLV-100', 4]], assigned: true },
    { orderNumber: 'MD-260169', email: buyerDefs[1].email, status: 'PICKING', paymentStatus: 'PAID', paymentMethod: 'CARD', daysAgo: 9, expectedDelivery: 'Oct 20, 2026', skuLines: [['DX-STH-002', 2]], assigned: false },
  ];
  for (const definition of orderDefs) {
    const buyer = buyers[definition.email];
    const [order, created] = await Order.findOrCreate({ where: { orderNumber: definition.orderNumber }, defaults: {
      orderNumber: definition.orderNumber, userId: buyer.user.id, shippingAddressId: addresses[definition.email].id, assignedToId: definition.assigned ? staff.FULFILLMENT.id : null,
      buyerName: buyer.user.name, buyerOrg: buyer.organization.name, billingGstin: buyer.gstin,
      shippingAddressJson: { recipient: buyer.user.name, organization: buyer.organization.name, line1: addresses[definition.email].line1, city: buyer.city, state: 'Maharashtra', pincode: addresses[definition.email].pincode, gstin: buyer.gstin, latitude: buyer.lat, longitude: buyer.lng },
      status: definition.status, paymentStatus: definition.paymentStatus, paymentMethod: definition.paymentMethod,
      subtotal: 0, tax: 0, shippingFee: 0, total: 0, expectedDelivery: definition.expectedDelivery,
      createdAt: new Date(Date.now() - definition.daysAgo * 86400000), updatedAt: new Date(Date.now() - definition.daysAgo * 86400000), placedAt: new Date(Date.now() - definition.daysAgo * 86400000),
    } });
    if (!created) continue;
    let subtotal = 0; let tax = 0;
    const lines = definition.skuLines.map(([sku, quantity]) => {
      const product = productBySku[sku];
      const lineSubtotal = Number(product.price) * quantity;
      const taxAmount = Math.round(lineSubtotal * Number(product.gstRate) / 100 * 100) / 100;
      subtotal += lineSubtotal; tax += taxAmount;
      return { orderId: order.id, productId: product.id, sku, name: product.name, quantity, unitPrice: product.price, gstRate: product.gstRate, taxAmount, total: lineSubtotal };
    });
    subtotal = Math.round(subtotal * 100) / 100; tax = Math.round(tax * 100) / 100;
    const shippingFee = subtotal >= 5000 ? 0 : 100;
    await OrderItem.bulkCreate(lines);
    await order.update({ subtotal, tax, shippingFee, total: subtotal + tax + shippingFee, deliveredAt: definition.status === 'DELIVERED' ? new Date(Date.now() - Math.max(1, definition.daysAgo) * 86400000) : null });
    await Payment.findOrCreate({ where: { orderId: order.id }, defaults: { orderId: order.id, method: definition.paymentMethod, provider: 'DEMO', amount: subtotal + tax + shippingFee, currency: 'INR', status: definition.paymentStatus } });
    await Delivery.findOrCreate({ where: { orderId: order.id }, defaults: { orderId: order.id, assignedToId: definition.assigned ? staff.FULFILLMENT.id : null, trackingCode: `MDT-${definition.orderNumber.slice(-6)}`, status: definition.status === 'DELIVERED' ? 'DELIVERED' : definition.status === 'OUT_FOR_DELIVERY' ? 'OUT_FOR_DELIVERY' : definition.status === 'PACKED' ? 'PACKED' : 'QUEUED' } });
  }
  const bookingDefs = [
    { bookingNumber: 'SV-260201', serviceSlug: 'preventive-maintenance', email: buyerDefs[0].email, date: '2026-10-22', time: '10:00 AM – 12:00 PM', status: 'CONFIRMED', notes: 'Annual BP monitor check' },
    { bookingNumber: 'SV-260202', serviceSlug: 'equipment-installation', email: buyerDefs[1].email, date: '2026-10-23', time: '2:00 PM – 4:00 PM', status: 'REQUESTED', notes: 'New monitor installation' },
  ];
  for (const booking of bookingDefs) {
    const buyer = buyers[booking.email];
    await ServiceBooking.findOrCreate({ where: { bookingNumber: booking.bookingNumber }, defaults: { bookingNumber: booking.bookingNumber, serviceId: serviceBySlug[booking.serviceSlug].id, userId: buyer.user.id, status: booking.status, preferredDate: booking.date, preferredTime: booking.time, addressId: addresses[booking.email].id, addressSnapshot: { line1: addresses[booking.email].line1, city: buyer.city, state: 'Maharashtra', pincode: addresses[booking.email].pincode }, equipmentModel: 'CardioWell clinical monitor', notes: booking.notes, quotedPrice: serviceBySlug[booking.serviceSlug].basePrice, technicianName: booking.status === 'CONFIRMED' ? 'Rahul Deshmukh' : null } });
  }
  const notificationDefs = [
    { email: buyerDefs[0].email, title: 'Delivery is on the way', body: 'Order MD-260184 is with Arjun and should arrive by 2:30 PM.', type: 'delivery' },
    { email: staffDefs[0].email, title: 'Low stock alert', body: 'Gauze bandage rolls are down to 9 packs. Reorder threshold is 24.', type: 'inventory' },
    { email: staffDefs[0].email, title: 'New service request', body: 'CityCare Hospital requested equipment installation for Oct 23.', type: 'service' },
  ];
  for (const row of notificationDefs) {
    const user = row.email.includes('@medora.demo') ? staff[staffDefs.find((item) => item.email === row.email)?.role || 'ADMIN'] : buyers[row.email]?.user;
    if (user) await Notification.findOrCreate({ where: { userId: user.id, title: row.title }, defaults: { userId: user.id, title: row.title, body: row.body, type: row.type } });
  }
  console.info('[seed] Demo records ready. Login with ananya@medora.demo / medora-demo (or switch roles in the UI).');
}

if (require.main === module) {
  (async () => {
    try { await sequelize.authenticate(); await sequelize.sync(); await seedDemo(); await sequelize.close(); }
    catch (error) { console.error('[seed:error]', error); process.exitCode = 1; }
  })();
}
module.exports = { seedDemo };
