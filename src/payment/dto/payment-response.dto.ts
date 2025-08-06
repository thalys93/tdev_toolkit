import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',
}

export class PaymentResponseDto {
  @ApiProperty({ example: 'stripe' })
  provider: string;

  @ApiProperty({ example: 'cs_test_123456' })
  paymentId: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ example: 2500 })
  amount: number;

  @ApiProperty({ example: 'BRL' })
  currency: string;

  @ApiPropertyOptional({
    example: 'https://checkout.stripe.com/pay/cs_test_123456',
  })
  redirectUrl?: string;

  @ApiPropertyOptional({ example: 'pi_123456' })
  paymentIntentId?: string;

  @ApiPropertyOptional()
  expiresAt?: Date;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  raw?: any;
}
