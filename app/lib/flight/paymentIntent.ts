import { PaymentIntentRequest } from './../../../backend/src/schemas/payment.schema';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:2000';

export const createPaymentIntentAPI = async (params: PaymentIntentRequest): Promise<{ clientSecret: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment intent error:', error);
    throw error instanceof Error ? error : new Error('Failed to create payment intent');
  }
};