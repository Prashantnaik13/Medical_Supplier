const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const controller = require('../controllers/service.controller');

router.get('/', asyncHandler(controller.listServices));
router.get('/bookings', authenticate, asyncHandler(controller.listBookings));
router.post('/bookings', authenticate, requireRole('BUYER'), asyncHandler(controller.createBooking));
router.patch('/bookings/:id', authenticate, requireRole('ADMIN', 'SUPPLIER'), asyncHandler(controller.updateBooking));

module.exports = router;
