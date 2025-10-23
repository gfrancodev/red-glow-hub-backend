import { WebhookEvent } from '@/modules/boost/boost.schema';
import { asyncHandler } from '@/shared/core/http';
import { validate } from '@/shared/middleware/validate';
import { Router } from 'express';
import { WebhooksService } from './webhooks.service';

const router = Router();
const webhooksService = new WebhooksService();

// POST /webhooks/payments
router.post(
  '/payments',
  validate({ body: WebhookEvent }),
  asyncHandler(async (req, res) => {
    // Process webhook
    await webhooksService.processPaymentWebhook(req.body);

    res.json({ success: true });
  })
);

export default router;
