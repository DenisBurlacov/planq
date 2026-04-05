import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { OrderStatus } from '@prisma/client';
import { authenticate } from '@middleware/auth.js';
import { adminAuth } from '@middleware/adminAuth.js';
import { managerRestrictions } from '@middleware/managerRestrictions.js';
import { validate } from '@middleware/validate.js';
import { uploadProductImages } from '@middleware/upload.js';
import { getAuthUser } from '@utils/getAuthUser.js';
import * as adminService from '@services/admin.service.js';
import * as auditService from '@services/audit.service.js';
import * as settingsService from '@services/settings.service.js';
import * as schedulerService from '@services/scheduler.service.js';
import { uploadCategoryImage } from '@middleware/upload.js';
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
 *       - { in: query, name: includeDeleted, schema: { type: string, enum: ['true', 'false'] } }
 *     responses:
 *       200:
 *         description: Paginated product list
 *       403:
 *         description: Admin access required
 */
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, includeDeleted } = adminService.AdminProductsQuerySchema.parse(
      req.query
    );
    ok(res, await adminService.listProducts(page, limit, search, includeDeleted));
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
  managerRestrictions,
  validate(adminService.CreateProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await adminService.createProduct(req.body as adminService.CreateProductInput);
      await auditService.logAction(
        getAuthUser(req).userId,
        'product_create',
        'product',
        product.id,
        { name: product.name }
      );
      created(res, product);
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
      const product = await adminService.updateProduct(
        req.params.id as string,
        req.body as adminService.UpdateProductInput
      );
      await auditService.logAction(
        getAuthUser(req).userId,
        'product_update',
        'product',
        product.id,
        req.body as Record<string, unknown>
      );
      ok(res, product);
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
router.delete(
  '/products/:id',
  managerRestrictions,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminService.deleteProduct(req.params.id as string);
      await auditService.logAction(
        getAuthUser(req).userId,
        'product_delete',
        'product',
        req.params.id as string
      );
      noContent(res);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /admin/products/{id}/restore:
 *   put:
 *     tags: [Admin]
 *     summary: Restore a soft-deleted product
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Product restored
 *       404:
 *         description: Product not found
 */
router.put('/products/:id/restore', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await adminService.restoreProduct(req.params.id as string);
    await auditService.logAction(
      getAuthUser(req).userId,
      'product_restore',
      'product',
      req.params.id as string
    );
    ok(res, product);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /admin/products/{id}/images:
 *   post:
 *     tags: [Admin]
 *     summary: Upload product images
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Images uploaded and appended
 *       404:
 *         description: Product not found
 */
router.post(
  '/products/:id/images',
  uploadProductImages,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'NO_FILES', message: 'No files uploaded', statusCode: 400 });
        return;
      }
      const imagePaths = files.map(f => `/uploads/products/${f.filename}`);
      const product = await adminService.appendProductImages(req.params.id as string, imagePaths);
      await auditService.logAction(
        getAuthUser(req).userId,
        'product_images_upload',
        'product',
        req.params.id as string,
        { count: files.length }
      );
      ok(res, product);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /admin/products/bulk:
 *   delete:
 *     tags: [Admin]
 *     summary: Bulk soft-delete products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Products deleted
 */
router.delete(
  '/products/bulk',
  managerRestrictions,
  validate(adminService.BulkDeleteProductsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.body as { ids: string[] };
      const result = await adminService.bulkDeleteProducts(ids);
      await auditService.logAction(
        getAuthUser(req).userId,
        'product_bulk_delete',
        'product',
        undefined,
        { ids, deleted: result.deleted }
      );
      ok(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Orders ──────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: List all orders (paginated, filterable by status and date)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: status, schema: { type: string, enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED] } }
 *       - { in: query, name: dateFrom, schema: { type: string, format: date-time } }
 *       - { in: query, name: dateTo, schema: { type: string, format: date-time } }
 *     responses:
 *       200:
 *         description: Paginated order list
 */
router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, search, dateFrom, dateTo } =
      adminService.AdminOrdersQuerySchema.parse(req.query);
    ok(res, await adminService.listOrders(page, limit, status, search, dateFrom, dateTo));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /admin/orders/export:
 *   get:
 *     tags: [Admin]
 *     summary: Export orders as CSV
 *     parameters:
 *       - { in: query, name: format, schema: { type: string, enum: [csv] } }
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema: { type: string }
 */
router.get('/orders/export', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const csv = await adminService.exportOrdersCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(csv);
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
      const order = await adminService.updateOrderStatus(req.params.id as string, status);
      await auditService.logAction(
        getAuthUser(req).userId,
        'order_status_update',
        'order',
        req.params.id as string,
        { newStatus: status }
      );
      ok(res, order);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /admin/orders/bulk/status:
 *   put:
 *     tags: [Admin]
 *     summary: Bulk update order statuses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids, status]
 *             properties:
 *               ids: { type: array, items: { type: string } }
 *               status: { type: string, enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED] }
 *     responses:
 *       200:
 *         description: Bulk update results
 */
