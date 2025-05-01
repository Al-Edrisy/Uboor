import { z } from 'zod';

export const CardDetailsSchema = z.object({
  number: z.string()
    .min(15, 'Card number must be at least 15 digits')
    .max(16, 'Card number must be at most 16 digits')
    .regex(/^\d+$/, 'Card number must contain only digits')
    .refine(val => val.startsWith('558'), 'For testing, only cards starting with 558 are accepted'),
  exp_month: z.number()
    .min(1, 'Invalid month')
    .max(12, 'Invalid month'),
  exp_year: z.number()
    .min(new Date().getFullYear(), 'Card has expired'),
  cvc: z.string()
    .min(3, 'CVC must be at least 3 digits')
    .max(4, 'CVC must be at most 4 digits')
    .regex(/^\d+$/, 'CVC must contain only digits')
});

export const PaymentIntentRequestSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code'),
  userId: z.string(),
  bookingId: z.string().optional(),
  card: CardDetailsSchema.optional() // Still optional but with validation when present
});

export type PaymentIntentRequest = z.infer<typeof PaymentIntentRequestSchema>;
export type CardDetails = z.infer<typeof CardDetailsSchema>;