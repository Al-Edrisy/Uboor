// backend/src/interfaces/pdf.interface.ts
export interface IPDFData {
    bookingReference: string;
    flight: {
      departureCity: string;
      arrivalCity: string;
      departureTime: string;
      arrivalTime?: string; // Optional
      flightNumber: string;
      duration: string;
      airline?: string;
      aircraft?: string;
    };
    passengers: {
      firstName: string;
      lastName: string;
      passportNumber?: string;
      seatNumber?: string;
      ticketNumber?: string;
    }[];
    payment: {
      amount: number;
      currency: string;
      method: string;
      transactionId: string;
      status: string;
      paymentDate?: string;
    };
    contact?: {
      email: string;
      phone?: string;
    };
  }