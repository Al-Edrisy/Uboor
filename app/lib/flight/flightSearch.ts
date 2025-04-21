import { FlightSearchRequest } from './../../../backend/src/schemas/flight.schema';
import { FlightOffer } from './../../../backend/src/interfaces/amadeus.interfaces';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:2000';

export const searchFlightsAPI = async (params: FlightSearchRequest): Promise<FlightOffer[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flights/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search flights');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Flight search error:', error);
    throw error instanceof Error ? error : new Error('Failed to search flights');
  }
};