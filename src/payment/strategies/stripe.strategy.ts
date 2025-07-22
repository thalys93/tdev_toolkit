import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

@Injectable()
export class StripeStrategy implements PaymentStrategy {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY || '');
  }

  async createPayment(data: CreatePaymentDto): Promise<PaymentResponseDto> {
    if (!process.env.STRIPE_PRIVATE_KEY) {
      throw new Error('STRIPE_PRIVATE_KEY não configurada.');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'], // pode adicionar boleto, pix se habilitado
      mode: 'payment',
      success_url:
        'https://seusite.com/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://seusite.com/payment/cancel',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: data.currency.toLowerCase(),
            product_data: {
              name: data.description,
            },
            unit_amount: data.amount, // valor em centavos
          },
        },
      ],
      metadata: {
        id: data.id,
        ...data.metadata,
      },
    });

    return {
      provider: 'stripe',
      paymentId: session.id,
      status: 'created', // a sessão ainda está pendente até o pagamento
      amount: data.amount,
      currency: data.currency,
      redirectUrl: session.url || '',
      raw: session,
    };
  }
}
