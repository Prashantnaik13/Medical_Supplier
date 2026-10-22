const { EmailLog } = require('../models');
const { sendTemplate } = require('./email.service');

// A small explicit outbox seam: all message sends are logged and can later be
// moved to a durable worker (BullMQ/SQS) without changing domain controllers.
async function queueTemplateEmail(template, to, values, options = {}) {
  if (!to) return null;
  return sendTemplate(template, to, values, options);
}

async function deliveryHealth() {
  const counts = await EmailLog.findAll({ attributes: ['status', [require('sequelize').fn('COUNT', '*'), 'count']], group: ['status'], raw: true });
  return Object.fromEntries(counts.map((item) => [item.status, Number(item.count)]));
}

module.exports = { queueTemplateEmail, deliveryHealth };
