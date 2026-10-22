const crypto = require('node:crypto');
const { Op, fn, col } = require('sequelize');
const { z } = require('zod');
const { User, Organization, Order } = require('../models');
const { fail } = require('../utils/http');
const { ROLE_LABELS } = require('../utils/roleLabels');
const { sendTemplate } = require('../services/email.service');
const { audit } = require('../services/audit.service');

async function listCustomers(req, res) {
  const query = String(req.query.q || '').trim();
  const where = { role: 'BUYER', isActive: true };
  const orgWhere = query ? { name: { [Op.like]: `%${query}%` } } : undefined;
  const users = await User.findAll({ where, attributes: ['id', 'name', 'email', 'phone', 'gstin', 'organizationId', 'createdAt'], include: [{ model: Organization, as: 'organizationRecord', ...(orgWhere ? { where: orgWhere } : {}), required: Boolean(orgWhere), attributes: ['id', 'name', 'type', 'facilityType', 'gstin', 'city', 'state', 'phone', 'email'] }], order: [['createdAt', 'DESC']], limit: 200 });
  const ids = users.map((user) => user.id);
  const orderStats = ids.length ? await Order.findAll({ where: { userId: { [Op.in]: ids } }, attributes: ['userId', [fn('COUNT', col('id')), 'orderCount'], [fn('SUM', col('total')), 'lifetimeValue']], group: ['userId'], raw: true }) : [];
  const statsById = new Map(orderStats.map((row) => [row.userId, row]));
  res.json({ success: true, data: users.map((user) => {
    const stats = statsById.get(user.id) || {};
    const org = user.organizationRecord || {};
    return { id: user.id, name: user.name, email: user.email, phone: user.phone, organization: org.name || user.name, type: org.facilityType || 'Clinic', city: org.city || 'Pune', state: org.state || 'Maharashtra', gstin: user.gstin || org.gstin, orders: Number(stats.orderCount || 0), lifetimeValue: Number(stats.lifetimeValue || 0), credit: 'Prepaid', status: 'Active', initials: user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() };
  }) });
}

async function listTeam(req, res) {
  const users = await User.findAll({ where: { role: { [Op.in]: ['ADMIN', 'SUPPLIER', 'FULFILLMENT'] } }, include: [{ model: Organization, as: 'organizationRecord', attributes: ['name'] }], order: [['createdAt', 'ASC']] });
  res.json({ success: true, data: users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, organization: user.organizationRecord?.name || '', initials: user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(), department: user.role === 'FULFILLMENT' ? 'Logistics' : user.role === 'ADMIN' ? 'Leadership' : 'Operations', access: ROLE_LABELS[user.role], status: user.isActive ? 'Active' : 'Invited' })) });
}

async function inviteUser(req, res) {
  const body = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(190), role: z.enum(['ADMIN', 'SUPPLIER', 'FULFILLMENT', 'BUYER']), phone: z.string().trim().max(25).optional() }).parse(req.body);
  const exists = await User.findOne({ where: { email: body.email.toLowerCase() } });
  if (exists) throw fail(409, 'A Medora account already uses this email address.');
  const organization = await Organization.findOne({ where: { type: 'SUPPLIER' } });
  const invitationToken = crypto.randomBytes(28).toString('hex');
  const user = await User.create({ name: body.name, email: body.email, role: body.role, phone: body.phone || null, organizationId: organization?.id || null, isActive: false, invitationToken, invitationExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) });
  const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/activate?token=${invitationToken}`;
  await sendTemplate('invitation', user.email, { name: user.name, role: ROLE_LABELS[user.role] || user.role, activationUrl });
  await audit({ actorId: req.user.id, action: 'user.invite', entityType: 'user', entityId: user.id, req, metadata: { role: user.role, email: user.email } });
  res.status(201).json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, status: 'Invited', activationUrl } });
}

module.exports = { listCustomers, listTeam, inviteUser };
