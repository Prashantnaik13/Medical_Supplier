const { Notification } = require('../models');
const { fail } = require('../utils/http');
const { z } = require('zod');

async function listNotifications(req, res) {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
  const rows = await Notification.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit });
  res.json({ success: true, data: { rows: rows.map((row) => ({ ...row.get({ plain: true }), read: Boolean(row.readAt), time: row.createdAt })), unreadCount: rows.filter((row) => !row.readAt).length } });
}

async function markRead(req, res) {
  const notification = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!notification) throw fail(404, 'Notification not found.');
  if (!notification.readAt) await notification.update({ readAt: new Date() });
  res.json({ success: true, data: { id: notification.id, read: true } });
}

async function markAllRead(req, res) {
  const result = await Notification.update({ readAt: new Date() }, { where: { userId: req.user.id, readAt: null } });
  res.json({ success: true, data: { updated: result[0] } });
}

async function createTestNotification(req, res) {
  const body = z.object({ title: z.string().trim().min(2).max(160), body: z.string().trim().min(2).max(800), type: z.enum(['order', 'delivery', 'inventory', 'service', 'invoice', 'system']).default('system') }).parse(req.body);
  const row = await Notification.create({ ...body, userId: req.user.id });
  res.status(201).json({ success: true, data: { ...row.get({ plain: true }), read: false } });
}

module.exports = { listNotifications, markRead, markAllRead, createTestNotification };
