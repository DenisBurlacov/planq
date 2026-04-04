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
 */
router.put('/:id/default', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await addressesService.setDefault(getAuthUser(req).userId, req.params.id as string));
  } catch (err) {
    next(err);
  }
});

export default router;
