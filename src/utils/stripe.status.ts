import Stripe from 'stripe';

export function mapStripeStatus(
  status: Stripe.PaymentIntent.Status,
): 'created' | 'pending' | 'approved' | 'failed' {
  switch (status) {
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
    case 'processing':
      return 'pending';
    case 'requires_capture':
    case 'succeeded':
      return 'approved';
    case 'canceled':
      return 'failed';
    default:
      return 'failed';
  }
}
