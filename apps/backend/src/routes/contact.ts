import { Router, type Router as ExpressRouter } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { validate } from '@middleware/validate.js';
import * as contactService from '@services/contact.service.js';
import { ok } from '@utils/response.js';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /contact:
 *   post:
 *     tags: [Contact]
 *     summary: Submit a contact form message
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               subject: { type: string }
 *               message: { type: string }
 *           example:
 *             name: Alice Johnson
 *             email: alice@example.com
 *             subject: Question about my order
 *             message: "I'd like to know the status of my recent order. Could you help?"
 *     responses:
 *       200:
 *         description: Message received
 *         content:
 *           application/json:
 *             example:
 *               message: Thank you for contacting us. We will get back to you shortly.
 */
router.post(
  '/',
  validate(contactService.ContactSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await contactService.submitContactForm(req.body as contactService.ContactInput));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
