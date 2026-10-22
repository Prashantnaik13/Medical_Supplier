export const DEMO_USERS = {
  ADMIN: {
    id: 'user-admin', name: 'Ananya Kulkarni', email: 'ananya@medora.demo', role: 'ADMIN',
    organization: 'Medora Supply Co.', initials: 'AK', city: 'Pune', gstin: '27AAFCM4821D1Z4',
  },
  SUPPLIER: {
    id: 'user-supplier', name: 'Rahul Deshmukh', email: 'rahul@medora.demo', role: 'SUPPLIER',
    organization: 'Medora Supply Co.', initials: 'RD', city: 'Pune', gstin: '27AAFCM4821D1Z4',
  },
  BUYER: {
    id: 'buyer-1', name: 'Dr. Meera Shah', email: 'meera@westsideclinic.demo', role: 'BUYER',
    organization: 'Westside Family Clinic', initials: 'MS', city: 'Pune', gstin: '27AAACW2039R1ZK',
  },
  FULFILLMENT: {
    id: 'driver-1', name: 'Arjun Patil', email: 'arjun@medora.demo', role: 'FULFILLMENT',
    organization: 'Medora Logistics', initials: 'AP', city: 'Pune', gstin: '27AAFCM4821D1Z4',
  },
};

export const ROLE_LABELS = {
  ADMIN: 'Platform admin',
  SUPPLIER: 'Supplier / operations',
  BUYER: 'Clinic / hospital buyer',
  FULFILLMENT: 'Warehouse & delivery',
};

export const CATEGORIES = [
  { name: 'All products', count: 48, icon: 'boxes' },
  { name: 'PPE & protection', count: 14, icon: 'shield' },
  { name: 'Diagnostics', count: 9, icon: 'heart' },
  { name: 'Surgical supplies', count: 12, icon: 'syringe' },
  { name: 'Equipment', count: 8, icon: 'activity' },
  { name: 'Consumables', count: 5, icon: 'package' },
];

