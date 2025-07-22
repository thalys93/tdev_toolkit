import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum PaymentProvider {
  MERCADO_PAGO = 'mercado_pago',
  ABACATE_PAY = 'abacate_pay',
  STRIPE = 'stripe',
}

export class CreatePaymentDto {
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsString()
  id: string;

  @IsNumber()
  amount: number; // Ex: 2500 (25.00 BRL)

  @IsString()
  currency: string; // Ex: 'BRL'

  @IsString()
  description: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
