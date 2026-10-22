const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const controller = require('../controllers/report.controller');

router.get('/sales.csv', authenticate, requireRole('ADMIN', 'SUPPLIER'), asyncHandler(controller.salesCsv));
router.get('/email-health', authenticate, requireRole('ADMIN'), asyncHandler(controller.emailHealth));

module.exports = router;
