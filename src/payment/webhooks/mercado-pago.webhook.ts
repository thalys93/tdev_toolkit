import { Controller, HttpCode, Logger, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from '../payment.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Webhooks Module - Mercado Pago')
@Controller('webhook/mercadopago')
export class MercadoPagoWebhookController {
  private readonly logger = new Logger(MercadoPagoWebhookController.name);
  private readonly secret = process.env.MP_NOTIFICATION_SECRET || '';

  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(200)
  async handle(@Req() req: Request & { rawBody: string }) {
    const topic = req.body.topic || req.body.type;
    const id = req.body.data?.id || req.body.id;

    if (!id || id === '123456') {
      // aqui você pode colocar mais regras se quiser
      this.logger.warn(`Ignoring invalid or test payment id: ${id}`);
      return;
    }

    this.logger.log(`Received MP webhook: topic=${topic} id=${id}`);

    await this.paymentService.processMercadoPagoNotification({
      topic,
      id,
      raw: req.body,
    });

    return;
  }
}
