const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { fail } = require('../utils/http');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw fail(401, 'Authentication required.');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub, { attributes: { exclude: ['passwordHash', 'invitationToken'] } });
    if (!user || !user.isActive) throw fail(401, 'This account is inactive or no longer exists.');
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return next(fail(401, 'Your session has expired. Please sign in again.'));
    return next(error);
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  return authenticate(req, res, next);
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(fail(401, 'Authentication required.'));
    if (!roles.includes(req.user.role)) return next(fail(403, 'You do not have permission to perform this action.'));
    next();
  };
}

module.exports = { authenticate, optionalAuth, requireRole };
