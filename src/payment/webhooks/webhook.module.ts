import { Module } from '@nestjs/common';
import { MercadoPagoWebhookController } from './mercado-pago.webhook';
import { PaymentModule } from '../payment.module';
import { AbacatePayWebhookController } from './abacate-pay-webhook.controller';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [PaymentModule],
  controllers: [
    MercadoPagoWebhookController,
    AbacatePayWebhookController,
    StripeWebhookController,
  ],
})
export class WebhookModule {}
