import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentStrategy } from './interfaces/payment-strategy.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject('PAYMENT_STRATEGIES')
    private readonly strategies: Record<string, PaymentStrategy>,
  ) {}

  async createPayment(data: CreatePaymentDto): Promise<PaymentResponseDto> {
    const strategy = this.strategies[data.provider];
    if (!strategy) {
      throw new NotFoundException(
        `Provedor de pagamento não suportado: ${data.provider}`,
      );
    }

    try {
      const result = await strategy.createPayment(data);

      // Log para auditoria
      this.logger.log(
        `Payment created: ${result.paymentId} via ${data.provider} for amount ${data.amount} ${data.currency}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create payment via ${data.provider}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async processStripeWebhook(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing Stripe webhook: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleStripeCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'payment_intent.succeeded':
          await this.handleStripePaymentSucceeded(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case 'payment_intent.payment_failed':
          await this.handleStripePaymentFailed(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case 'charge.dispute.created':
          await this.handleStripeChargeDispute(
            event.data.object as Stripe.Dispute,
          );
          break;

        case 'invoice.payment_succeeded':
          await this.handleStripeInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;

        default:
          this.logger.log(`Unhandled Stripe webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing Stripe webhook ${event.type}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleStripeCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const internalPaymentId = session.metadata?.internal_payment_id;

    this.logger.log(
      `Stripe checkout completed: ${session.id}, internal ID: ${internalPaymentId}`,
    );

    // Aqui você atualizaria o status no seu banco de dados
    // await this.updatePaymentStatus(internalPaymentId, PaymentStatus.COMPLETED);

    // Enviar email de confirmação
    // await this.emailService.sendPaymentConfirmation(session.customer_email, session);

    // Emitir evento para outros serviços
    // await this.eventEmitter.emit('payment.completed', { session, internalPaymentId });
  }

  private async handleStripePaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const internalPaymentId = paymentIntent.metadata?.internal_payment_id;

    this.logger.log(
      `Stripe payment succeeded: ${paymentIntent.id}, internal ID: ${internalPaymentId}`,
    );

    // Atualizar status e processar fulfillment
    // await this.fulfillmentService.processOrder(internalPaymentId);
  }

  private async handleStripePaymentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const internalPaymentId = paymentIntent.metadata?.internal_payment_id;

    this.logger.warn(
      `Stripe payment failed: ${paymentIntent.id}, internal ID: ${internalPaymentId}`,
    );

    // Atualizar status e notificar cliente
    // await this.updatePaymentStatus(internalPaymentId, PaymentStatus.FAILED);
    // await this.emailService.sendPaymentFailedNotification(paymentIntent);
  }

  private async handleStripeChargeDispute(
    dispute: Stripe.Dispute,
  ): Promise<void> {
    this.logger.warn(
      `Stripe charge dispute created: ${dispute.id} for charge ${dispute.charge}`,
    );

    // Notificar equipe de suporte
    // await this.notificationService.notifyDispute(dispute);
  }

  private async handleStripeInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    this.logger.log(`Stripe invoice payment succeeded: ${invoice.id}`);

    // Processar renovação de assinatura
    // await this.subscriptionService.processRenewal(invoice);
  }

  // Métodos existentes do MercadoPago e AbacatePay...
  async processMercadoPagoNotification(event: {
    topic: string;
    id: string;
    raw: any;
  }) {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN || '',
    });

    try {
      const payment = await new Payment(client).get({ id: event.id });
      this.logger.log(`MP payment ${event.id} status: ${payment.status}`);

      // Processar status do pagamento
      // await this.updatePaymentStatus(payment.external_reference, this.mapMercadoPagoStatus(payment.status));
    } catch (err) {
      if (err.statusCode === 404) {
        this.logger.warn(`MP payment not found for id ${event.id}, ignoring.`);
        return;
      }

      this.logger.error(
        `Erro ao processar notificação do Mercado Pago (id: ${event.id})`,
        err,
      );
    }
  }

  async processAbacatePayNotification(event: {
    id: string;
    eventType: string;
    raw: any;
  }) {
    this.logger.log(
      `AbacatePay event ${event.eventType} received for billing ID: ${event.id}`,
    );

    // Processar evento do AbacatePay
    // await this.updatePaymentStatus(event.id, this.mapAbacatePayStatus(event.eventType));
  }
}
