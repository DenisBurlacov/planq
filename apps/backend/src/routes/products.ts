import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getProductsHandler,
  getProductHandler,
  getProductStockHandler,
} from '@controllers/products.controller.js';
import * as productsService from '@services/products.service.js';
import { ok } from '@utils/response.js';

const router: ExpressRouter = Router();

const SuggestSchema = z.object({
  q: z.string().min(1),
});

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
 * /products/suggest:
 *   get:
 *     tags: [Products]
 *     summary: Autocomplete product search
 *     security: []
 *     parameters:
 *       - { in: query, name: q, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Top 5 matching products
 */
router.get('/suggest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = SuggestSchema.parse(req.query);
    ok(res, await productsService.suggestProducts(q));
  } catch (err) {
    next(err);
  }
});

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
