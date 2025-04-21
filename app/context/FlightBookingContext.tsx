import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  FlightOffer, 
  Traveler, 
  PricingResponse, 
  BookingResponse,
  FlightOrderRequest,
  FlightOrderResponse
} from './../../backend/src/interfaces/amadeus.interfaces'; 
import { 
  FlightSearchRequest, 
  FlightPricingRequest, 
  FlightBookingRequest 
} from './../../backend/src/schemas/flight.schema';
import { 
  searchFlightsAPI, 
  getPriceAPI, 
  createPaymentIntentAPI, 
  confirmPaymentAPI, 
  bookFlightAPI 
} from './../lib/flight';

type Step = 'search' | 'results' | 'details' | 'traveler-info' | 'review' | 'confirmation';

type State = {
  step: Step;
  searchParams: FlightSearchRequest;
  searchResults: FlightOffer[];
  selectedFlight: FlightOffer | null;
  pricingDetails: PricingResponse | null;
  travelerInfo: Traveler[];
  selectedExtras: {
    seats: Record<string, string>; // segmentId -> seatNumber
    baggage: Record<string, number>; // segmentId -> additional kg
  };
  paymentIntent: {
    clientSecret: string | null;
    amount: number;
    currency: string;
  } | null;
  bookingConfirmation: BookingResponse | null;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
};

type Action = 
  | { type: 'SET_STEP'; step: Step }
  | { type: 'SET_SEARCH_PARAMS'; params: FlightSearchRequest }
  | { type: 'SET_RESULTS'; results: FlightOffer[] }
  | { type: 'SELECT_FLIGHT'; flight: FlightOffer }
  | { type: 'SET_PRICING_DETAILS'; details: PricingResponse }
  | { type: 'SET_TRAVELERS'; travelers: Traveler[] }
  | { type: 'SET_EXTRAS'; extras: Partial<State['selectedExtras']> }
  | { type: 'SET_PAYMENT_INTENT'; intent: State['paymentIntent'] }
  | { type: 'SET_CONFIRMATION'; confirmation: BookingResponse }
  | { type: 'SET_LOADING'; key: string; value: boolean }
  | { type: 'SET_ERROR'; key: string; error: string | null }
  | { type: 'RESET_BOOKING' };

const initialState: State = {
  step: 'search',
  searchParams: {
    currencyCode: 'USD',
    originDestinations: [],
    travelers: [],
    sources: ['GDS'],
    searchCriteria: {
      maxFlightOffers: 10,
      flightFilters: {}
    }
  } as FlightSearchRequest,
  searchResults: [],
  selectedFlight: null,
  pricingDetails: null,
  travelerInfo: [],
  selectedExtras: { seats: {}, baggage: {} },
  paymentIntent: null,
  bookingConfirmation: null,
  loading: {},
  errors: {},
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_STEP': 
      return { ...state, step: action.step };
    case 'SET_SEARCH_PARAMS': 
      return { ...state, searchParams: action.params };
    case 'SET_RESULTS': 
      return { ...state, searchResults: action.results };
    case 'SELECT_FLIGHT': 
      return { ...state, selectedFlight: action.flight };
    case 'SET_PRICING_DETAILS': 
      return { ...state, pricingDetails: action.details };
    case 'SET_TRAVELERS': 
      return { ...state, travelerInfo: action.travelers };
    case 'SET_EXTRAS': 
      return { 
        ...state, 
        selectedExtras: { 
          ...state.selectedExtras, 
          ...action.extras 
        } 
      };
    case 'SET_PAYMENT_INTENT': 
      return { ...state, paymentIntent: action.intent };
    case 'SET_CONFIRMATION': 
      return { ...state, bookingConfirmation: action.confirmation };
    case 'SET_LOADING': 
      return { 
        ...state, 
        loading: { ...state.loading, [action.key]: action.value } 
      };
    case 'SET_ERROR': 
      return { 
        ...state, 
        errors: { ...state.errors, [action.key]: action.error } 
      };
    case 'RESET_BOOKING':
      return { 
        ...initialState,
        searchParams: state.searchParams // Keep search params for new searches
      };
    default: 
      return state;
  }
};

type ContextValue = {
  state: State;
  actions: {
    searchFlights: (params: FlightSearchRequest) => Promise<void>;
    selectFlight: (flight: FlightOffer) => Promise<void>;
    getFlightPricing: () => Promise<void>;
    saveTravelers: (travelers: Traveler[]) => void;
    updateExtras: (extras: Partial<State['selectedExtras']>) => void;
    createPaymentIntent: () => Promise<void>;
    confirmPayment: (paymentId: string) => Promise<void>;
    finalizeBooking: () => Promise<void>;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    resetBooking: () => void;
  };
};

const FlightBookingContext = createContext<ContextValue>(null!);

