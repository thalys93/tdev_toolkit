import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsEmail,
  IsObject,
  Min,
  Max,
  IsBoolean,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentProvider {
  MERCADO_PAGO = 'mercado_pago',
  ABACATE_PAY = 'abacate_pay',
  STRIPE = 'stripe',
}

export enum Currency {
  BRL = 'BRL',
  USD = 'USD',
  EUR = 'EUR',
}

export class CustomerInfoDto {
  @ApiProperty({ example: 'cliente@email.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'João Silva' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+5511999999999' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @IsOptional()
  @IsString()
  document?: string;
}

export class ShippingAddressDto {
  @ApiProperty({ example: 'Rua das Flores, 123' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  state: string;

  @ApiProperty({ example: '01234-567' })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: 'BR' })
  @IsString()
  country: string;
}

export class CreatePaymentDto {
  @ApiProperty({ enum: PaymentProvider, example: PaymentProvider.STRIPE })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty({ example: 'payment_123456' })
  @IsString()
  id: string;

  @ApiProperty({ example: 2500, description: 'Valor em centavos (25.00 BRL)' })
  @IsNumber()
  @Min(50) // Mínimo 50 centavos
  @Max(999999999) // Máximo ~10 milhões
  amount: number;

  @ApiProperty({ enum: Currency, example: Currency.BRL })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ example: 'Produto Premium - Assinatura Mensal' })
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer?: CustomerInfoDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  requireShipping?: boolean;

  @ApiPropertyOptional({ example: ['card', 'boleto'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedPaymentMethods?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
