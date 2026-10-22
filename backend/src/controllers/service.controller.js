const { z } = require('zod');
const { Op } = require('sequelize');
const { Service, ServiceBooking, User, Organization, Address, sequelize } = require('../models');
const { fail } = require('../utils/http');
const { serializeService, serializeBooking } = require('../services/orderFormat.service');
const { notifyRoles, notifyUser } = require('../services/notification.service');
const { audit } = require('../services/audit.service');

const bookingCreateSchema = z.object({
  serviceId: z.string().uuid(), preferredDate: z.string().min(10).max(10), preferredTime: z.string().trim().min(3).max(60),
  address: z.string().trim().min(5).max(360), equipmentModel: z.string().trim().max(160).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});
const bookingUpdateSchema = z.object({ status: z.enum(['REQUESTED', 'CONFIRMED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']), assignedToId: z.string().uuid().optional().nullable(), technicianName: z.string().trim().max(120).optional().nullable(), quotedPrice: z.coerce.number().min(0).optional().nullable() });

async function listServices(req, res) {
  const rows = await Service.findAll({ where: { isActive: true }, order: [['category', 'ASC'], ['name', 'ASC']] });
  res.json({ success: true, data: rows.map(serializeService) });
}

async function listBookings(req, res) {
  const where = {};
  if (req.user.role === 'BUYER') where.userId = req.user.id;
  if (req.user.role === 'FULFILLMENT') where.assignedToId = req.user.id;
  if (req.query.status) where.status = req.query.status;
  const rows = await ServiceBooking.findAll({ where, include: [
    { model: Service, as: 'service' },
    { model: User, as: 'customer', attributes: ['id', 'name', 'organizationId'], include: [{ model: Organization, as: 'organizationRecord', attributes: ['name'] }] },
    { model: User, as: 'technician', attributes: ['id', 'name'] },
    { model: Address, as: 'addressRecord' },
  ], order: [['preferredDate', 'ASC'], ['createdAt', 'DESC']], limit: 200 });
  res.json({ success: true, data: { rows: rows.map(serializeBooking), total: rows.length } });
}

async function createBooking(req, res) {
  const body = bookingCreateSchema.parse(req.body);
  const service = await Service.findByPk(body.serviceId);
  if (!service || !service.isActive) throw fail(404, 'This service is not currently available.');
  if (new Date(`${body.preferredDate}T23:59:59`) < new Date()) throw fail(422, 'Choose a future service date.');
  const customer = await User.findByPk(req.user.id, { include: [{ model: Organization, as: 'organizationRecord' }] });
  const addressLine1 = body.address.slice(0, 180);
  const addressLine2 = body.address.slice(180, 360) || null;
  const booking = await sequelize.transaction(async (transaction) => {
    const address = await Address.create({ userId: req.user.id, organizationId: customer.organizationId, label: 'Service visit', recipient: customer.name, organization: customer.organizationRecord?.name || '', line1: addressLine1, line2: addressLine2, city: 'Pune', state: 'Maharashtra', pincode: '411001', addressType: 'SHIPPING' }, { transaction });
    return ServiceBooking.create({
      bookingNumber: `SV-${String(Date.now()).slice(-7)}`, serviceId: service.id, userId: req.user.id, status: 'REQUESTED',
      preferredDate: body.preferredDate, preferredTime: body.preferredTime, addressId: address.id,
      addressSnapshot: { line1: body.address, city: 'Pune', state: 'Maharashtra' }, equipmentModel: body.equipmentModel || null,
      notes: body.notes || null, quotedPrice: service.basePrice,
    }, { transaction });
  });
  const fullBooking = await ServiceBooking.findByPk(booking.id, { include: [{ model: Service, as: 'service' }, { model: User, as: 'customer', include: [{ model: Organization, as: 'organizationRecord' }] }] });
  await notifyUser(customer, { title: 'Service request received', body: `${service.name} request ${booking.bookingNumber} is in the care team’s queue.`, type: 'service', link: `/services/${booking.id}`, template: 'serviceBooking', emailValues: { name: customer.name, serviceName: service.name, bookingNumber: booking.bookingNumber, preferredDate: body.preferredDate, preferredTime: body.preferredTime } });
  await notifyRoles(['ADMIN', 'SUPPLIER'], { title: 'New service request', body: `${customer.organizationRecord?.name || customer.name} requested ${service.name}.`, type: 'service', link: `/services/${booking.id}` });
  await audit({ actorId: req.user.id, action: 'service.booking.create', entityType: 'service_booking', entityId: booking.id, req, metadata: { bookingNumber: booking.bookingNumber, serviceId: service.id } });
  res.status(201).json({ success: true, data: serializeBooking(fullBooking) });
}

const transitions = { REQUESTED: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['TECHNICIAN_ASSIGNED', 'CANCELLED'], TECHNICIAN_ASSIGNED: ['IN_PROGRESS', 'CANCELLED'], IN_PROGRESS: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: [] };
async function updateBooking(req, res) {
  const body = bookingUpdateSchema.parse(req.body);
  const booking = await ServiceBooking.findByPk(req.params.id, { include: [{ model: Service, as: 'service' }, { model: User, as: 'customer' }] });
  if (!booking) throw fail(404, 'Service request not found.');
  if (booking.status !== body.status && !(transitions[booking.status] || []).includes(body.status)) throw fail(422, `Service request cannot move from ${booking.status} to ${body.status}.`);
  const next = { status: body.status, ...(body.quotedPrice !== undefined ? { quotedPrice: body.quotedPrice } : {}) };
  if (body.assignedToId) {
    const technician = await User.findByPk(body.assignedToId);
    if (!technician || !['SUPPLIER', 'FULFILLMENT'].includes(technician.role) || !technician.isActive) throw fail(422, 'Choose an active service technician.');
    next.assignedToId = technician.id; next.technicianName = technician.name;
  } else if (body.technicianName) next.technicianName = body.technicianName;
  else if (body.status === 'TECHNICIAN_ASSIGNED' && !booking.technicianName) next.technicianName = 'Medora service team';
  if (body.status === 'COMPLETED') next.completedAt = new Date();
  await booking.update(next);
  const customer = await User.findByPk(booking.userId);
  if (customer) await notifyUser(customer, { title: 'Service visit updated', body: `${booking.service?.name || 'Your service'} is now ${body.status.replaceAll('_', ' ').toLowerCase()}.`, type: 'service', link: `/services/${booking.id}` });
  await audit({ actorId: req.user.id, action: 'service.booking.update', entityType: 'service_booking', entityId: booking.id, req, metadata: { status: body.status } });
  const updated = await ServiceBooking.findByPk(booking.id, { include: [{ model: Service, as: 'service' }, { model: User, as: 'customer', include: [{ model: Organization, as: 'organizationRecord' }] }, { model: User, as: 'technician' }] });
  res.json({ success: true, data: serializeBooking(updated) });
}

module.exports = { listServices, listBookings, createBooking, updateBooking };
