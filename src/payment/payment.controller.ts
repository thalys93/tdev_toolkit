import { Body, Controller, Post } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payment Module')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() body: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentService.createPayment(body);
  }
}
