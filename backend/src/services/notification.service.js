const { Notification, User } = require('../models');
const { sendTemplate, sendEmail } = require('./email.service');

async function createNotification({ userId, title, body, type = 'system', link = null, metadata = null, email = null }) {
  const notification = await Notification.create({ userId, title, body, type, link, metadata });
  if (email?.to) {
    await sendEmail({ to: email.to, subject: email.subject || title, html: email.html || `<p>${body}</p>`, template: email.template || type, attachments: email.attachments || [], metadata: { notificationId: notification.id, ...(metadata || {}) } });
  }
  return notification;
}

async function notifyUser(user, { title, body, type = 'system', link, template, emailValues = {}, attachments = [] }) {
  if (!user) return null;
  const notification = await Notification.create({ userId: user.id, title, body, type, link, metadata: emailValues });
  if (user.email) {
    if (template) {
      const message = await require('./email.service').sendTemplate(template, user.email, emailValues, { attachments, metadata: { notificationId: notification.id } });
      return { notification, email: message };
    }
    await sendEmail({ to: user.email, subject: title, html: `<p>${body}</p>`, template: type, attachments, metadata: { notificationId: notification.id } });
  }
  return { notification };
}

async function notifyRoles(roles, { title, body, type = 'system', link }) {
  const recipients = await User.findAll({ where: { role: roles, isActive: true }, attributes: ['id', 'email', 'name'] });
  return Promise.all(recipients.map((user) => createNotification({ userId: user.id, title, body, type, link })));
}

async function notifyOrderPlaced(order, invoicePath) {
  const buyer = await User.findByPk(order.userId, { attributes: ['id', 'name', 'email'] });
  if (buyer) {
    const attachments = invoicePath ? [{ filename: `${order.invoice?.invoiceNumber || order.orderNumber}.pdf`, path: invoicePath, contentType: 'application/pdf' }] : [];
    await notifyUser(buyer, {
      title: 'Order confirmed', body: `Order ${order.orderNumber} was placed. Your Medora team is preparing it for dispatch.`, type: 'order', link: `/orders/${order.id}`,
      template: 'orderPlaced', emailValues: { name: buyer.name, orderNumber: order.orderNumber, total: order.total, expectedDelivery: order.expectedDelivery }, attachments,
    });
  }
  await notifyRoles(['ADMIN', 'SUPPLIER'], { title: 'New customer order', body: `${order.buyerOrg || 'A healthcare partner'} placed order ${order.orderNumber}.`, type: 'order', link: `/orders/${order.id}` });
}

async function notifyOrderStatus(order, status) {
  const buyer = await User.findByPk(order.userId, { attributes: ['id', 'name', 'email'] });
  if (buyer) await notifyUser(buyer, { title: 'Order status updated', body: `Order ${order.orderNumber} is now ${String(status).replaceAll('_', ' ').toLowerCase()}.`, type: 'delivery', link: `/orders/${order.id}`, template: 'orderStatus', emailValues: { name: buyer.name, orderNumber: order.orderNumber, status } });
}

module.exports = { createNotification, notifyUser, notifyRoles, notifyOrderPlaced, notifyOrderStatus };
