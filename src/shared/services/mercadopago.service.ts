import { secrets } from '@/shared/config/secrets';
import { E } from '@/shared/errors';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export interface PixPaymentData {
  transaction_amount: number;
  description: string;
  payer_email: string;
  payer_first_name?: string;
  payer_last_name?: string;
  payer_identification?: {
    type: string;
    number: string;
  };
}

export interface PixPaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  transaction_details: {
    net_received_amount: number;
    total_paid_amount: number;
    overpaid_amount: number;
  };
  point_of_interaction: {
    type: string;
    transaction_data: {
      qr_code_base64: string;
      qr_code: string;
      ticket_url: string;
    };
  };
}

export class MercadoPagoService {
  private client: Payment;

  constructor() {
    const config = new MercadoPagoConfig({
      accessToken: secrets.mercadopago.accessToken,
    });
    this.client = new Payment(config);
  }

  async createPixPayment(data: PixPaymentData): Promise<PixPaymentResponse> {
    try {
      const payment = await this.client.create({
        body: {
          transaction_amount: data.transaction_amount,
          description: data.description,
          payment_method_id: 'pix',
          payer: {
            email: data.payer_email,
            first_name: data.payer_first_name,
            last_name: data.payer_last_name,
            identification: data.payer_identification,
          },
        },
        requestOptions: {
          idempotencyKey: crypto.randomUUID(),
        },
      });

      return payment as unknown as PixPaymentResponse;
    } catch (error) {
      throw E.INTERNAL({
        meta: {
          context: 'mercadopago.createPixPayment',
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  async getPayment(paymentId: string): Promise<PixPaymentResponse> {
    try {
      const payment = await this.client.get({ id: paymentId });
      return payment as unknown as PixPaymentResponse;
    } catch (error) {
      throw E.INTERNAL({
        meta: {
          context: 'mercadopago.getPayment',
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}
