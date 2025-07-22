import { Controller, Post, Req, HttpCode, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../payment.service';

@ApiTags('Webhooks Module - Abacate Pay')
@Controller('webhook/abacatepay')
export class AbacatePayWebhookController {
  private readonly logger = new Logger(AbacatePayWebhookController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(200)
  async handle(@Req() req: Request) {
    const { event, data } = req.body ?? {};
    const billingId = data?.billing?.id;
    const status = data?.billing?.status;

    this.logger.log(
      `✅ AbacatePay webhook received: type=${event} id=${billingId} status=${status}`,
    );

    await this.paymentService.processAbacatePayNotification({
      id: billingId,
      eventType: event,
      raw: req.body,
    });

    return { received: true };
  }
}
