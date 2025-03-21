// stripe.interfaces.ts
export interface PaymentIntentRequest {
    amount: number; // Amount in cents (e.g., 1000 for $10.00)
    currency: string; // Currency code (e.g., 'usd')
    userId: string; // User ID associated with the payment
    bookingId: string; // Booking ID associated with the payment
  }