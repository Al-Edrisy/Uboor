export interface CardDetails {
  number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
}

export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  userId: string;
  bookingId: string;
  card?: CardDetails; // Make card optional
}

export interface PaymentResult {
  id: string;
  status: string;
  amount: number;
  currency: string;
  clientSecret?: string;
  requiresAction?: boolean;
}