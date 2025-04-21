import { FlightPricingRequest } from './../../../backend/src/schemas/flight.schema';
import { PricingResponse } from './../../../backend/src/interfaces/amadeus.interfaces';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:2000';

export const getPriceAPI = async (params: FlightPricingRequest): Promise<PricingResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flights/price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get flight pricing');
    }

    return await response.json();
  } catch (error) {
    console.error('Flight pricing error:', error);
    throw error instanceof Error ? error : new Error('Failed to get flight pricing');
  }
};