import db from '@/shared/config/db.config';
import { E } from '@/shared/errors';
import { MercadoPagoService } from '@/shared/services/mercadopago.service';
import type { BoostStatusResponse, CheckoutInputType, CheckoutResponse } from './boost.schema';

const BOOST_PLANS = {
  basic: { amount: 9.9, description: 'Boost Básico - 7 dias' },
  premium: { amount: 19.9, description: 'Boost Premium - 7 dias' },
  vip: { amount: 39.9, description: 'Boost VIP - 7 dias' },
} as const;

export class BoostService {
  private mpService: MercadoPagoService;

  constructor() {
    this.mpService = new MercadoPagoService();
  }

  async initiateCheckout(userId: string, input: CheckoutInputType): Promise<CheckoutResponse> {
    // Get user profile
    const profile = await db.profile.findUnique({
      where: { user_id: userId },
      include: { user: true },
    });

    if (!profile) {
      throw E.NOT_FOUND({ meta: { entity: 'profile', user_id: userId } });
    }

    const plan = BOOST_PLANS[input.plan];
    const amount = plan.amount;
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + input.duration_days * 24 * 60 * 60 * 1000);

    // Create boost record
    const boost = await db.boost.create({
      data: {
        player_id: profile.id,
        status: 'scheduled',
        starts_at: startsAt,
        ends_at: endsAt,
        provider: 'stripe',
        amount_cents: Math.round(amount * 100),
        currency: 'BRL',
      },
    });

    // Create PIX payment
    const payment = await this.mpService.createPixPayment({
      transaction_amount: amount,
      description: plan.description,
      payer_email: profile.user.email,
      payer_first_name: profile.display_name.split(' ')[0],
      payer_last_name: profile.display_name.split(' ').slice(1).join(' '),
    });

    // Update boost with payment ID
    await db.boost.update({
      where: { id: boost.id },
      data: { external_id: payment.id.toString() },
    });

    return {
      success: true,
      data: {
        boost_id: boost.id,
        payment_id: payment.id.toString(),
        qr_code: payment.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: payment.point_of_interaction.transaction_data.qr_code_base64,
        ticket_url: payment.point_of_interaction.transaction_data.ticket_url,
        amount,
        currency: 'BRL',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      },
    };
  }

  async getBoosts(userId: string): Promise<BoostStatusResponse> {
    const profile = await db.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw E.NOT_FOUND({ meta: { entity: 'profile', user_id: userId } });
    }

    const boosts = await db.boost.findMany({
      where: {
        player_id: profile.id,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      data: {
        boosts: boosts.map(boost => ({
          id: boost.id,
          status: boost.status,
          starts_at: boost.starts_at.toISOString(),
          ends_at: boost.ends_at.toISOString(),
          amount_cents: boost.amount_cents,
          currency: boost.currency,
          provider: boost.provider,
          created_at: boost.created_at.toISOString(),
        })),
      },
    };
  }

  async updateBoostStatus(paymentId: string, status: string): Promise<void> {
    const boost = await db.boost.findFirst({
      where: { external_id: paymentId },
    });

    if (!boost) {
      throw E.NOT_FOUND({ meta: { entity: 'boost', payment_id: paymentId } });
    }

    let boostStatus: 'scheduled' | 'active' | 'expired' | 'canceled';

    switch (status) {
      case 'approved':
        boostStatus = 'active';
        break;
      case 'rejected':
      case 'cancelled':
        boostStatus = 'canceled';
        break;
      default:
        return; // Don't update for other statuses
    }

    await db.boost.update({
      where: { id: boost.id },
      data: { status: boostStatus },
    });
  }
}
