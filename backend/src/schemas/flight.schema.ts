import { z } from 'zod';

// ---------------------------
// Common Utility Schemas
// ---------------------------
const IATACodeSchema = z.string().length(3);
const DateTimeISOSchema = z.string().refine(value => {
  return !isNaN(Date.parse(value)) || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[\+\-]\d{2}:\d{2})?$/.test(value);
}, {
  message: 'Invalid datetime format. Use ISO 8601 (e.g., "2024-03-02T14:00:00" or "2024-03-02T14:00:00Z")'
}).optional();
const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.');
const TimeSchema = z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format. Use HH:MM:SS.').optional();
const CurrencySchema = z.string().length(3);

// ---------------------------
// Flight Search Schemas
// ---------------------------
const DepartureDateTimeRangeSchema = z.object({
  date: DateSchema,
  time: TimeSchema
});

const OriginDestinationSchema = z.object({
  id: z.string(),
  originLocationCode: IATACodeSchema,
  destinationLocationCode: IATACodeSchema,
  departureDateTimeRange: DepartureDateTimeRangeSchema
});

const TravelerSchema = z.object({
  id: z.string(),
  travelerType: z.enum(['ADULT', 'CHILD', 'INFANT']).optional(),
  fareOptions: z.array(z.enum(['STANDARD', 'FLEXIBLE'])).optional(),
});


const CabinRestrictionSchema = z.object({
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).optional(),
  coverage: z.enum(['MOST_SEGMENTS', 'ALL_SEGMENTS']).optional(),
  originDestinationIds: z.array(z.string()).optional()
});

const FlightFiltersSchema = z.object({
  cabinRestrictions: z.array(CabinRestrictionSchema).optional(),
  carrierRestrictions: z.object({
    excludedCarrierCodes: z.array(z.string().length(2)).optional()
  }).optional()
});

const SearchCriteriaSchema = z.object({
  maxFlightOffers: z.number().int().positive(),
  flightFilters: FlightFiltersSchema
});

export const FlightSearchSchema = z.object({
  currencyCode: CurrencySchema,
  originDestinations: z.array(OriginDestinationSchema),
  travelers: z.array(TravelerSchema),
  sources: z.array(z.string()),
  searchCriteria: SearchCriteriaSchema
});

// ---------------------------
// Flight Pricing Schemas
// ---------------------------
const AirportTerminalSchema = z.object({
  iataCode: IATACodeSchema,
  terminal: z.string().optional(),
  at: DateTimeISOSchema
});

const SegmentPricingSchema = z.object({
  departure: AirportTerminalSchema,
  arrival: AirportTerminalSchema,
  carrierCode: z.string(),
  number: z.string(),
  aircraft: z.object({ code: z.string() }),
  operating: z.object({ carrierCode: z.string() }).optional(),
  duration: z.string(),
  id: z.string(),
  numberOfStops: z.number().int().nonnegative(),
  blacklistedInEU: z.boolean()
});

const ItinerarySchema = z.object({
  duration: z.string(),
  segments: z.array(SegmentPricingSchema)
});

const FeeSchema = z.object({
  amount: z.string(),
  type: z.string()
});

const PriceBreakdownSchema = z.object({
  currency: CurrencySchema,
  total: z.string(),
  base: z.string(),
  fees: z.array(FeeSchema).optional(),
  grandTotal: z.string().optional()
});

const AmenitySchema = z.object({
  description: z.string(),
  isChargeable: z.boolean(),
  amenityType: z.string(),
  amenityProvider: z.object({ name: z.string() })
});

const FareDetailsSchema = z.object({
  segmentId: z.string(),
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
  fareBasis: z.string(),
  brandedFare: z.string(),
  brandedFareLabel: z.string().optional(),
  class: z.string(),
  includedCheckedBags: z.object({
    quantity: z.number().int().nonnegative().optional().default(0)
  }).optional(),
  amenities: z.array(AmenitySchema)
});

const TravelerPricingSchema = z.object({
  travelerId: z.string(),
  fareOption: z.string(),
  travelerType: z.enum(['ADULT', 'CHILD', 'INFANT']),
  price: PriceBreakdownSchema,
  fareDetailsBySegment: z.array(FareDetailsSchema)
});

const FlightOfferSchema = z.object({
  type: z.literal('flight-offer'),
  id: z.string(),
  source: z.string(),
  instantTicketingRequired: z.boolean(),
  nonHomogeneous: z.boolean(),
  oneWay: z.boolean().optional(),
  isUpsellOffer: z.boolean().optional(),
  lastTicketingDate: DateSchema,
  lastTicketingDateTime: DateTimeISOSchema,
  numberOfBookableSeats: z.number().int().positive(),
  itineraries: z.array(ItinerarySchema),
  price: PriceBreakdownSchema,
  pricingOptions: z.object({
    fareType: z.array(z.string()),
    includedCheckedBagsOnly: z.boolean()
  }),
  validatingAirlineCodes: z.array(z.string()),
  travelerPricings: z.array(TravelerPricingSchema)
});

export const FlightPricingSchema = z.object({
  data: z.object({
    type: z.literal('flight-offers-pricing'),
    flightOffers: z.array(FlightOfferSchema)
  })
});

