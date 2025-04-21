import { FlightBookingRequest } from './../../../backend/src/schemas/flight.schema';
import { BookingResponse } from './../../../backend/src/interfaces/amadeus.interfaces'; 

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:2000';

export const bookFlightAPI = async (params: FlightBookingRequest): Promise<BookingResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flights/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to book flight');
    }

    return await response.json();
  } catch (error) {
    console.error('Flight booking error:', error);
    throw error instanceof Error ? error : new Error('Failed to book flight');
  }
};