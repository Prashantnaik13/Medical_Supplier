const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const controller = require('../controllers/customer.controller');

router.get('/', authenticate, requireRole('ADMIN'), asyncHandler(controller.listTeam));
router.post('/invite', authenticate, requireRole('ADMIN'), asyncHandler(controller.inviteUser));

module.exports = router;
