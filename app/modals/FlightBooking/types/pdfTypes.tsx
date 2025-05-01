export interface IPDFData {
  bookingReference: string;
  flights: {
    itineraryType: 'OUTBOUND' | 'RETURN' | 'ONEWAY' | 'ONE_WAY' | 'OUT_BOUND';
    segments: {
      departure: {
        iataCode: string;
        cityName?: string;
        time: string;
      };
      arrival: {
        iataCode: string;
        cityName?: string;
        time: string;
      };
      flightNumber: string;
      duration: string;
      airline: {
        code: string;
        name?: string;
      };
      aircraft?: string;
      cabin: string;
      bookingClass: string;
    }[];
  }[];
  passengers: {
    title?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    documents?: {
      type: string;
      number: string;
      expiry?: string;
    }[];
    nationality?: string;
    contact?: {
      email: string;
      phone?: string;
    };
    ticketNumber?: string;
    seat?: string;
  }[];
  price: {
    total: string;
    currency: string;
    taxes: {
      code: string;
      amount: string;
    }[];
    fees?: {
      type: string;
      amount: string;
    }[];
  };
  payment: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    method?: string;
    processedAt: string;
  };
  contactDetails: {
    agency?: {
      name: string;
      email: string;
      phone: string;
    };
    customer: {
      name: string;
      email: string;
      phone?: string;
      address?: string;
    };
  };
  metadata: {
    issuedBy: string;
    issueDate: string;
    termsLink: string;
  };
}