export class PaymentResponseDto {
  provider: string;
  paymentId: string;
  status: 'created' | 'pending' | 'approved' | 'failed';
  amount: number;
  currency: string;
  redirectUrl?: string;
  raw?: any; // opcional: payload bruto da API (debug/log)
}
