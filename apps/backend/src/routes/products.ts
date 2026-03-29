import { Router, type Router as ExpressRouter } from 'express';
import {
  getProductsHandler,
  getProductHandler,
  getProductStockHandler,
} from '@controllers/products.controller.js';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get paginated product list
 *     security: []
 *     parameters:
 *       - { in: query, name: categoryId, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: minPrice, schema: { type: number } }
 *       - { in: query, name: maxPrice, schema: { type: number } }
 *       - { in: query, name: inStock, schema: { type: boolean } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses:
 *       200:
 *         description: Paginated list of products
 */
router.get('/', getProductsHandler);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     security: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProductHandler);

/**
 * @openapi
 * /products/{id}/stock:
 *   get:
 *     tags: [Products]
 *     summary: Get product stock (polling endpoint)
 *     security: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Current stock count
 */
router.get('/:id/stock', getProductStockHandler);

export default router;
