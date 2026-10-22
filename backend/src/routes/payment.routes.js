const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const controller = require('../controllers/payment.controller');

router.use(authenticate);
router.post('/razorpay/verify', asyncHandler(controller.verifyRazorpay));
router.get('/orders/:orderId', asyncHandler(controller.listOrderPayments));
router.patch('/orders/:orderId/manual', requireRole('ADMIN', 'SUPPLIER'), asyncHandler(controller.recordManualPayment));

module.exports = router;
