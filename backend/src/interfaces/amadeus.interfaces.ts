// src/interfaces/amadeus.interfaces.ts


export type CabinType = 'FIRST' | 'BUSINESS' | 'PREMIUM_ECONOMY' | 'ECONOMY';
export type TravelerType = 'ADULT' | 'CHILD' | 'INFANT' | 'SENIOR' | 'YOUTH';
export type FareType = 'PUBLISHED' | 'NEGOTIATED' | 'CORPORATE' | 'PRIVATE';


// ---------------------------
// Authentication Interfaces
// ---------------------------
export interface AmadeusTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// ---------------------------
// Flight Offer Interfaces
// ---------------------------
export interface FlightOffer {
  type: 'flight-offer';
  id: string;
  source: string;
  instantTicketingRequired?: boolean;
  nonHomogeneous?: boolean;
  oneWay?: boolean;
  isUpsellOffer?: boolean;
  lastTicketingDate: string;
  lastTicketingDateTime: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

// ---------------------------
// Itinerary Interface
// ---------------------------
export interface Itinerary {
  duration: string;
  segments: Segment[];
}

// ---------------------------
// Segment Interface
// ---------------------------
export interface Segment {
  departure: AirportTerminal;
  arrival: AirportTerminal;
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  operating?: { carrierCode: string };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU?: boolean;
}

// ---------------------------
// Airport Terminal Interface
// ---------------------------
export interface AirportTerminal {
  iataCode: string;
  terminal?: string;
  at: string;
}

// ---------------------------
// Price Interface
// ---------------------------
export interface Price {
  currency: string;
  total: string;
  base: string;
  fees?: Fee[];
  grandTotal?: string;
}

// ---------------------------
// Fee Interface
// ---------------------------
export interface Fee {
  amount: string;
  type: string;
}

// ---------------------------
// Pricing Options Interface
// ---------------------------
export interface PricingOptions {
  fareType: string[];
  includedCheckedBagsOnly: boolean;
}

// ---------------------------
// Traveler Pricing Interface
// ---------------------------
export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: 'ADULT' | 'CHILD' | 'INFANT';
  price: Price;
  fareDetailsBySegment: FareDetail[];
}

// ---------------------------
// Fare Detail Interface
// ---------------------------
export interface FareDetail {
  segmentId: string;
  cabin: 'FIRST' | 'BUSINESS' | 'ECONOMY' | 'PREMIUM_ECONOMY';
  fareBasis: string;
  brandedFare: string;
  brandedFareLabel?: string;
  class: string;
  includedCheckedBags?: { quantity: number };
  amenities?: Amenity[];
}

// ---------------------------
// Amenity Interface
// ---------------------------
export interface Amenity {
  description: string;
  isChargeable: boolean;
  amenityType: string;
  amenityProvider: { name: string };
}

// ---------------------------
// Traveler Interface
// ---------------------------
export interface Traveler {
  id: string;
  dateOfBirth?: string;
  name: {
    firstName: string;
    lastName: string;
  };
  gender?: 'MALE' | 'FEMALE';
  contact: {
    emailAddress: string;
    phones: {
      deviceType: 'MOBILE' | 'LANDLINE';
      countryCallingCode: string;
      number: string;
    }[];
  };
  documents?: Document[];
}

// ---------------------------
// Document Interface
// ---------------------------
export interface Document {
  documentType: 'PASSPORT' | 'ID_CARD';
  birthPlace?: string;
  issuanceLocation?: string;
  issuanceDate: string;
  number: string;
  expiryDate: string;
  issuanceCountry: string;
  validityCountry: string;
  nationality: string;
  holder: boolean;
}

// ---------------------------
// Remarks Interface
// ---------------------------
export interface Remarks {
  general: {
    subType: string;
    text: string;
  }[];
}

// ---------------------------
// Ticketing Agreement Interface
// ---------------------------
export interface TicketingAgreement {
  option: 'DELAY_TO_CANCEL';
  delay: string;
}

// ---------------------------
// Contact Info Interface
// ---------------------------
export interface ContactInfo {
  addresseeName: {
    firstName: string;
    lastName: string;
  };
  companyName?: string;
  purpose?: string;
  phones: {
    deviceType: 'MOBILE' | 'LANDLINE';
    countryCallingCode: string;
    number: string;
  }[];
  emailAddress: string;
  address?: {
    lines: string[];
    postalCode: string;
    cityName: string;
    countryCode: string;
  };
}