export const INITIAL_PRODUCTS = [
  { id: 'p1', sku: 'PPE-GLV-100', name: 'Nitrile examination gloves', brand: 'Medora Care', category: 'PPE & protection', description: 'Powder-free, latex-free examination gloves with a comfortable textured grip.', unit: 'box · 100 pcs', price: 890, mrp: 1090, gstRate: 12, stock: 284, reorderLevel: 80, expiryDate: '2028-04-30', isFeatured: true, badge: 'Best seller', art: 'gloves' },
  { id: 'p2', sku: 'PPE-MSK-050', name: '3-ply surgical face masks', brand: 'AeroShield', category: 'PPE & protection', description: 'Three-layer disposable masks with soft elastic ear loops. IS 16289 compliant.', unit: 'box · 50 pcs', price: 450, mrp: 560, gstRate: 5, stock: 418, reorderLevel: 100, expiryDate: '2028-01-31', isFeatured: true, badge: 'Value pack', art: 'mask' },
  { id: 'p3', sku: 'DX-THR-001', name: 'Digital thermometer', brand: 'VitaSense', category: 'Diagnostics', description: 'Fast, accurate oral and underarm temperature readings with a clear LCD display.', unit: 'piece', price: 360, mrp: 450, gstRate: 12, stock: 42, reorderLevel: 30, expiryDate: null, isFeatured: true, badge: 'Clinic essential', art: 'thermometer' },
  { id: 'p4', sku: 'DX-BPM-002', name: 'Automatic BP monitor', brand: 'CardioWell', category: 'Equipment', description: 'Clinically validated upper-arm blood pressure monitor with irregular heartbeat detection.', unit: 'piece', price: 2150, mrp: 2790, gstRate: 12, stock: 18, reorderLevel: 20, expiryDate: null, isFeatured: true, badge: 'Low stock', art: 'monitor' },
  { id: 'p5', sku: 'SUR-GWN-010', name: 'Disposable surgical gowns', brand: 'Medora Care', category: 'Surgical supplies', description: 'Fluid-resistant, breathable non-woven gowns for everyday clinical procedures.', unit: 'pack · 10 pcs', price: 980, mrp: 1250, gstRate: 5, stock: 76, reorderLevel: 25, expiryDate: '2028-09-30', isFeatured: false, badge: 'Sterile', art: 'gown' },
  { id: 'p6', sku: 'PPE-N95-020', name: 'N95 respirator mask', brand: 'AeroShield', category: 'PPE & protection', description: 'Four-layer particulate respirator with a secure nose bridge and soft head straps.', unit: 'box · 20 pcs', price: 1250, mrp: 1490, gstRate: 5, stock: 96, reorderLevel: 40, expiryDate: '2027-12-31', isFeatured: false, badge: 'Certified', art: 'respirator' },
  { id: 'p7', sku: 'DX-OXI-001', name: 'Fingertip pulse oximeter', brand: 'VitaSense', category: 'Diagnostics', description: 'Portable SpO₂ and pulse-rate monitoring with OLED display and one-button operation.', unit: 'piece', price: 1120, mrp: 1390, gstRate: 12, stock: 33, reorderLevel: 15, expiryDate: null, isFeatured: false, badge: 'Popular', art: 'oximeter' },
  { id: 'p8', sku: 'CON-BND-005', name: 'Sterile gauze bandage rolls', brand: 'HealSure', category: 'Consumables', description: 'Soft, absorbent cotton gauze roll for wound dressing and first-aid care.', unit: 'pack · 5 rolls', price: 280, mrp: 350, gstRate: 5, stock: 9, reorderLevel: 24, expiryDate: '2027-06-30', isFeatured: false, badge: 'Reorder soon', art: 'bandage' },
  { id: 'p9', sku: 'SUR-SYR-100', name: 'Disposable syringes · 5 ml', brand: 'ClinixPro', category: 'Surgical supplies', description: 'Sterile single-use syringe with clear graduations and a smooth plunger.', unit: 'box · 100 pcs', price: 640, mrp: 780, gstRate: 5, stock: 210, reorderLevel: 70, expiryDate: '2028-06-30', isFeatured: true, badge: 'Sterile', art: 'syringe' },
  { id: 'p10', sku: 'EQ-STH-001', name: 'Acoustic stethoscope', brand: 'CardioWell', category: 'Equipment', description: 'Dual-head stainless steel chest piece with a lightweight, flexible tube.', unit: 'piece', price: 1680, mrp: 2190, gstRate: 12, stock: 27, reorderLevel: 10, expiryDate: null, isFeatured: false, badge: 'Clinician pick', art: 'stethoscope' },
  { id: 'p11', sku: 'PPE-SNT-500', name: 'Hand sanitiser · 500 ml', brand: 'PureCare', category: 'Consumables', description: '70% alcohol hand rub with a skin-friendly formula and convenient pump.', unit: 'bottle', price: 195, mrp: 240, gstRate: 18, stock: 132, reorderLevel: 45, expiryDate: '2027-05-31', isFeatured: false, badge: 'Fast dispatch', art: 'sanitiser' },
  { id: 'p12', sku: 'DX-STH-002', name: 'Infrared forehead thermometer', brand: 'VitaSense', category: 'Diagnostics', description: 'Contact-free temperature measurement with fever alert and memory recall.', unit: 'piece', price: 1790, mrp: 2290, gstRate: 12, stock: 24, reorderLevel: 12, expiryDate: null, isFeatured: false, badge: 'Contact-free', art: 'infrared' },
];

const ago = (days, hours = 10) => new Date(Date.now() - days * 86400000 + hours * 3600000).toISOString();
const line = (productId, name, sku, quantity, unitPrice, gstRate) => ({ productId, name, sku, quantity, unitPrice, gstRate, total: quantity * unitPrice });

