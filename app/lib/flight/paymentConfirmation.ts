const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:2000';

type ConfirmPaymentParams = {
  paymentId: string;
};

export const confirmPaymentAPI = async (params: ConfirmPaymentParams): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to confirm payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment confirmation error:', error);
    throw error instanceof Error ? error : new Error('Failed to confirm payment');
  }
};