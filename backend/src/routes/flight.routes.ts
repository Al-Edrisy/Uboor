import express from 'express';
import { FlightController } from '../controllers/flight.controller';
import validate from '../middleware/validate';
import {
  FlightSearchSchema,
  FlightPricingSchema,
  FlightBookingSchema
} from '../schemas/flight.schema';

const router = express.Router();
const controller = new FlightController();

// Define routes with validation middleware
router.post('/search', validate(FlightSearchSchema), controller.searchFlights);
router.post('/price', validate(FlightPricingSchema), controller.priceFlights);
router.post('/book', validate(FlightBookingSchema), controller.createBooking);

export default router;