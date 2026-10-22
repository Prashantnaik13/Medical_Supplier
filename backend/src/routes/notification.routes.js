const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/notification.controller');

router.use(authenticate);
router.get('/', asyncHandler(controller.listNotifications));
router.patch('/read-all', asyncHandler(controller.markAllRead));
router.patch('/:id/read', asyncHandler(controller.markRead));
router.post('/', asyncHandler(controller.createTestNotification));

module.exports = router;
