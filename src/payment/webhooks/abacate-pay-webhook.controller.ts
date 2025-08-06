import {
  Controller,
  Post,
  Req,
  HttpCode,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from '../payment.service';
import {
  ApiResponse as StandardApiResponse,
  ApiResponseBuilder,
  API_KEYS,
  API_STATUS,
} from '../../utils/api-response.interface';

@ApiTags('Webhooks Module - Abacate Pay')
@Controller('webhook/abacatepay')
export class AbacatePayWebhookController {
  private readonly logger = new Logger(AbacatePayWebhookController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle AbacatePay webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async handle(@Req() req: Request): Promise<
    StandardApiResponse<{
      received: boolean;
      eventType?: string;
      billingId?: string;
      status?: string;
    }>
  > {
    const { event, data } = req.body ?? {};
    const billingId = data?.billing?.id;
    const status = data?.billing?.status;

    this.logger.log(
      `✅ AbacatePay webhook received: type=${event} id=${billingId} status=${status}`,
    );

    try {
      await this.paymentService.processAbacatePayNotification({
        id: billingId,
        eventType: event,
        raw: req.body,
      });

      return ApiResponseBuilder.success(
        {
          received: true,
          eventType: event,
          billingId,
          status,
        },
        API_STATUS.WEBHOOK_PROCESSED,
        200,
        API_KEYS.PAYMENT.WEBHOOK_ABACATEPAY,
        `Webhook do AbacatePay processado com sucesso: ${event}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing AbacatePay webhook: ${error.message}`,
        error.stack,
      );

      throw new HttpException(
        ApiResponseBuilder.error(
          'Erro ao processar webhook do AbacatePay',
          API_STATUS.ERROR,
          500,
          API_KEYS.PAYMENT.WEBHOOK_ABACATEPAY,
          error.message,
          {
            eventType: event,
            billingId,
            status,
            originalError: error,
          },
        ),
        500,
      );
    }
  }
}
