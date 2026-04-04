import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { OrderStatus } from '@prisma/client';
import { authenticate } from '@middleware/auth.js';
import { adminAuth } from '@middleware/adminAuth.js';
import { validate } from '@middleware/validate.js';
import * as adminService from '@services/admin.service.js';
import { ok, created, noContent } from '@utils/response.js';

const router: ExpressRouter = Router();
router.use(authenticate);
router.use(adminAuth);

// ─── Products ────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/products:
 *   get:
 *     tags: [Admin]
 *     summary: List all products (paginated, searchable)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated product list
 *       403:
 *         description: Admin access required
 */
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = adminService.AdminPaginationSchema.parse(req.query);
    ok(res, await adminService.listProducts(page, limit, search));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /admin/products:
 *   post:
 *     tags: [Admin]
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug, description, price, categoryId]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               salePrice: { type: number, nullable: true }
 *               stock: { type: integer }
 *               categoryId: { type: string }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Product created
 *       403:
 *         description: Admin access required
 */
router.post(
  '/products',
  validate(adminService.CreateProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      created(res, await adminService.createProduct(req.body as adminService.CreateProductInput));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /admin/products/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a product
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               salePrice: { type: number, nullable: true }
 *               stock: { type: integer }
 *               categoryId: { type: string }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.put(
  '/products/:id',
  validate(adminService.UpdateProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(
        res,
        await adminService.updateProduct(
          req.params.id as string,
          req.body as adminService.UpdateProductInput
        )
      );
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /admin/products/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Soft-delete a product
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await adminService.deleteProduct(req.params.id as string);
    noContent(res);
  } catch (err) {
    next(err);
  }
});

// ─── Orders ──────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: List all orders (paginated, filterable by status)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: status, schema: { type: string, enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED] } }
 *     responses:
 *       200:
 *         description: Paginated order list
 */
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status } = adminService.AdminOrdersQuerySchema.parse(req.query);
    ok(res, await adminService.listOrders(page, limit, status));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /admin/orders/{id}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Update order status
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED] }
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status transition
 *       404:
 *         description: Order not found
 */
router.put(
  '/orders/:id/status',
  validate(adminService.UpdateOrderStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body as { status: OrderStatus };
      ok(res, await adminService.updateOrderStatus(req.params.id as string, status));
    } catch (err) {
      next(err);
    }
  }
);

// ─── Users ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users (paginated, searchable)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated user list
 */
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = adminService.AdminPaginationSchema.parse(req.query);
    ok(res, await adminService.listUsers(page, limit, search));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /admin/users/{id}/block:
 *   put:
 *     tags: [Admin]
 *     summary: Toggle block/unblock user
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: User block status toggled
 *       400:
 *         description: Cannot block admin user
 *       404:
 *         description: User not found
 */
router.put('/users/:id/block', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await adminService.toggleBlockUser(req.params.id as string));
  } catch (err) {
    next(err);
  }
});

// ─── Stats ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard stats
 *     responses:
 *       200:
 *         description: Dashboard statistics (total orders, revenue today, pending orders, active users)
 */
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await adminService.getStats());
  } catch (err) {
    next(err);
  }
});

export default router;