export const INITIAL_ORDERS = [
  { id: 'ord-1001', orderNumber: 'MD-260184', userId: 'buyer-1', buyerName: 'Dr. Meera Shah', buyerOrg: 'Westside Family Clinic', status: 'OUT_FOR_DELIVERY', paymentStatus: 'PAID', paymentMethod: 'UPI', createdAt: ago(0, 8), expectedDelivery: 'Today, 2:30 PM', shippingAddress: '18 Aundh Road, Pune 411007', addressCoordinates: { lat: 18.5594, lng: 73.8073 }, assignedToId: 'driver-1', subtotal: 6780, tax: 745.8, shippingFee: 0, total: 7525.8, items: [line('p1', 'Nitrile examination gloves', 'PPE-GLV-100', 4, 890, 12), line('p3', 'Digital thermometer', 'DX-THR-001', 2, 360, 12), line('p6', 'N95 respirator mask', 'PPE-N95-020', 2, 1250, 5)] },
  { id: 'ord-1002', orderNumber: 'MD-260183', userId: 'buyer-2', buyerName: 'Sanjay Nair', buyerOrg: 'CityCare Hospital', status: 'PACKED', paymentStatus: 'PENDING', paymentMethod: 'BANK_TRANSFER', createdAt: ago(0, 6), expectedDelivery: 'Today, 5:00 PM', shippingAddress: '240 Baner Road, Pune 411045', addressCoordinates: { lat: 18.5651, lng: 73.7791 }, assignedToId: 'driver-1', subtotal: 12500, tax: 625, shippingFee: 0, total: 13125, items: [line('p2', '3-ply surgical face masks', 'PPE-MSK-050', 10, 450, 5), line('p5', 'Disposable surgical gowns', 'SUR-GWN-010', 8, 980, 5)] },
  { id: 'ord-1003', orderNumber: 'MD-260182', userId: 'buyer-1', buyerName: 'Dr. Meera Shah', buyerOrg: 'Westside Family Clinic', status: 'CONFIRMED', paymentStatus: 'PAID', paymentMethod: 'CARD', createdAt: ago(1, 11), expectedDelivery: 'Tomorrow, 11:00 AM', shippingAddress: '18 Aundh Road, Pune 411007', addressCoordinates: { lat: 18.5594, lng: 73.8073 }, assignedToId: 'driver-1', subtotal: 4300, tax: 516, shippingFee: 0, total: 4816, items: [line('p4', 'Automatic BP monitor', 'DX-BPM-002', 2, 2150, 12)] },
  { id: 'ord-1004', orderNumber: 'MD-260179', userId: 'buyer-3', buyerName: 'Dr. Kavita Rao', buyerOrg: 'MediLife Care Centre', status: 'DELIVERED', paymentStatus: 'PAID', paymentMethod: 'UPI', createdAt: ago(2, 9), expectedDelivery: 'Delivered yesterday', shippingAddress: '76 Paud Road, Kothrud, Pune 411038', addressCoordinates: { lat: 18.5071, lng: 73.8077 }, assignedToId: 'driver-1', subtotal: 2140, tax: 256.8, shippingFee: 0, total: 2396.8, items: [line('p7', 'Fingertip pulse oximeter', 'DX-OXI-001', 1, 1120, 12), line('p10', 'Acoustic stethoscope', 'EQ-STH-001', 1, 1020, 12)], deliveredAt: ago(1, 16) },
  { id: 'ord-1005', orderNumber: 'MD-260177', userId: 'buyer-4', buyerName: 'Ritika Desai', buyerOrg: 'GreenLeaf Diagnostics', status: 'PROCESSING', paymentStatus: 'PENDING', paymentMethod: 'COD', createdAt: ago(3, 12), expectedDelivery: 'Oct 21, 2026', shippingAddress: '51 Pimpri Market, Pune 411017', addressCoordinates: { lat: 18.6234, lng: 73.8009 }, assignedToId: null, subtotal: 5120, tax: 512, shippingFee: 100, total: 5732, items: [line('p9', 'Disposable syringes · 5 ml', 'SUR-SYR-100', 8, 640, 5)] },
  { id: 'ord-1006', orderNumber: 'MD-260171', userId: 'buyer-1', buyerName: 'Dr. Meera Shah', buyerOrg: 'Westside Family Clinic', status: 'DELIVERED', paymentStatus: 'PAID', paymentMethod: 'UPI', createdAt: ago(8, 10), expectedDelivery: 'Delivered Oct 11', shippingAddress: '18 Aundh Road, Pune 411007', addressCoordinates: { lat: 18.5594, lng: 73.8073 }, assignedToId: 'driver-1', subtotal: 3560, tax: 427.2, shippingFee: 0, total: 3987.2, items: [line('p1', 'Nitrile examination gloves', 'PPE-GLV-100', 4, 890, 12)] },
  { id: 'ord-1007', orderNumber: 'MD-260169', userId: 'buyer-2', buyerName: 'Sanjay Nair', buyerOrg: 'CityCare Hospital', status: 'PICKING', paymentStatus: 'PAID', paymentMethod: 'CARD', createdAt: ago(9, 15), expectedDelivery: 'Oct 20, 2026', shippingAddress: '240 Baner Road, Pune 411045', addressCoordinates: { lat: 18.5651, lng: 73.7791 }, assignedToId: null, subtotal: 3590, tax: 430.8, shippingFee: 0, total: 4020.8, items: [line('p12', 'Infrared forehead thermometer', 'DX-STH-002', 2, 1790, 12)] },
];

