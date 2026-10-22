const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const controller = require('../controllers/settings.controller');

router.get('/profile', authenticate, asyncHandler(controller.getProfile));
router.put('/profile', authenticate, requireRole('ADMIN', 'SUPPLIER', 'BUYER', 'FULFILLMENT'), asyncHandler(controller.updateProfile));

module.exports = router;
