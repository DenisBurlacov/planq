import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getProductsHandler,
  getProductHandler,
  getProductStockHandler,
} from '@controllers/products.controller.js';
import * as productsService from '@services/products.service.js';
import * as stockNotificationService from '@services/stockNotification.service.js';
import { ok, created } from '@utils/response.js';

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
 *       - { in: query, name: material, schema: { type: string } }
 *       - { in: query, name: color, schema: { type: string } }
 *       - { in: query, name: style, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses:
 *       200:
 *         description: Paginated list of products
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - id: b1c2d3e4-f5a6-7890-bcde-f12345678901
 *                   name: Nordic Sofa
 *                   slug: nordic-sofa
 *                   price: 899.99
 *                   salePrice: null
 *                   stock: 15
 *                   images: ["https://example.com/sofa.jpg"]
 *                   category:
 *                     id: c1d2e3f4-a5b6-7890-cdef-123456789012
 *                     name: Living Room
 *                 - id: a2b3c4d5-e6f7-8901-abcd-234567890123
 *                   name: Modern Table Lamp
 *                   slug: modern-table-lamp
 *                   price: 59.99
 *                   salePrice: 44.99
 *                   stock: 42
 *                   images: ["https://example.com/lamp.jpg"]
 *                   category:
 *                     id: d2e3f4a5-b6c7-8901-defg-345678901234
 *                     name: Lighting
 *               meta:
 *                 page: 1
 *                 limit: 20
 *                 total: 48
 *                 totalPages: 3
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
 *         content:
 *           application/json:
 *             example:
 *               - id: b1c2d3e4-f5a6-7890-bcde-f12345678901
 *                 name: Nordic Sofa
 *                 price: 899.99
 *                 image: "https://example.com/sofa.jpg"
 *               - id: a2b3c4d5-e6f7-8901-abcd-234567890123
 *                 name: Modern Sofa Set
 *                 price: 1299.99
 *                 image: "https://example.com/sofa-set.jpg"
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
 *         content:
 *           application/json:
 *             example:
 *               id: b1c2d3e4-f5a6-7890-bcde-f12345678901
 *               name: Nordic Sofa
 *               slug: nordic-sofa
 *               description: A comfortable modern sofa with Scandinavian design
 *               price: 899.99
 *               salePrice: null
 *               stock: 15
 *               images: ["https://example.com/sofa.jpg", "https://example.com/sofa-2.jpg"]
 *               rating: 4.5
 *               reviewCount: 12
 *               category:
 *                 id: c1d2e3f4-a5b6-7890-cdef-123456789012
 *                 name: Living Room
 *               createdAt: "2025-01-15T10:30:00.000Z"
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
 *         content:
 *           application/json:
 *             example:
 *               productId: 383bf383-85a4-46ee-99f8-9517b7a588b3
 *               stock: 15
 */
router.get('/:id/stock', getProductStockHandler);

/**
 * @openapi
 * /products/{id}/notify:
 *   post:
 *     tags: [Products]
 *     summary: Subscribe to stock notification for a product
 *     security: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *           example:
 *             email: alice@example.com
 *     responses:
 *       201:
 *         description: Notification subscription created
 *         content:
 *           application/json:
 *             example:
 *               id: sn1a2b3c4-d5e6-7890-abcd-ef1234567890
 *               productId: 383bf383-85a4-46ee-99f8-9517b7a588b3
 *               email: alice@example.com
 *               createdAt: "2025-03-15T12:00:00.000Z"
 *       404:
 *         description: Product not found
 *       409:
 *         description: Already subscribed
 */
router.post('/:id/notify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = stockNotificationService.CreateStockNotificationSchema.parse(req.body);
    const notification = await stockNotificationService.createStockNotification(
      req.params.id as string,
      input.email
    );
    created(res, notification);
  } catch (err) {
    next(err);
  }
});

export default router;
