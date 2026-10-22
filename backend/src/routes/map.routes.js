const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/map.controller');

router.use(authenticate);
router.get('/locations', asyncHandler(controller.locations));
router.get('/coverage', asyncHandler(controller.coverage));
router.get('/service-visits', asyncHandler(controller.serviceLocations));

module.exports = router;
