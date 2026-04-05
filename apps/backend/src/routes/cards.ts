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
 *     responses:
 *       201:
 *         description: Card saved (only last4 and brand stored)
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
