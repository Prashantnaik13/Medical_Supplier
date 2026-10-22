const { AuditLog } = require('../models');

async function audit({ actorId, action, entityType, entityId, req, metadata = {} }) {
  try {
    return await AuditLog.create({
      actorId: actorId || null,
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || null,
      userAgent: req?.headers?.['user-agent'] || null,
      metadata,
    });
  } catch (error) {
    console.error('[audit:failed]', error.message);
    return null;
  }
}

module.exports = { audit };
