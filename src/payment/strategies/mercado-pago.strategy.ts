import { Injectable } from '@nestjs/common';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto, PaymentStatus } from '../dto/payment-response.dto';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { centsToUnits } from 'src/utils/currency.converter';

@Injectable()
export class MercadoPagoStrategy implements PaymentStrategy {
  private readonly client: MercadoPagoConfig;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN || '',
    });
  }

  async createPayment(data: CreatePaymentDto): Promise<PaymentResponseDto> {
    const preference = new Preference(this.client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: data.id,
            title: data.description,
            quantity: 1,
            unit_price: centsToUnits(data.amount),
            currency_id: data.currency,
          },
        ],
        metadata: {
          ...data.metadata,
          internal_payment_id: data.id,
        },
      },
    });

    return {
      provider: 'mercado_pago',
      paymentId: result.id,
      status: PaymentStatus.PENDING, // todo: add CREATED,
      amount: data.amount,
      currency: data.currency,
      redirectUrl: result.init_point,
      raw: result,
    };
  }
}
