const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const { z } = require('zod');
const { User, Organization, sequelize } = require('../models');
const { fail } = require('../utils/http');
const { sendTemplate } = require('../services/email.service');
const { audit } = require('../services/audit.service');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(190),
  password: z.string().min(10).max(120),
  organization: z.string().trim().min(2).max(160),
  phone: z.string().trim().max(25).optional(),
  gstin: z.string().trim().max(15).optional(),
});
const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(120) });
const activateSchema = z.object({ token: z.string().min(20), password: z.string().min(10).max(120) });

function safeUser(user) {
  const row = user.get ? user.get({ plain: true }) : { ...user };
  const organization = row.organizationRecord || row.organization || null;
  delete row.passwordHash;
  delete row.invitationToken;
  delete row.invitationExpiresAt;
  delete row.organizationRecord;
  return { ...row, organization: organization?.name || row.organizationName || '', gstin: row.gstin || organization?.gstin || null };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '12h', issuer: 'medora-api', audience: 'medora-web' });
}

async function register(req, res) {
  const body = registerSchema.parse(req.body);
  const email = body.email.toLowerCase();
  if (await User.findOne({ where: { email } })) throw fail(409, 'An account already uses that email. Please sign in instead.');
  const passwordHash = await bcrypt.hash(body.password, 12);
  const result = await sequelize.transaction(async (transaction) => {
    const organization = await Organization.create({ name: body.organization, type: 'BUYER', gstin: body.gstin || null, email, phone: body.phone || null }, { transaction });
    const user = await User.create({ name: body.name, email, passwordHash, phone: body.phone || null, gstin: body.gstin || null, organizationId: organization.id, role: 'BUYER', isActive: true }, { transaction });
    return { user, organization };
  });
  const userView = { ...result.user.get({ plain: true }), organizationRecord: result.organization.get({ plain: true }) };
  await sendTemplate('welcome', result.user.email, { name: result.user.name });
  await audit({ actorId: result.user.id, action: 'account.register', entityType: 'user', entityId: result.user.id, req });
  res.status(201).json({ success: true, data: { token: signToken(result.user), user: safeUser(userView) } });
}

async function login(req, res) {
  const body = loginSchema.parse(req.body);
  const user = await User.findOne({ where: { email: body.email.toLowerCase() }, include: [{ model: Organization, as: 'organizationRecord' }] });
  if (!user || !user.passwordHash || !(await bcrypt.compare(body.password, user.passwordHash))) throw fail(401, 'Email or password is incorrect.');
  if (!user.isActive) throw fail(403, 'This account is not active. Ask your administrator for access.');
  await user.update({ lastLoginAt: new Date() });
  await audit({ actorId: user.id, action: 'auth.login', entityType: 'user', entityId: user.id, req });
  res.json({ success: true, data: { token: signToken(user), user: safeUser(user) } });
}

async function me(req, res) {
  const user = await User.findByPk(req.user.id, { include: [{ model: Organization, as: 'organizationRecord' }] });
  res.json({ success: true, data: safeUser(user) });
}

async function activateInvitation(req, res) {
  const body = activateSchema.parse(req.body);
  const user = await User.findOne({ where: { invitationToken: body.token } });
  if (!user || !user.invitationExpiresAt || user.invitationExpiresAt < new Date()) throw fail(400, 'This invitation link is invalid or expired. Ask your administrator to send another.');
  await user.update({ passwordHash: await bcrypt.hash(body.password, 12), invitationToken: null, invitationExpiresAt: null, isActive: true });
  await sendTemplate('welcome', user.email, { name: user.name });
  await audit({ actorId: user.id, action: 'account.activate', entityType: 'user', entityId: user.id, req });
  res.json({ success: true, data: { token: signToken(user), user: safeUser(user) } });
}

async function requestPasswordReset(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) throw fail(422, 'Enter a valid work email.');
  const user = await User.findOne({ where: { email, isActive: true } });
  // Always return the same response to avoid leaking registered email addresses.
  if (user) {
    const token = crypto.randomBytes(28).toString('hex');
    await user.update({ invitationToken: token, invitationExpiresAt: new Date(Date.now() + 60 * 60 * 1000) });
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await sendTemplate('invitation', user.email, { name: user.name, role: 'password reset', activationUrl: url });
  }
  res.json({ success: true, message: 'If that email is registered, password reset instructions will be sent.' });
}

module.exports = { register, login, me, activateInvitation, requestPasswordReset, safeUser };
