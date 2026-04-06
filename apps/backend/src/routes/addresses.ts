import { Router, type Router as ExpressRouter } from 'express';
import { getAuthUser } from '@utils/getAuthUser.js';
import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';
import { authenticate } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
import * as addressesService from '@services/addresses.service.js';
import { ok, created, noContent } from '@utils/response.js';

const router: ExpressRouter = Router();
router.use(authenticate);

/**
 * @openapi
 * /addresses:
 *   get:
 *     tags: [Addresses]
 *     summary: List user's addresses
 *     responses:
 *       200:
 *         description: List of addresses
 *         content:
 *           application/json:
 *             example:
 *               - id: f1a2b3c4-d5e6-7890-abcd-ef1234567890
 *                 label: Home
 *                 street: 123 Main St
 *                 city: New York
 *                 state: NY
 *                 zip: "10001"
 *                 country: US
 *                 isDefault: true
 *               - id: a9b8c7d6-e5f4-3210-abcd-ef0987654321
 *                 label: Work
 *                 street: 456 Office Blvd
 *                 city: San Francisco
 *                 state: CA
 *                 zip: "94105"
 *                 country: US
 *                 isDefault: false
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await addressesService.listAddresses(getAuthUser(req).userId));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /addresses:
 *   post:
 *     tags: [Addresses]
 *     summary: Create a new address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             label: Home
 *             street: 123 Main St
 *             city: New York
 *             state: NY
 *             zip: "10001"
 *             country: US
 *     responses:
 *       201:
 *         description: Address created
 *         content:
 *           application/json:
 *             example:
 *               id: f1a2b3c4-d5e6-7890-abcd-ef1234567890
 *               label: Home
 *               street: 123 Main St
 *               city: New York
 *               state: NY
 *               zip: "10001"
 *               country: US
 *               isDefault: false
 */
router.post(
  '/',
  validate(addressesService.CreateAddressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      created(
        res,
        await addressesService.createAddress(
          getAuthUser(req).userId,
          req.body as z.infer<typeof addressesService.CreateAddressSchema>
        )
      );
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /addresses/{id}:
 *   put:
 *     tags: [Addresses]
 *     summary: Update an address
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             label: Home Updated
 *             street: 789 New St
 *             city: Brooklyn
 *             state: NY
 *             zip: "11201"
 *     responses:
 *       200:
 *         description: Address updated
 *         content:
 *           application/json:
 *             example:
 *               id: f1a2b3c4-d5e6-7890-abcd-ef1234567890
 *               label: Home Updated
 *               street: 789 New St
 *               city: Brooklyn
 *               state: NY
 *               zip: "11201"
 *               country: US
 *               isDefault: true
 */
router.put(
  '/:id',
  validate(addressesService.UpdateAddressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(
        res,
        await addressesService.updateAddress(
          getAuthUser(req).userId,
          req.params.id as string,
          req.body as z.infer<typeof addressesService.UpdateAddressSchema>
        )
      );
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /addresses/{id}:
 *   delete:
 *     tags: [Addresses]
 *     summary: Delete an address
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204:
 *         description: Address deleted
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await addressesService.deleteAddress(getAuthUser(req).userId, req.params.id as string);
    noContent(res);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /addresses/{id}/default:
 *   put:
 *     tags: [Addresses]
 *     summary: Set address as default
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Address set as default
 *         content:
 *           application/json:
 *             example:
 *               id: f1a2b3c4-d5e6-7890-abcd-ef1234567890
 *               label: Home
 *               street: 123 Main St
 *               city: New York
 *               state: NY
 *               zip: "10001"
 *               country: US
 *               isDefault: true
 */
router.put('/:id/default', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await addressesService.setDefault(getAuthUser(req).userId, req.params.id as string));
  } catch (err) {
    next(err);
  }
});

export default router;
