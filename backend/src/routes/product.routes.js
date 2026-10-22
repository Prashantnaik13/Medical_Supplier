const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth');
const controller = require('../controllers/product.controller');

router.get('/', asyncHandler(controller.listProducts));
router.get('/categories', asyncHandler(controller.getCategories));
router.get('/:id', asyncHandler(controller.getProduct));
router.post('/', authenticate, requireRole('ADMIN', 'SUPPLIER'), asyncHandler(controller.createProduct));
router.patch('/:id', authenticate, requireRole('ADMIN', 'SUPPLIER'), asyncHandler(controller.updateProduct));
router.patch('/:id/stock', authenticate, requireRole('ADMIN', 'SUPPLIER', 'FULFILLMENT'), asyncHandler(controller.adjustStock));
router.delete('/:id', authenticate, requireRole('ADMIN', 'SUPPLIER'), asyncHandler(controller.deactivateProduct));

module.exports = router;
