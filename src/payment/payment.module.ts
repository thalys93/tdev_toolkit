import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MercadoPagoStrategy } from './strategies/mercado-pago.strategy';
import { PaymentController } from './payment.controller';
import { AbacatePayStrategy } from './strategies/abacate-pay.strategy';
import { StripeStrategy } from './strategies/stripe.strategy';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    MercadoPagoStrategy,
    AbacatePayStrategy,
    StripeStrategy,
    {
      provide: 'PAYMENT_STRATEGIES',
      useFactory: (
        mercadoPago: MercadoPagoStrategy,
        abacatePay: AbacatePayStrategy,
        stripe: StripeStrategy,
      ) => ({
        mercado_pago: mercadoPago,
        abacate_pay: abacatePay,
        stripe: stripe,
      }),
      inject: [MercadoPagoStrategy, AbacatePayStrategy, StripeStrategy],
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
