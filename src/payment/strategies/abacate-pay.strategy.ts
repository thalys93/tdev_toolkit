import { Injectable } from '@nestjs/common';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import AbacatePay from 'abacatepay-nodejs-sdk';

@Injectable()
export class AbacatePayStrategy implements PaymentStrategy {
  private readonly abacate;

  constructor() {
    this.abacate = AbacatePay(process.env.ABACATEPAY_API_TOKEN || '');
  }

  async createPayment(data: CreatePaymentDto): Promise<PaymentResponseDto> {
    if (!process.env.ABACATEPAY_API_TOKEN) {
      throw new Error('ABACATEPAY_API_TOKEN não configurado.');
    }

    const billing = await this.abacate.billing.create({
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      products: [
        {
          externalId: data.id,
          name: data.description,
          quantity: 1,
          price: data.amount,
        },
      ],
      returnUrl: 'https://yoursite.com/app',
      completionUrl: 'https://yoursite.com/payment/success',
      customer: {
        name: data.metadata?.name || 'Cliente sem nome',
        email: data.metadata?.email,
        cellphone: data.metadata?.cellphone,
        taxId: data.metadata?.taxId,
      },
    });

    return {
      provider: 'abacate_pay',
      paymentId: billing.id,
      status: billing.status,
      amount: billing.amount,
      currency: 'BRL',
      redirectUrl: billing.url,
      raw: billing,
    };
  }
}