export const INITIAL_SERVICES = [
  { id: 'svc-1', name: 'Equipment installation', description: 'Professional setup and commissioning for new diagnostic and monitoring equipment.', category: 'Installation', price: 1200, duration: '60–90 min', icon: 'activity', color: 'mint', response: 'Within 2 business days' },
  { id: 'svc-2', name: 'Preventive maintenance', description: 'Scheduled safety checks, cleaning, calibration review, and maintenance report.', category: 'Maintenance', price: 1800, duration: '60 min', icon: 'wrench', color: 'blue', response: 'Next available slot' },
  { id: 'svc-3', name: 'Equipment calibration', description: 'Traceable calibration and performance verification by a trained technician.', category: 'Calibration', price: 2400, duration: '45–60 min', icon: 'gauge', color: 'amber', response: 'Within 3 business days' },
  { id: 'svc-4', name: 'Urgent repair visit', description: 'Priority on-site assessment and repair for critical clinical equipment.', category: 'Repair', price: 950, duration: 'First 45 min', icon: 'heart', color: 'rose', response: 'Same-day triage' },
];

export const INITIAL_BOOKINGS = [
  { id: 'book-201', serviceId: 'svc-2', serviceName: 'Preventive maintenance', userId: 'buyer-1', buyerOrg: 'Westside Family Clinic', preferredDate: '2026-10-22', preferredTime: '10:00 AM – 12:00 PM', status: 'CONFIRMED', address: '18 Aundh Road, Pune 411007', technician: 'Rahul Deshmukh', notes: 'Annual BP monitor check' },
  { id: 'book-202', serviceId: 'svc-1', serviceName: 'Equipment installation', userId: 'buyer-2', buyerOrg: 'CityCare Hospital', preferredDate: '2026-10-23', preferredTime: '2:00 PM – 4:00 PM', status: 'REQUESTED', address: '240 Baner Road, Pune 411045', technician: null, notes: 'New monitor installation' },
];

export const INITIAL_NOTIFICATIONS = [
  { id: 'n1', title: 'Delivery is on the way', body: 'Order MD-260184 is with Arjun and should arrive by 2:30 PM.', type: 'delivery', time: '8 min ago', read: false, userId: 'buyer-1', createdAt: ago(0, 15) },
  { id: 'n2', title: 'Low stock alert', body: 'Gauze bandage rolls are down to 9 packs. Reorder threshold is 24.', type: 'inventory', time: '32 min ago', read: false, userId: 'user-admin', createdAt: ago(0, 13) },
  { id: 'n3', title: 'New service request', body: 'CityCare Hospital requested equipment installation for Oct 23.', type: 'service', time: '1 hr ago', read: false, userId: 'user-admin', createdAt: ago(0, 12) },
  { id: 'n4', title: 'Invoice ready', body: 'Tax invoice INV-26-0180 is ready to download.', type: 'invoice', time: 'Yesterday', read: true, userId: 'buyer-1', createdAt: ago(1, 8) },
];

