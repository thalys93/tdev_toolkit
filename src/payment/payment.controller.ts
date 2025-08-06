import {
  Body,
  Controller,
  Post,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiResponse as StandardApiResponse,
  ApiResponseBuilder,
  API_KEYS,
  API_STATUS,
} from '../utils/api-response.interface';

@ApiTags('Payment Module')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async create(
    @Body() body: CreatePaymentDto,
  ): Promise<StandardApiResponse<PaymentResponseDto>> {
    try {
      const result = await this.paymentService.createPayment(body);
      return ApiResponseBuilder.success(
        result,
        API_STATUS.SUCCESS,
        200,
        API_KEYS.PAYMENT.CREATE,
        'Pagamento criado com sucesso',
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(
          ApiResponseBuilder.error(
            'Dados inválidos para criação de pagamento',
            API_STATUS.VALIDATION_ERROR,
            400,
            API_KEYS.PAYMENT.CREATE,
            error.message,
            error,
          ),
          400,
        );
      }

      // Verificar se é erro de provedor específico
      if (
        error.message.includes('Stripe') ||
        error.message.includes('stripe')
      ) {
        throw new HttpException(
          ApiResponseBuilder.error(
            'Erro no provedor de pagamento Stripe',
            API_STATUS.ERROR,
            500,
            API_KEYS.PAYMENT.CREATE,
            error.message,
            { provider: 'stripe', originalError: error },
          ),
          500,
        );
      }

      if (
        error.message.includes('MercadoPago') ||
        error.message.includes('mercadopago')
      ) {
        throw new HttpException(
          ApiResponseBuilder.error(
            'Erro no provedor de pagamento MercadoPago',
            API_STATUS.ERROR,
            500,
            API_KEYS.PAYMENT.CREATE,
            error.message,
            { provider: 'mercadopago', originalError: error },
          ),
          500,
        );
      }

      if (
        error.message.includes('AbacatePay') ||
        error.message.includes('abacatepay')
      ) {
        throw new HttpException(
          ApiResponseBuilder.error(
            'Erro no provedor de pagamento AbacatePay',
            API_STATUS.ERROR,
            500,
            API_KEYS.PAYMENT.CREATE,
            error.message,
            { provider: 'abacatepay', originalError: error },
          ),
          500,
        );
      }

      throw new HttpException(
        ApiResponseBuilder.error(
          'Falha ao criar pagamento',
          API_STATUS.INTERNAL_ERROR,
          500,
          API_KEYS.PAYMENT.CREATE,
          error.message,
          error,
        ),
        500,
      );
    }
  }
}
