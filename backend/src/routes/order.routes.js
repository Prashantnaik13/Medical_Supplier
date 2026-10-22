const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const controller = require('../controllers/order.controller');

router.use(authenticate);
router.get('/', asyncHandler(controller.listOrders));
router.post('/', requireRole('BUYER'), asyncHandler(controller.createOrder));
router.get('/:id', asyncHandler(controller.getOrder));
router.patch('/:id/status', requireRole('ADMIN', 'SUPPLIER', 'FULFILLMENT'), asyncHandler(controller.updateOrderStatus));
router.patch('/:id/assign', requireRole('ADMIN', 'SUPPLIER'), asyncHandler(controller.assignOrder));
router.post('/:id/cancel', requireRole('BUYER'), asyncHandler(controller.cancelOwnOrder));

module.exports = router;
