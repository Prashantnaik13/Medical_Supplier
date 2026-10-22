const { Op } = require('sequelize');
const { z } = require('zod');
const { sequelize, User, Organization } = require('../models');
const { fail } = require('../utils/http');
const { audit } = require('../services/audit.service');

const accountSchema = z.object({
  accountName: z.string().trim().min(2).max(120).optional(),
  accountEmail: z.string().trim().email().max(190).optional(),
  accountPhone: z.string().trim().max(25).optional(),
});
const organizationSchema = z.object({
  organization: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(190),
  phone: z.string().trim().max(25).optional().default(''),
  gstin: z.string().trim().max(15).optional().default(''),
  address: z.string().trim().max(300).optional().default(''),
  city: z.string().trim().max(80).optional().default(''),
  state: z.string().trim().max(80).optional().default('Maharashtra'),
  pincode: z.string().trim().max(10).optional().default(''),
  notifications: z.object({ orders: z.boolean().optional(), inventory: z.boolean().optional(), services: z.boolean().optional(), billing: z.boolean().optional() }).optional(),
});

function serializeProfile(user, organization) {
  return {
    accountName: user.name,
    accountEmail: user.email,
    accountPhone: user.phone || '',
    organization: organization?.name || '',
    email: organization?.email || user.email,
    phone: organization?.phone || user.phone || '',
    gstin: organization?.gstin || user.gstin || '',
    address: organization?.address || '',
    city: organization?.city || '',
    state: organization?.state || '',
    pincode: organization?.pincode || '',
    notifications: organization?.preferences?.notifications || { orders: true, inventory: true, services: true, billing: false },
  };
}

async function updateAccount(user, body, transaction) {
  const accountName = body.accountName || user.name;
  const accountEmail = (body.accountEmail || user.email).toLowerCase();
  const accountPhone = body.accountPhone ?? user.phone ?? '';
  const existingUser = await User.findOne({ where: { email: accountEmail, id: { [Op.ne]: user.id } }, transaction });
  if (existingUser) throw fail(409, 'Another Medora user already uses that email address.');
  await user.update({ name: accountName, email: accountEmail, phone: accountPhone || null }, { transaction });
  return user;
}

async function getProfile(req, res) {
  const user = await User.findByPk(req.user.id, { include: [{ model: Organization, as: 'organizationRecord' }] });
  if (!user) throw fail(404, 'Account not found.');
  res.json({ success: true, data: serializeProfile(user, user.organizationRecord) });
}

async function updateProfile(req, res) {
  const account = accountSchema.parse(req.body);
  if (req.user.role === 'FULFILLMENT') {
    const result = await sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(req.user.id, { transaction });
      if (!user) throw fail(404, 'Account not found.');
      await updateAccount(user, account, transaction);
      const organization = user.organizationId ? await Organization.findByPk(user.organizationId, { transaction }) : null;
      return { user, organization };
    });
    await audit({ actorId: result.user.id, action: 'settings.account.update', entityType: 'user', entityId: result.user.id, req });
    return res.json({ success: true, data: serializeProfile(result.user, result.organization) });
  }

  const body = organizationSchema.parse(req.body);
  const result = await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(req.user.id, { transaction });
    if (!user) throw fail(404, 'Account not found.');
    await updateAccount(user, account, transaction);

    let organization = user.organizationId ? await Organization.findByPk(user.organizationId, { transaction }) : null;
    if (!organization) {
      organization = await Organization.create({
        name: body.organization,
        type: user.role === 'BUYER' ? 'BUYER' : 'SUPPLIER',
        email: body.email,
        phone: body.phone,
        gstin: body.gstin,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        preferences: { notifications: body.notifications || {} },
      }, { transaction });
      await user.update({ organizationId: organization.id }, { transaction });
    } else {
      await organization.update({
        name: body.organization,
        email: body.email,
        phone: body.phone,
        gstin: body.gstin,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        preferences: { ...(organization.preferences || {}), notifications: body.notifications || organization.preferences?.notifications || {} },
      }, { transaction });
    }
    return { user, organization };
  });

  await audit({ actorId: result.user.id, action: 'settings.profile.update', entityType: 'organization', entityId: result.organization.id, req });
  res.json({ success: true, data: serializeProfile(result.user, result.organization) });
}

module.exports = { getProfile, updateProfile };
