import { z } from 'zod';

// Schema for creating a payment intent
export const PaymentIntentRequestSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'), // Amount must be a positive number
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code'), // Currency must be a 3-letter code
  userId: z.string().uuid('Invalid user ID format'), // User ID must be a valid UUID
  bookingId: z.string().uuid('Invalid booking ID format'), // Booking ID must be a valid UUID
});

// Schema for the result of a payment intent
export const PaymentResultSchema = z.object({
  id: z.string(), // Payment intent ID
  status: z.string(), // Payment intent status
  amount: z.number(), // Amount charged
  created: z.number(), // Timestamp of creation
});

// Export the schemas for use in other parts of the application
export type PaymentIntentRequest = z.infer<typeof PaymentIntentRequestSchema>;
export type PaymentResult = z.infer<typeof PaymentResultSchema>;