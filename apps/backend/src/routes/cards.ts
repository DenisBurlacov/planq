import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
import { getAuthUser } from '@utils/getAuthUser.js';
import * as cardsService from '@services/cards.service.js';
import { ok, created, noContent } from '@utils/response.js';

const router: ExpressRouter = Router();
router.use(authenticate);

/**
 * @openapi
 * /cards:
 *   get:
 *     tags: [Cards]
 *     summary: List saved payment cards
 *     responses:
 *       200:
 *         description: List of saved cards
 *         content:
 *           application/json:
 *             example:
 *               - id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                 last4: "4242"
 *                 brand: VISA
 *                 cardholderName: Alice Johnson
 *                 expMonth: 12
 *                 expYear: 2028
 *                 isDefault: true
 *               - id: b2c3d4e5-f6a7-8901-bcde-f23456789012
 *                 last4: "1234"
 *                 brand: MASTERCARD
 *                 cardholderName: Alice Johnson
 *                 expMonth: 6
 *                 expYear: 2027
 *                 isDefault: false
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await cardsService.listCards(getAuthUser(req).userId));
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /cards:
 *   post:
 *     tags: [Cards]
 *     summary: Save a new payment card
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cardNumber, cardholderName, expMonth, expYear]
 *             properties:
 *               cardNumber: { type: string }
 *               cardholderName: { type: string }
 *               expMonth: { type: integer }
 *               expYear: { type: integer }
 *           example:
 *             cardNumber: "4242424242424242"
 *             cardholderName: John Doe
 *             expMonth: 12
 *             expYear: 2028
 *     responses:
 *       201:
 *         description: Card saved (only last4 and brand stored)
 *         content:
 *           application/json:
 *             example:
 *               id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *               last4: "4242"
 *               brand: VISA
 *               cardholderName: John Doe
 *               expMonth: 12
 *               expYear: 2028
 *               isDefault: false
 *       400:
 *         description: Max cards limit reached
 */
router.post(
  '/',
  validate(cardsService.CreateCardSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      created(
        res,
        await cardsService.createCard(
          getAuthUser(req).userId,
          req.body as cardsService.CreateCardInput
        )
      );
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /cards/{id}:
 *   delete:
 *     tags: [Cards]
 *     summary: Delete a saved card
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204:
 *         description: Card deleted
 *       404:
 *         description: Card not found
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cardsService.deleteCard(getAuthUser(req).userId, req.params.id as string);
    noContent(res);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /cards/{id}/default:
 *   put:
 *     tags: [Cards]
 *     summary: Set card as default
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Card set as default
 *       404:
 *         description: Card not found
 */
router.put('/:id/default', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await cardsService.setDefault(getAuthUser(req).userId, req.params.id as string));
  } catch (err) {
    next(err);
  }
});

export default router;
