import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto, PaymentStatus } from '../dto/payment-response.dto';

@Injectable()
export class StripeStrategy implements PaymentStrategy {
  private readonly logger = new Logger(StripeStrategy.name);
  private readonly stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_PRIVATE_KEY) {
      throw new Error('STRIPE_PRIVATE_KEY não configurada.');
    }

    this.stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    });
  }

  async createPayment(data: CreatePaymentDto): Promise<PaymentResponseDto> {
    try {
      // Determinar métodos de pagamento baseado na moeda
      const paymentMethods = this.getPaymentMethodsForCurrency(data.currency);

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types:
          paymentMethods as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
        mode: 'payment',
        success_url: this.buildSuccessUrl(data.id),
        cancel_url: this.buildCancelUrl(data.id),
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: data.currency.toLowerCase(),
              product_data: {
                name: data.description,
                metadata: {
                  internal_id: data.id,
                },
              },
              unit_amount: data.amount,
            },
          },
        ],
        metadata: {
          internal_payment_id: data.id,
          provider: 'stripe',
          ...data.metadata,
        },
        payment_intent_data: {
          metadata: {
            internal_payment_id: data.id,
          },
        },
        expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 horas
        automatic_tax: {
          enabled: true,
        },
        billing_address_collection: 'required',
        shipping_address_collection: data.metadata?.requireShipping
          ? {
              allowed_countries: ['BR', 'US', 'CA'],
            }
          : undefined,
      };

      // Adicionar configurações específicas para PIX (Brasil)
      if (data.currency.toUpperCase() === 'BRL') {
        sessionParams.payment_method_options = {
          boleto: {
            expires_after_days: 3,
          },
        };
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams);

      this.logger.log(
        `Stripe session created: ${session.id} for payment ${data.id}`,
      );

      return {
        provider: 'stripe',
        paymentId: session.id,
        status: PaymentStatus.PENDING,
        amount: data.amount,
        currency: data.currency,
        redirectUrl: session.url || '',
        expiresAt: new Date(session.expires_at * 1000),
        raw: session,
      };
    } catch (error) {
      this.logger.error(
        `Error creating Stripe payment: ${error.message}`,
        error.stack,
      );
      throw new Error(`Falha ao criar pagamento Stripe: ${error.message}`);
    }
  }

  async retrievePayment(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    });
  }

  async refundPayment(
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    });
  }

  async createCustomer(customerData: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    return this.stripe.customers.create(customerData);
  }

  private getPaymentMethodsForCurrency(currency: string): string[] {
    const currencyUpper = currency.toUpperCase();

    switch (currencyUpper) {
      case 'BRL':
        return ['card', 'boleto']; // PIX será adicionado quando disponível
      case 'USD':
        return ['card', 'us_bank_account'];
      case 'EUR':
        return ['card', 'sepa_debit', 'giropay', 'ideal'];
      default:
        return ['card'];
    }
  }

  private buildSuccessUrl(paymentId: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&payment_id=${paymentId}`;
  }

  private buildCancelUrl(paymentId: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/payment/cancel?payment_id=${paymentId}`;
  }
}
