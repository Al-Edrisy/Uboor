import { z } from 'zod';

const passengerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  passportNumber: z.string().optional(),
});

const flightSchema = z.object({
  departureCity: z.string().min(1),
  arrivalCity: z.string().min(1),
  departureTime: z.string().min(1),
  flightNumber: z.string().min(1),
  duration: z.string().min(1),
});

const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  method: z.string().min(1),
  transactionId: z.string().min(1),
  status: z.string().min(1),
});

export const pdfSchema = z.object({
  email: z.string().email(),
  bookingReference: z.string().min(1),
  flight: flightSchema,
  passengers: z.array(passengerSchema).nonempty(),
  payment: paymentSchema,
});

export type PDFSchema = z.infer<typeof pdfSchema>;