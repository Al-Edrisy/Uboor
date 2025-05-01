import { z } from 'zod';

const passengerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  documents: z.array(
    z.object({
      type: z.string(),
      number: z.string(),
      expiry: z.string().optional()
    })
  ).optional(),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional()
  }).optional(),
  ticketNumber: z.string().optional(),
  seat: z.string().optional()
});

export const pdfSchema = z.object({
  bookingReference: z.string(),
  flights: z.array(
    z.object({
      itineraryType: z.enum(['OUTBOUND', 'RETURN', 'ONEWAY', 'ONE_WAY', 'OUT_BOUND']),
      segments: z.array(
        z.object({
          departure: z.object({
            iataCode: z.string(),
            cityName: z.string().optional(),
            time: z.string()
          }),
          arrival: z.object({
            iataCode: z.string(),
            cityName: z.string().optional(),
            time: z.string()
          }),
          airline: z.object({
            code: z.string(),
            name: z.string().optional()
          }),
          flightNumber: z.string(),
          duration: z.string(),
          cabin: z.string(),
          bookingClass: z.string(),
          aircraft: z.string().optional()
        })
      )
    })
  ),
  passengers: z.array(passengerSchema).min(1),
  price: z.object({
    total: z.string(),
    currency: z.string(),
    taxes: z.array(
      z.object({
        code: z.string(),
        amount: z.string()
      })
    ),
    fees: z.array(
      z.object({
        type: z.string(),
        amount: z.string()
      })
    ).optional()
  }),
  payment: z.object({
    id: z.string(),
    status: z.string(),
    amount: z.number(),
    currency: z.string(),
    method: z.string().optional(),
    processedAt: z.string()
  }),
  contactDetails: z.object({
    agency: z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string()
    }).optional(),
    customer: z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string().optional(),
      address: z.string().optional()
    })
  }),
  metadata: z.object({
    issuedBy: z.string(),
    issueDate: z.string(),
    termsLink: z.string()
  })
});

export const emailPdfSchema = pdfSchema.extend({
  email: z.string().email()
});