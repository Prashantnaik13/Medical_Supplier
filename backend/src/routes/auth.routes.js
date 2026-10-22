const router = require('express').Router();
const { rateLimit } = require('express-rate-limit');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/auth.controller');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many attempts. Please wait and try again.' } });
router.post('/register', authLimiter, asyncHandler(controller.register));
router.post('/login', authLimiter, asyncHandler(controller.login));
router.post('/password/reset', authLimiter, asyncHandler(controller.requestPasswordReset));
router.post('/activate', authLimiter, asyncHandler(controller.activateInvitation));
router.get('/me', authenticate, asyncHandler(controller.me));

module.exports = router;