router.put(
  '/orders/bulk/status',
  validate(adminService.BulkUpdateOrderStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids, status } = req.body as { ids: string[]; status: OrderStatus };
      const result = await adminService.bulkUpdateOrderStatus(ids, status);
      await auditService.logAction(
        getAuthUser(req).userId,
        'order_bulk_status_update',
        'order',
        undefined,
        { ids, status }
      );
      ok(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// ─��─ Users ───────────────────────────────────────────────────────────────────

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
router.put(
  '/users/:id/block',
  managerRestrictions,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await adminService.toggleBlockUser(req.params.id as string);
      await auditService.logAction(
        getAuthUser(req).userId,
        user.isBlocked ? 'user_block' : 'user_unblock',
        'user',
        req.params.id as string
      );
      ok(res, user);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Audit Log ──────────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/audit:
 *   get:
 *     tags: [Admin]
 *     summary: Get audit logs (paginated, filterable)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: action, schema: { type: string } }
 *       - { in: query, name: userId, schema: { type: string } }
 *       - { in: query, name: dateFrom, schema: { type: string, format: date-time } }
 *       - { in: query, name: dateTo, schema: { type: string, format: date-time } }
 *     responses:
 *       200:
 *         description: Paginated audit log list
 */
router.get(
  '/audit',
  managerRestrictions,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, action, userId, dateFrom, dateTo } = auditService.AuditQuerySchema.parse(
        req.query
      );
      ok(res, await auditService.listAuditLogs(page, limit, action, userId, dateFrom, dateTo));
    } catch (err) {
      next(err);
    }
  }
);

// ─── Promo Codes ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/promos:
 *   get:
 *     tags: [Admin]
 *     summary: List all promo codes (paginated)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated promo codes list
 */
router.get('/promos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = adminService.AdminPromosQuerySchema.parse(req.query);
    ok(res, await adminService.listPromos(page, limit, search));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /admin/promos:
 *   post:
 *     tags: [Admin]
 *     summary: Create a promo code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discountPercent, validFrom, validUntil, maxUses]
 *             properties:
 *               code: { type: string }
 *               discountPercent: { type: integer }
 *               validFrom: { type: string, format: date-time }
 *               validUntil: { type: string, format: date-time }
 *               minOrderAmount: { type: number, nullable: true }
 *               maxUses: { type: integer }
 *               isActive: { type: boolean }
 *     responses:
 *       201:
 *         description: Promo code created
 */
