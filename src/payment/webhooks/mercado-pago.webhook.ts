import {
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from '../payment.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiResponse as StandardApiResponse,
  ApiResponseBuilder,
  API_KEYS,
  API_STATUS,
} from '../../utils/api-response.interface';

@ApiTags('Webhooks Module - Mercado Pago')
@Controller('webhook/mercadopago')
export class MercadoPagoWebhookController {
  private readonly logger = new Logger(MercadoPagoWebhookController.name);
  private readonly secret = process.env.MP_NOTIFICATION_SECRET || '';

  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle MercadoPago webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async handle(
    @Req() req: Request & { rawBody: string },
  ): Promise<
    StandardApiResponse<{ received: boolean; topic?: string; id?: string }>
  > {
    const topic = req.body.topic || req.body.type;
    const id = req.body.data?.id || req.body.id;

    if (!id || id === '123456') {
      this.logger.warn(`Ignoring invalid or test payment id: ${id}`);
      return ApiResponseBuilder.success(
        { received: true, topic, id },
        API_STATUS.WEBHOOK_IGNORED,
        200,
        API_KEYS.PAYMENT.WEBHOOK_MERCADOPAGO,
        'Webhook ignorado: ID inválido ou de teste',
      );
    }

    this.logger.log(`✅ MercadoPago webhook received: topic=${topic} id=${id}`);

    try {
      await this.paymentService.processMercadoPagoNotification({
        topic,
        id,
        raw: req.body,
      });

      return ApiResponseBuilder.success(
        { received: true, topic, id },
        API_STATUS.WEBHOOK_PROCESSED,
        200,
        API_KEYS.PAYMENT.WEBHOOK_MERCADOPAGO,
        `Webhook do MercadoPago processado com sucesso: ${topic}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing MercadoPago webhook: ${error.message}`,
        error.stack,
      );

      throw new HttpException(
        ApiResponseBuilder.error(
          'Erro ao processar webhook do MercadoPago',
          API_STATUS.ERROR,
          500,
          API_KEYS.PAYMENT.WEBHOOK_MERCADOPAGO,
          error.message,
          {
            topic,
            id,
            originalError: error,
          },
        ),
        500,
      );
    }
  }
}
