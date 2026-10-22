const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/dashboard.controller');

router.get('/summary', authenticate, asyncHandler(controller.summary));

module.exports = router;