// ---------------------------
// Booking Schemas
// ---------------------------
const FareDetailsSchema_order = z.object({
  segmentId: z.string(),
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
  fareBasis: z.string(),
  brandedFare: z.string(),
  brandedFareLabel: z.string().optional(),
  class: z.string(),
  includedCheckedBags: z.object({ 
    weight: z.number(),
    weightUnit: z.string()
  }).optional(),
  includedCabinBags: z.object({
    quantity: z.number()
  }).optional(),
  amenities: z.array(AmenitySchema).optional()
});

const FlightOfferSchema_order = z.object({
  type: z.literal('flight-offer'),
  id: z.string(),
  source: z.string(),
  instantTicketingRequired: z.boolean().optional(),
  nonHomogeneous: z.boolean().optional(),
  paymentCardRequired: z.boolean().optional(),
  lastTicketingDate: z.string().optional(),
  itineraries: z.array(z.object({
    segments: z.array(z.object({
      departure: z.object({
        iataCode: z.string().length(3),
        terminal: z.string().optional(),
        at: z.string().optional()
      }),
      arrival: z.object({
        iataCode: z.string().length(3),
        terminal: z.string().optional(),
        at: z.string().optional()
      }),
      carrierCode: z.string(),
      number: z.string(),
      aircraft: z.object({ code: z.string() }),
      operating: z.object({ carrierCode: z.string() }).optional(),
      duration: z.string(),
      id: z.string(),
      numberOfStops: z.number().int().nonnegative(),
      blacklistedInEU: z.boolean().optional(),
      co2Emissions: z.array(z.object({
        weight: z.number(),
        weightUnit: z.string(),
        cabin: z.string()
      })).optional()
    }))
  })),
  price: z.object({
    currency: z.string().length(3),
    total: z.string(),
    base: z.string(),
    fees: z.array(z.object({
      amount: z.string(),
      type: z.string()
    })).optional(),
    grandTotal: z.string(),
    billingCurrency: z.string().length(3).optional()
  }),
  pricingOptions: z.object({
    fareType: z.array(z.string()),
    includedCheckedBagsOnly: z.boolean()
  }).optional(),
  validatingAirlineCodes: z.array(z.string()).nonempty(),
  travelerPricings: z.array(z.object({
    travelerId: z.string(),
    fareOption: z.string(),
    travelerType: z.enum(['ADULT', 'CHILD', 'INFANT']),
    price: z.object({
      currency: z.string().length(3),
      total: z.string(),
      base: z.string(),
      taxes: z.array(z.object({
        amount: z.string(),
        code: z.string()
      })).optional(),
      refundableTaxes: z.string().optional()
    }),
    fareDetailsBySegment: z.array(FareDetailsSchema_order)
  }))
});

const TravelerSchema_order = z.object({
  id: z.string(),
  dateOfBirth: z.string().optional(),
  name: z.object({
    firstName: z.string(),
    lastName: z.string()
  }),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  contact: z.object({
    emailAddress: z.string().email(),
    phones: z.array(z.object({
      deviceType: z.enum(['MOBILE', 'LANDLINE']),
      countryCallingCode: z.string(),
      number: z.string()
    })).optional()
  }),
  documents: z.array(z.object({
    documentType: z.enum(['PASSPORT', 'ID_CARD']),
    birthPlace: z.string().optional(),
    issuanceLocation: z.string().optional(),
    issuanceDate: z.string().optional(),
    number: z.string(),
    expiryDate: z.string().optional(),
    issuanceCountry: z.string().length(2),
    validityCountry: z.string().length(2),
    nationality: z.string().length(2),
    holder: z.boolean()
  })).optional()
});

const RemarksSchema = z.object({
  general: z.array(z.object({
    subType: z.string().optional(),
    text: z.string().optional()
  })).optional()
});

const TicketingAgreementSchema = z.object({
  option: z.enum(['DELAY_TO_CANCEL']).optional(),
  delay: z.string().optional()
});

const ContactInfoSchema = z.object({
  addresseeName: z.object({
    firstName: z.string(),
    lastName: z.string()
  }).optional(),
  companyName: z.string().optional(),
  purpose: z.string().optional(),
  phones: z.array(z.object({
    deviceType: z.enum(['MOBILE', 'LANDLINE']),
    countryCallingCode: z.string(),
    number: z.string()
  })).optional(),
  emailAddress: z.string().email().optional(),
  address: z.object({
    lines: z.array(z.string()).optional(),
    postalCode: z.string().optional(),
    cityName: z.string().optional(),
    countryCode: z.string().length(2).optional()
  }).optional()
});


export const FlightBookingSchema = z.object({
  data: z.object({
    type: z.literal('flight-order'),
    flightOffers: z.array(FlightOfferSchema_order),
    travelers: z.array(TravelerSchema_order),
    remarks: RemarksSchema.optional(),
    ticketingAgreement: TicketingAgreementSchema.optional(),
    contacts: z.array(ContactInfoSchema).optional()
  })
});

// ---------------------------
// Export Consolidated Schemas
// ---------------------------
export type FlightSearchRequest = z.infer<typeof FlightSearchSchema>;
export type FlightPricingRequest = z.infer<typeof FlightPricingSchema>;
export type FlightBookingRequest = z.infer<typeof FlightBookingSchema>;
export type FlightOffer = z.infer<typeof FlightOfferSchema>;