router.post(
  '/promos',
  managerRestrictions,
  validate(adminService.CreatePromoSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const promo = await adminService.createPromo(req.body as adminService.CreatePromoInput);
      await auditService.logAction(getAuthUser(req).userId, 'promo_create', 'promo', promo.id, {
        code: promo.code,
      });
      created(res, promo);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /admin/promos/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a promo code
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Promo code updated
 */
router.put(
  '/promos/:id',
  managerRestrictions,
  validate(adminService.UpdatePromoSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const promo = await adminService.updatePromo(
        req.params.id as string,
        req.body as adminService.UpdatePromoInput
      );
      await auditService.logAction(
        getAuthUser(req).userId,
        'promo_update',
        'promo',
        promo.id,
        req.body as Record<string, unknown>
      );
      ok(res, promo);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /admin/promos/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a promo code
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204:
 *         description: Promo code deleted
 */
router.delete(
  '/promos/:id',
  managerRestrictions,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminService.deletePromo(req.params.id as string);
      await auditService.logAction(
        getAuthUser(req).userId,
        'promo_delete',
        'promo',
        req.params.id as string
      );
      noContent(res);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Categories (Admin) ────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/categories:
 *   get:
 *     tags: [Admin]
 *     summary: List all categories (paginated)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated categories list
 */
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = adminService.AdminPaginationSchema.parse(req.query);
    ok(res, await adminService.listAdminCategories(page, limit, search));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /admin/categories:
 *   post:
 *     tags: [Admin]
 *     summary: Create a category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               image: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  '/categories',
  managerRestrictions,
  validate(adminService.CreateCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await adminService.createCategory(
        req.body as adminService.CreateCategoryInput
      );
      await auditService.logAction(
        getAuthUser(req).userId,
        'category_create',
        'category',
        category.id,
        { name: category.name }
      );
      created(res, category);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /admin/categories/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a category
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put(
  '/categories/:id',
  managerRestrictions,
  validate(adminService.UpdateCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await adminService.updateCategory(
        req.params.id as string,
        req.body as adminService.UpdateCategoryInput
      );
      await auditService.logAction(
        getAuthUser(req).userId,
        'category_update',
        'category',
        category.id,
        req.body as Record<string, unknown>
      );
      ok(res, category);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /admin/categories/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a category
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204:
 *         description: Category deleted
 *       400:
 *         description: Category has products
 */
router.delete(
  '/categories/:id',
  managerRestrictions,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await adminService.deleteCategory(req.params.id as string);
      await auditService.logAction(
        getAuthUser(req).userId,
        'category_delete',
        'category',
        req.params.id as string
      );
      noContent(res);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /admin/categories/{id}/image:
 *   post:
 *     tags: [Admin]
 *     summary: Upload category image
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category image uploaded
 */
router.post(
  '/categories/:id/image',
  managerRestrictions,
  uploadCategoryImage,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'NO_FILE', message: 'No file uploaded', statusCode: 400 });
        return;
      }
      const imagePath = `/uploads/categories/${file.filename}`;
      const category = await adminService.updateCategory(req.params.id as string, {
        image: imagePath,
      });
      await auditService.logAction(
        getAuthUser(req).userId,
        'category_image_upload',
        'category',
        req.params.id as string
      );
      ok(res, category);
    } catch (err) {
      next(err);
    }
  }
);

// ─── Review Moderation ──────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/reviews:
 *   get:
 *     tags: [Admin]
 *     summary: List all reviews with user and product info
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated reviews list
 */
router.get('/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = adminService.AdminReviewsQuerySchema.parse(req.query);
    ok(res, await adminService.listAdminReviews(page, limit, search));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /admin/reviews/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Soft-delete a review
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204:
 *         description: Review deleted
 *       404:
 *         description: Review not found
 */
router.delete('/reviews/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await adminService.deleteReview(req.params.id as string);
    await auditService.logAction(
      getAuthUser(req).userId,
      'review_delete',
      'review',
      req.params.id as string
    );
    noContent(res);
  } catch (err) {
    next(err);
  }
});

// ─── Store Settings ─────────────────────────────────────────────────────────

/**
 * @openapi
 * /admin/settings:
 *   get:
 *     tags: [Admin]
 *     summary: List all store settings
 *     responses:
 *       200:
 *         description: List of key-value settings
 */
router.get('/settings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await settingsService.listSettings());
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /admin/settings:
 *   put:
 *     tags: [Admin]
 *     summary: Update store settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [settings]
 *             properties:
 *               settings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key: { type: string }
 *                     value: { type: string }
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.put(
  '/settings',
  managerRestrictions,
  validate(settingsService.UpdateSettingsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { settings } = req.body as settingsService.UpdateSettingsInput;
      const updated = await settingsService.updateSettings(settings);
      await auditService.logAction(
        getAuthUser(req).userId,
        'settings_update',
        'settings',
        undefined,
        { keys: settings.map(s => s.key) }
      );
      ok(res, updated);
    } catch (err) {
      next(err);
    }
  }
);

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

/**
 * @openapi
 * /admin/stats/revenue-chart:
 *   get:
 *     tags: [Admin]
 *     summary: Daily revenue for last 30 days
 *     responses:
 *       200:
 *         description: Array of { date, revenue } for each day
 */
router.get('/stats/revenue-chart', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await adminService.getRevenueChart());
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /admin/stats/top-products:
 *   get:
 *     tags: [Admin]
 *     summary: Top 10 products by revenue
 *     responses:
 *       200:
 *         description: Array of { product, totalRevenue, totalOrders }
 */
router.get('/stats/top-products', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await adminService.getTopProducts());
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /admin/stats/orders-by-status:
 *   get:
 *     tags: [Admin]
 *     summary: Order count per status
 *     responses:
 *       200:
 *         description: Object with status keys and count values
 */
router.get('/stats/orders-by-status', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await adminService.getOrdersByStatus());
  } catch (err) {
    next(err);
  }
});

// ─── Notification Scheduler ────────────────────────────────────────────────

/**
 * @openapi
 * /admin/scheduler/restart:
 *   post:
 *     tags: [Admin]
 *     summary: Restart the notification scheduler with current settings
 *     responses:
 *       200:
 *         description: Scheduler restarted
 */
router.post(
  '/scheduler/restart',
  managerRestrictions,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schedulerService.restartScheduler();
      await auditService.logAction(
        getAuthUser(req).userId,
        'scheduler_restart',
        'settings',
        undefined,
        result as unknown as Record<string, unknown>
      );
      ok(res, result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
