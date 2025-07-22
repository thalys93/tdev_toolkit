import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

export interface PaymentStrategy {
  createPayment(data: CreatePaymentDto): Promise<PaymentResponseDto>;
}
