import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AmadeusTokenResponse,
  FlightOffer,
  PricingResponse,
  FlightOrderResponse
} from '../interfaces/amadeus.interfaces';
import logger from '../utils/logger';

export class AmadeusService {
  private client: AxiosInstance;
  private tokenExpiry: number = 0;
  private accessToken: string = '';

  constructor() {
    this.client = axios.create({
      baseURL: process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com'
    });
  }

  private async authenticate(): Promise<void> {
    if (Date.now() < this.tokenExpiry) return;

    try {
      const response = await this.client.post<AmadeusTokenResponse>(
        '/v1/security/oauth2/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.AMADEUS_CLIENT_ID!,
          client_secret: process.env.AMADEUS_SECRET_KEY!
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
        
      );
      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000; // Set expiry time
      console.log("Access token", this.accessToken);
      logger.info('Amadeus authentication successful');
    } catch (error: any) { // Explicitly typing error as any
      logger.error(`Amadeus authentication failed: ${error.response?.data || error.message}`); // Log full error response
      throw new Error('Failed to authenticate with Amadeus');
    }
  }

  async searchFlights(searchData: any): Promise<FlightOffer[]> {
    await this.authenticate();

    try {
      const response = await this.client.post<FlightOffer[]>('/v2/shopping/flight-offers', searchData, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });

      return response.data;
    } catch (error: any) { // Explicitly typing error as any
      logger.error(`Flight search failed: ${error.response?.data || error.message}`); // Log full error response
      throw new Error('Failed to search flights');
    }
  }

  async priceFlightOffers(flightOffers: any[]): Promise<PricingResponse> {
    await this.authenticate();

    try {
      const response = await this.client.post<PricingResponse>('/v1/shopping/flight-offers/pricing', {
        data: {
          type: 'flight-offers-pricing',
          flightOffers
        }
      }, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) { // Explicitly typing error as any
      logger.error(`Flight pricing failed: ${error.response?.data || error.message}`); // Log full error response
      throw new Error('Failed to price flight offers');
    }
  }

  async createFlightOrder(orderData: any): Promise<FlightOrderResponse> {
    console.log("access token", this.accessToken);
    await this.authenticate();

    try {
      const response = await this.client.post<FlightOrderResponse>('/v1/booking/flight-orders', orderData, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(response.data)
      return response.data;
    } catch (error: any) { // Explicitly typing error as any
      logger.error(`Flight order creation failed: ${error.response?.data || error.message}`); // Log full error response
      throw new Error('Failed to create flight order');
    }
  }
}