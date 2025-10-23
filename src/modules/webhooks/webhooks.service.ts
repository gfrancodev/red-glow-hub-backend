import type { WebhookEventType } from '@/modules/boost/boost.schema';
import { BoostService } from '@/modules/boost/boost.service';
import { logger } from '@/shared/core/logger';
import { E } from '@/shared/errors';
import { MercadoPagoService } from '@/shared/services/mercadopago.service';

export class WebhooksService {
  private mpService: MercadoPagoService;
  private boostService: BoostService;

  constructor() {
    this.mpService = new MercadoPagoService();
    this.boostService = new BoostService();
  }

  async processPaymentWebhook(event: WebhookEventType): Promise<void> {
    // Verify the webhook event
    if (event.type !== 'payment') {
      return; // Ignore non-payment events
    }

    try {
      // Get payment details from Mercado Pago
      const payment = await this.mpService.getPayment(event.data.id);

      // Update boost status based on payment status
      await this.boostService.updateBoostStatus(payment.id.toString(), payment.status);

      logger.info(`Webhook processed: payment ${payment.id} status ${payment.status}`);
    } catch (error) {
      logger.error({ error }, 'Error processing webhook');
      throw E.INTERNAL({
        meta: {
          context: 'webhooks.processPaymentWebhook',
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}
