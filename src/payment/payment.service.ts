import { Inject, Logger } from '@nestjs/common';
import { PaymentStrategy } from './interfaces/payment-strategy.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject('PAYMENT_STRATEGIES')
    private readonly strategies: Record<string, PaymentStrategy>,
  ) {}

  async createPayment(data: CreatePaymentDto): Promise<PaymentResponseDto> {
    const strategy = this.strategies[data.provider];
    if (!strategy)
      throw new Error(`Unsupported payment provider: ${data.provider}`);
    return strategy.createPayment(data);
  }

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

      // Aqui você poderia atualizar o status no DB ou emitir evento
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

    // Aqui você pode buscar no seu banco usando o `event.id` (billingId), atualizar status, etc.
  }
}
