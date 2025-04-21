import { Request, Response } from 'express';
import { AmadeusService } from '../services/amadeus.service';
import {
  FlightSearchSchema,
  FlightPricingSchema,
  FlightBookingSchema
} from '../schemas/flight.schema';
import logger from '../utils/logger';
import { z } from 'zod';

export class FlightController {
  private amadeusService: AmadeusService;

  constructor() {
    this.amadeusService = new AmadeusService();
  }

  // Use arrow functions to preserve 'this' context
  searchFlights = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = FlightSearchSchema.parse(req.body);
      const results = await this.amadeusService.searchFlights(validatedData);
      res.json(results);
    } catch (error) {
      this.handleError(error, res, 'search flights');
    }
  };

  priceFlights = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = FlightPricingSchema.parse(req.body);
      const results = await this.amadeusService.priceFlightOffers(
        validatedData.data.flightOffers // Access nested data
      );
      res.json(results);
    } catch (error) {
      this.handleError(error, res, 'price flights');
    }
  };

  createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = FlightBookingSchema.parse(req.body);
      const results = await this.amadeusService.createFlightOrder(validatedData);
      console.log(results);
      res.status(201).json(results);
    } catch (error) {
      this.handleError(error, res, 'create booking');
    }
  };

  private handleError(error: unknown, res: Response, operation: string) {
    if (error instanceof z.ZodError) {
        logger.error(`Validation error during ${operation}: ${error.errors}`);
        return res.status(400).json({
            error: 'Validation Error',
            details: error.errors
        });
    }

    // Log the entire error object for better debugging
    logger.error(`Error during ${operation}: ${JSON.stringify(error, null, 2)}`);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
        error: `Failed to ${operation}`,
        details: errorMessage
    });
}
}

export default new FlightController();