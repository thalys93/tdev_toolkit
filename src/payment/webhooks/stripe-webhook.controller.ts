import {
  Controller,
  Post,
  Req,
  HttpCode,
  Logger,
  Headers,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from '../payment.service';
import Stripe from 'stripe';
import {
  ApiResponse as StandardApiResponse,
  ApiResponseBuilder,
  API_KEYS,
  API_STATUS,
} from '../../utils/api-response.interface';

@ApiTags('Webhooks Module - Stripe')
@Controller('webhook/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  constructor(private readonly paymentService: PaymentService) {
    this.stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY || '');
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Req() req: Request & { rawBody: Buffer },
    @Headers('stripe-signature') signature: string,
  ): Promise<
    StandardApiResponse<{
      received: boolean;
      eventId: string;
      eventType: string;
    }>
  > {
    if (!this.webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
      return ApiResponseBuilder.success(
        { received: true, eventId: 'unknown', eventType: 'unknown' },
        API_STATUS.SUCCESS,
        200,
        API_KEYS.PAYMENT.WEBHOOK_STRIPE,
        'Webhook recebido mas STRIPE_WEBHOOK_SECRET não configurado',
      );
    }

    let event: Stripe.Event;

    try {
      // Verificar assinatura do webhook
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new HttpException(
        ApiResponseBuilder.error(
          'Assinatura do webhook inválida',
          API_STATUS.VALIDATION_ERROR,
          400,
          API_KEYS.PAYMENT.WEBHOOK_STRIPE,
          'Falha na verificação da assinatura do webhook',
          { originalError: err.message },
        ),
        400,
      );
    }

    this.logger.log(`✅ Stripe webhook received: ${event.type} - ${event.id}`);

    try {
      await this.paymentService.processStripeWebhook(event);

      return ApiResponseBuilder.success(
        {
          received: true,
          eventId: event.id,
          eventType: event.type,
        },
        API_STATUS.WEBHOOK_PROCESSED,
        200,
        API_KEYS.PAYMENT.WEBHOOK_STRIPE,
        `Webhook do Stripe processado com sucesso: ${event.type}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing Stripe webhook: ${error.message}`,
        error.stack,
      );

      throw new HttpException(
        ApiResponseBuilder.error(
          'Erro ao processar webhook do Stripe',
          API_STATUS.ERROR,
          500,
          API_KEYS.PAYMENT.WEBHOOK_STRIPE,
          error.message,
          {
            eventId: event.id,
            eventType: event.type,
            originalError: error,
          },
        ),
        500,
      );
    }
  }
}