// ---------------------------
// Flight Order Request Interface
// ---------------------------
export interface FlightOrderRequest {
  data: {
    type: 'flight-order';
    flightOffers: FlightOffer[];
    travelers: Traveler[];
    remarks?: Remarks;
    ticketingAgreement?: TicketingAgreement;
    contacts?: ContactInfo[];
  };
}

// ---------------------------
// Flight Order Response Interface
// ---------------------------
export interface FlightOrderResponse {
  data: {
    id: string;
    type: 'flight-order';
    status: string;
    flightOffers: FlightOffer[];
    traveler: {
      id: string;
      name: string;
      email: string;
    };
  };
}

// ---------------------------
// Pricing Response Interface
// ---------------------------
export interface PricingResponse {
  data: {
    type: 'flight-offers-pricing';
    flightOffers: FlightOffer[];
    bookingRequirements: {
      emailAddressRequired: boolean;
      mobilePhoneNumberRequired: boolean;
    };
  };
}

// ---------------------------

export interface BookingResponse {
  data: {
      type: 'flight-order';
      id: string;
      queuingOfficeId: string;
      associatedRecords: Array<{
          reference: string;
          creationDate: string;
          originSystemCode: string;
          flightOfferId: string;
      }>;
      flightOffers: Array<{
          type: 'flight-offer';
          id: string;
          source: string;
          nonHomogeneous: boolean;
          lastTicketingDate: string;
          itineraries: Array<{
              segments: Array<{
                  departure: {
                      iataCode: string;
                      at: string;
                  };
                  arrival: {
                      iataCode: string;
                      at: string;
                  };
                  carrierCode: string;
                  number: string;
                  aircraft: {
                      code: string;
                  };
                  duration: string;
                  id: string;
                  numberOfStops: number;
                  co2Emissions: Array<{
                      weight: number;
                      weightUnit: string;
                      cabin: string;
                  }>;
              }>;
          }>;
          price: {
              currency: string;
              total: string;
              base: string;
              fees: Array<{
                  amount: string;
                  type: string;
              }>;
              grandTotal: string;
              billingCurrency: string;
          };
          pricingOptions: {
              fareType: string[];
              includedCheckedBagsOnly: boolean;
          };
          validatingAirlineCodes: string[];
          travelerPricings: Array<{
              travelerId: string;
              fareOption: string;
              travelerType: 'ADULT' | 'CHILD' | 'INFANT';
              price: {
                  currency: string;
                  total: string;
                  base: string;
                  taxes: Array<{
                      amount: string;
                      code: string;
                  }>;
                  refundableTaxes: string;
              };
              fareDetailsBySegment: Array<{
                  segmentId: string;
                  cabin: string;
                  fareBasis: string;
                  brandedFare: string;
                  class: string;
                  includedCheckedBags: {
                      weight: number;
                      weightUnit: string;
                  };
              }>;
          }>;
      }>;
      travelers: Array<{
          id: string;
          dateOfBirth: string;
          gender: 'MALE' | 'FEMALE';
          name: {
              firstName: string;
              lastName: string;
          };
          documents?: Array<{
              number: string;
              issuanceDate: string;
              expiryDate: string;
              issuanceCountry: string;
              issuanceLocation: string;
              nationality: string;
              birthPlace: string;
              documentType: 'PASSPORT' | 'ID_CARD';
              holder: boolean;
          }>;
          contact: {
              purpose: string;
              phones: Array<{
                  deviceType: 'MOBILE' | 'LANDLINE';
                  countryCallingCode: string;
                  number: string;
              }>;
              emailAddress: string;
          };
      }>;
      remarks: {
          general: Array<{
              subType: string;
              text: string;
          }>;
      };
      ticketingAgreement: {
          option: 'DELAY_TO_CANCEL';
          delay: string;
      };
      automatedProcess: Array<{
          code: string;
          queue: {
              number: string;
              category: string;
          };
          officeId: string;
      }>;
      contacts: Array<{
          addresseeName: {
              firstName: string;
          };
          address: {
              lines: string[];
              postalCode: string;
              countryCode: string;
              cityName: string;
          };
          purpose: string;
          phones: Array<{
              deviceType: 'MOBILE' | 'LANDLINE';
              countryCallingCode: string;
              number: string;
          }>;
          companyName: string;
          emailAddress: string;
      }>;
  };
  dictionaries: {
      locations: {
          [key: string]: {
              cityCode: string;
              countryCode: string;
          };
      };
  };
}




