const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const controller = require('../controllers/customer.controller');

router.get('/', authenticate, requireRole('ADMIN', 'SUPPLIER'), asyncHandler(controller.listCustomers));

module.exports = router;