export const CUSTOMERS = [
  { id: 'buyer-1', name: 'Dr. Meera Shah', organization: 'Westside Family Clinic', type: 'Clinic', city: 'Pune', gstin: '27AAACW2039R1ZK', orders: 18, lifetimeValue: 128450, credit: 'Net 15', status: 'Active', initials: 'MS' },
  { id: 'buyer-2', name: 'Sanjay Nair', organization: 'CityCare Hospital', type: 'Hospital', city: 'Pune', gstin: '27AACCC7819D1Z8', orders: 34, lifetimeValue: 482900, credit: 'Net 30', status: 'Active', initials: 'CN' },
  { id: 'buyer-3', name: 'Dr. Kavita Rao', organization: 'MediLife Care Centre', type: 'Clinic', city: 'Pune', gstin: '27AAFCM3052P1Z6', orders: 11, lifetimeValue: 72980, credit: 'Prepaid', status: 'Active', initials: 'MR' },
  { id: 'buyer-4', name: 'Ritika Desai', organization: 'GreenLeaf Diagnostics', type: 'Diagnostics lab', city: 'Pimpri', gstin: '27AAGFG7134F1Z4', orders: 9, lifetimeValue: 63920, credit: 'Net 15', status: 'Review', initials: 'GD' },
  { id: 'buyer-5', name: 'Dr. Sameer Kulkarni', organization: 'Sahyadri Day Surgery', type: 'Day surgery', city: 'Pune', gstin: '27AAWFS2584B1ZE', orders: 26, lifetimeValue: 326750, credit: 'Net 30', status: 'Active', initials: 'SK' },
];

export const MAP_LOCATIONS = [
  { id: 'warehouse', name: 'Medora distribution hub', subtitle: 'Warehouse · Chakan', kind: 'warehouse', x: 48, y: 50, lat: 18.7606, lng: 73.8636, status: 'Open · until 7 PM' },
  { id: 'loc-1', name: 'Westside Family Clinic', subtitle: 'Order MD-260184 · arriving 2:30 PM', kind: 'delivery', x: 69, y: 36, lat: 18.5594, lng: 73.8073, status: 'Out for delivery' },
  { id: 'loc-2', name: 'CityCare Hospital', subtitle: 'Order MD-260183 · packed', kind: 'delivery', x: 31, y: 68, lat: 18.5651, lng: 73.7791, status: 'Ready for dispatch' },
  { id: 'loc-3', name: 'MediLife Care Centre', subtitle: 'Service zone · Kothrud', kind: 'clinic', x: 53, y: 26, lat: 18.5071, lng: 73.8077, status: 'Covered' },
  { id: 'loc-4', name: 'GreenLeaf Diagnostics', subtitle: 'Service zone · Pimpri', kind: 'clinic', x: 23, y: 35, lat: 18.6234, lng: 73.8009, status: 'Covered' },
];

export const INITIAL_TEAM = [
  { ...DEMO_USERS.ADMIN, department: 'Leadership', access: 'Full access', status: 'Active' },
  { ...DEMO_USERS.SUPPLIER, department: 'Operations', access: 'Catalog, orders & inventory', status: 'Active' },
  { ...DEMO_USERS.FULFILLMENT, department: 'Logistics', access: 'Assigned orders & routes', status: 'Active' },
  { id: 'staff-4', name: 'Neha Joshi', email: 'neha@medora.demo', role: 'SUPPLIER', organization: 'Medora Supply Co.', initials: 'NJ', department: 'Customer care', access: 'Orders & customers', status: 'Invited' },
];
