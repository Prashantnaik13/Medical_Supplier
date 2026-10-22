const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const controller = require('../controllers/invoice.controller');

router.use(authenticate);
router.get('/', requireRole('ADMIN', 'SUPPLIER', 'BUYER'), asyncHandler(controller.listInvoices));
router.get('/:orderId/pdf', requireRole('ADMIN', 'SUPPLIER', 'BUYER'), asyncHandler(controller.downloadInvoice));
router.get('/:orderId', requireRole('ADMIN', 'SUPPLIER', 'BUYER'), asyncHandler(controller.getInvoice));

module.exports = router;
