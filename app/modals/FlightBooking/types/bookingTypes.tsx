export type Document = {
    documentType: 'PASSPORT' | 'ID_CARD';
    number: string;
    expiryDate: string;
    issuanceCountry: string;  // Must be 2-letter country code
    validityCountry: string;  // Must be 2-letter country code
    nationality: string;      // Must be 2-letter country code
    holder: boolean;
    issuanceDate: string;
    birthPlace?: string;
    issuanceLocation?: string;
};

export type Traveler = {
    id: string;
    dateOfBirth: string;
    name: {
        firstName: string;
        lastName: string;
    };
    gender: 'MALE' | 'FEMALE';
    contact: {
        emailAddress: string;
        phones: {
            deviceType: 'MOBILE';
            countryCallingCode: string;
            number: string;
        }[];
    };
    documents: Document[];
    travelerType?: 'ADULT' | 'CHILD' | 'INFANT';
};

export type FlightOffer = {
    id: string;
    price: {
        total: string;
        currency: string;
        base?: string;
        fees?: {
            amount: string;
            type: string;
        }[];
        grandTotal?: string;
        billingCurrency?: string;
    };
    travelerPricings: {
        travelerId: string;
        travelerType: 'ADULT' | 'CHILD' | 'INFANT';
        price?: {
            currency: string;
            total: string;
            base: string;
            taxes: {
                amount: string;
                code: string;
            }[];
            refundableTaxes?: string;
        };
        fareDetailsBySegment: {
            segmentId: string;
            cabin: string;
            fareBasis: string;
            brandedFare: string;
            class: string;
            includedCheckedBags: {
                weight: number;
                weightUnit: string;
            };
            includedCabinBags: {
                quantity: number;
                weight?: number;
                weightUnit?: string;
            };
        }[];
    }[];
    itineraries: {
        segments: {
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
            aircraft?: {
                code: string;
            };
            operating?: {
                carrierCode: string;
            };
            duration?: string;
            id?: string;
            numberOfStops?: number;
            co2Emissions?: {
                weight: number;
                weightUnit: string;
                cabin: string;
            }[];
        }[];
    }[];
};

export type FlightOrder = {
    id: string;
    bookingReference: string;
    associatedRecords?: {
        reference: string;
        creationDate: string;
        flightOfferId: string;
    }[];
    travelers: Traveler[];
};

export type FlightBookingModalProps = {
    visible: boolean;
    onClose: () => void;
    flightOffer: FlightOffer;
    onBookingComplete: (order: FlightOrder) => void;
};