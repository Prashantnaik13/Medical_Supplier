const { Op } = require('sequelize');
const { z } = require('zod');
const { Product, Category, sequelize } = require('../models');
const { fail } = require('../utils/http');
const { serializeProduct } = require('../services/orderFormat.service');
const { audit } = require('../services/audit.service');
const { notifyRoles } = require('../services/notification.service');

const productSchema = z.object({
  sku: z.string().trim().min(2).max(60), name: z.string().trim().min(2).max(180),
  brand: z.string().trim().max(120).optional().nullable(), description: z.string().max(5000).optional().nullable(),
  category: z.string().trim().min(2).max(100).optional(), categoryId: z.string().uuid().optional().nullable(),
  unit: z.string().trim().min(1).max(80).default('piece'), price: z.coerce.number().min(0).max(99999999),
  mrp: z.coerce.number().min(0).max(99999999).optional().nullable(), gstRate: z.coerce.number().min(0).max(28).default(12),
  stock: z.coerce.number().int().min(0).default(0), reorderLevel: z.coerce.number().int().min(0).default(10),
  expiryDate: z.string().optional().nullable(), batchNumber: z.string().max(80).optional().nullable(), imageUrl: z.string().max(500).optional().nullable(),
  art: z.string().max(50).optional().nullable(), badge: z.string().max(60).optional().nullable(), isFeatured: z.boolean().optional().default(false), isActive: z.boolean().optional().default(true),
});

const includeCategory = [{ model: Category, as: 'categoryRecord', attributes: ['id', 'name', 'slug'] }];
function slugify(value) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

async function findOrCreateCategory({ categoryId, category }, transaction) {
  if (categoryId) {
    const found = await Category.findByPk(categoryId, { transaction });
    if (!found) throw fail(422, 'Product category does not exist.');
    return found;
  }
  if (!category) return null;
  const slug = slugify(category);
  const [record] = await Category.findOrCreate({ where: { slug }, defaults: { name: category, slug }, transaction });
  return record;
}

async function listProducts(req, res) {
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.limit || 40)));
  const where = { isActive: true };
  if (req.query.q) where[Op.or] = [{ name: { [Op.like]: `%${req.query.q}%` } }, { sku: { [Op.like]: `%${req.query.q}%` } }, { brand: { [Op.like]: `%${req.query.q}%` } }];
  if (req.query.inStock === 'true') where.stock = { [Op.gt]: 0 };
  const include = [...includeCategory];
  if (req.query.category) include[0].where = { slug: req.query.category };
  const { count, rows } = await Product.findAndCountAll({ where, include, order: [['isFeatured', 'DESC'], ['name', 'ASC']], limit: pageSize, offset: (page - 1) * pageSize, distinct: true });
  res.json({ success: true, data: { rows: rows.map(serializeProduct), page, pageSize, total: count } });
}

async function getCategories(req, res) {
  const rows = await Category.findAll({ where: { isActive: true }, order: [['sortOrder', 'ASC'], ['name', 'ASC']] });
  res.json({ success: true, data: rows });
}

async function getProduct(req, res) {
  const product = await Product.findByPk(req.params.id, { include: includeCategory });
  if (!product || !product.isActive) throw fail(404, 'Product not found.');
  res.json({ success: true, data: serializeProduct(product) });
}

async function createProduct(req, res) {
  const body = productSchema.parse(req.body);
  const product = await sequelize.transaction(async (transaction) => {
    const categoryRecord = await findOrCreateCategory(body, transaction);
    return Product.create({ ...body, categoryId: categoryRecord?.id || null, mrp: body.mrp ?? body.price }, { transaction });
  });
  await audit({ actorId: req.user.id, action: 'product.create', entityType: 'product', entityId: product.id, req, metadata: { sku: product.sku } });
  const result = await Product.findByPk(product.id, { include: includeCategory });
  res.status(201).json({ success: true, data: serializeProduct(result) });
}

async function updateProduct(req, res) {
  const body = productSchema.partial().parse(req.body);
  const product = await Product.findByPk(req.params.id);
  if (!product) throw fail(404, 'Product not found.');
  const categoryRecord = body.category || body.categoryId ? await findOrCreateCategory(body) : null;
  const next = { ...body };
  if (categoryRecord) next.categoryId = categoryRecord.id;
  delete next.category;
  await product.update(next);
  await audit({ actorId: req.user.id, action: 'product.update', entityType: 'product', entityId: product.id, req, metadata: { changed: Object.keys(body) } });
  const result = await Product.findByPk(product.id, { include: includeCategory });
  res.json({ success: true, data: serializeProduct(result) });
}

async function adjustStock(req, res) {
  const body = z.object({ delta: z.coerce.number().int().min(-100000).max(100000).refine((value) => value !== 0), reason: z.string().trim().min(2).max(160) }).parse(req.body);
  const product = await sequelize.transaction(async (transaction) => {
    const row = await Product.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!row) throw fail(404, 'Product not found.');
    const nextStock = Number(row.stock) + body.delta;
    if (nextStock < 0) throw fail(409, 'Stock cannot go below zero.');
    await row.update({ stock: nextStock }, { transaction });
    return row;
  });
  await audit({ actorId: req.user.id, action: 'inventory.adjust', entityType: 'product', entityId: product.id, req, metadata: { delta: body.delta, reason: body.reason, stock: product.stock } });
  if (Number(product.stock) <= Number(product.reorderLevel)) await notifyRoles(['ADMIN', 'SUPPLIER'], { title: 'Low stock alert', body: `${product.name} is below its reorder point (${product.stock} left).`, type: 'inventory', link: '/inventory' });
  res.json({ success: true, data: serializeProduct(await Product.findByPk(product.id, { include: includeCategory })) });
}

async function deactivateProduct(req, res) {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw fail(404, 'Product not found.');
  await product.update({ isActive: false });
  await audit({ actorId: req.user.id, action: 'product.deactivate', entityType: 'product', entityId: product.id, req });
  res.json({ success: true, message: 'Product archived.' });
}

module.exports = { listProducts, getCategories, getProduct, createProduct, updateProduct, adjustStock, deactivateProduct, productSchema };