export const FlightBookingProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setLoading = useCallback((key: string, value: boolean) => {
    dispatch({ type: 'SET_LOADING', key, value });
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    dispatch({ type: 'SET_ERROR', key, error });
  }, []);

  const searchFlights = useCallback(async (params: FlightSearchRequest) => {
    try {
      setLoading('search', true);
      setError('search', null);
      
      const results = await searchFlightsAPI(params);
      
      dispatch({ type: 'SET_SEARCH_PARAMS', params });
      dispatch({ type: 'SET_RESULTS', results });
      dispatch({ type: 'SET_STEP', step: 'results' });
    } catch (error) {
      setError('search', error instanceof Error ? error.message : 'Failed to search flights');
      throw error;
    } finally {
      setLoading('search', false);
    }
  }, [setLoading, setError]);

  const selectFlight = useCallback(async (flight: FlightOffer) => {
    dispatch({ type: 'SELECT_FLIGHT', flight });
    dispatch({ type: 'SET_STEP', step: 'details' });
  }, []);

  const getFlightPricing = useCallback(async () => {
    if (!state.selectedFlight) return;

    try {
      setLoading('pricing', true);
      setError('pricing', null);

      const pricingRequest: FlightPricingRequest = {
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [state.selectedFlight]
        }
      };

      const pricingDetails = await getPriceAPI(pricingRequest);
      
      dispatch({ type: 'SET_PRICING_DETAILS', details: pricingDetails });
      dispatch({ type: 'SET_STEP', step: 'traveler-info' });
    } catch (error) {
      setError('pricing', error instanceof Error ? error.message : 'Failed to get flight pricing');
      throw error;
    } finally {
      setLoading('pricing', false);
    }
  }, [state.selectedFlight, setLoading, setError]);

  const saveTravelers = useCallback((travelers: Traveler[]) => {
    dispatch({ type: 'SET_TRAVELERS', travelers });
    dispatch({ type: 'SET_STEP', step: 'review' });
  }, []);

  const updateExtras = useCallback((extras: Partial<State['selectedExtras']>) => {
    dispatch({ type: 'SET_EXTRAS', extras });
  }, []);

  const createPaymentIntent = useCallback(async () => {
    if (!state.selectedFlight || !state.pricingDetails) return;

    try {
      setLoading('paymentIntent', true);
      setError('paymentIntent', null);

      const amount = Math.round(parseFloat(state.selectedFlight.price.total || '0') * 100);
      const currency = state.selectedFlight.price.currency.toLowerCase();
      const userId = "current-user-id"; // Replace with actual user ID
      const bookingId = "temp-booking-id"; // Generate or get from server

      const paymentIntent = await createPaymentIntentAPI({
        amount,
        currency,
        userId,
        bookingId
      });

      dispatch({ 
        type: 'SET_PAYMENT_INTENT', 
        intent: {
          clientSecret: paymentIntent.clientSecret,
          amount,
          currency
        }
      });
    } catch (error) {
      setError('paymentIntent', error instanceof Error ? error.message : 'Failed to create payment intent');
      throw error;
    } finally {
      setLoading('paymentIntent', false);
    }
  }, [state.selectedFlight, state.pricingDetails, setLoading, setError]);

  const confirmPayment = useCallback(async (paymentId: string) => {
    try {
      setLoading('paymentConfirmation', true);
      setError('paymentConfirmation', null);

      await confirmPaymentAPI({ paymentId });
    } catch (error) {
      setError('paymentConfirmation', error instanceof Error ? error.message : 'Payment confirmation failed');
      throw error;
    } finally {
      setLoading('paymentConfirmation', false);
    }
  }, [setLoading, setError]);

  const finalizeBooking = useCallback(async () => {
    if (!state.selectedFlight || !state.travelerInfo.length) return;

    try {
      setLoading('booking', true);
      setError('booking', null);

      const bookingRequest: FlightBookingRequest = {
        data: {
          type: 'flight-order',
          flightOffers: [state.selectedFlight],
          travelers: state.travelerInfo,
          remarks: {
            general: [{
              subType: 'GENERAL_MISCELLANEOUS',
              text: 'BOOKING FROM MOBILE APP'
            }]
          },
          ticketingAgreement: {
            option: 'DELAY_TO_CANCEL',
            delay: '6D'
          },
          contacts: [{
            addresseeName: {
              firstName: 'APP',
              lastName: 'USER'
            },
            emailAddress: 'user@example.com',
            phones: [{
              deviceType: 'MOBILE',
              countryCallingCode: '1',
              number: '5555555555'
            }]
          }]
        }
      };

      const bookingConfirmation = await bookFlightAPI(bookingRequest);
      
      dispatch({ type: 'SET_CONFIRMATION', confirmation: bookingConfirmation });
      dispatch({ type: 'SET_STEP', step: 'confirmation' });
    } catch (error) {
      setError('booking', error instanceof Error ? error.message : 'Flight booking failed');
      throw error;
    } finally {
      setLoading('booking', false);
    }
  }, [state.selectedFlight, state.travelerInfo, setLoading, setError]);

  const goToNextStep = useCallback(() => {
    const steps: Step[] = ['search', 'results', 'details', 'traveler-info', 'review', 'confirmation'];
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex < steps.length - 1) {
      dispatch({ type: 'SET_STEP', step: steps[currentIndex + 1] });
    }
  }, [state.step]);

  const goToPreviousStep = useCallback(() => {
    const steps: Step[] = ['search', 'results', 'details', 'traveler-info', 'review', 'confirmation'];
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', step: steps[currentIndex - 1] });
    }
  }, [state.step]);

  const resetBooking = useCallback(() => {
    dispatch({ type: 'RESET_BOOKING' });
  }, []);

  const actions = {
    searchFlights,
    selectFlight,
    getFlightPricing,
    saveTravelers,
    updateExtras,
    createPaymentIntent,
    confirmPayment,
    finalizeBooking,
    goToNextStep,
    goToPreviousStep,
    resetBooking
  };

  return (
    <FlightBookingContext.Provider value={{ state, actions }}>
      {children}
    </FlightBookingContext.Provider>
  );
};

export const useFlightBooking = () => {
  const context = useContext(FlightBookingContext);
  if (!context) {
    throw new Error('useFlightBooking must be used within a FlightBookingProvider');
  }
  return context;
};