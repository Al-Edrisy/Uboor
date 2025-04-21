export interface ApiError {
    message: string;
    code?: string;
    statusCode?: number;
  }
  
  export type ApiResponse<T> = {
    data: T;
    meta?: {
      count?: number;
      total?: number;
    };
    dictionaries?: Record<string, any>;
  };
  
  export interface FlightSearchParams {
    currencyCode: string;
    originDestinations: Array<{
      id: string;
      originLocationCode: string;
      destinationLocationCode: string;
      departureDateTimeRange: {
        date: string;
        time: string;
      };
    }>;
    travelers: Array<{
      id: string;
      travelerType: 'ADULT' | 'CHILD' | 'INFANT';
      fareOptions: string[];
    }>;
    sources: string[];
    searchCriteria: {
      maxFlightOffers: number;
      flightFilters?: {
        cabinRestrictions?: Array<{
          cabin: string;
          coverage: string;
          originDestinationIds: string[];
        }>;
        carrierRestrictions?: {
          excludedCarrierCodes?: string[];
        };
      };
    };
  }