import { Module } from '@nestjs/common';
import { MercadoPagoWebhookController } from './mercado-pago.webhook';
import { PaymentModule } from '../payment.module';
import { AbacatePayWebhookController } from './abacate-pay-webhook.controller';

@Module({
  imports: [PaymentModule],
  controllers: [MercadoPagoWebhookController, AbacatePayWebhookController],
})
export class WebhookModule {}
