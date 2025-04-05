// app/context/FlightBookingContext.tsx
import React, { createContext, useState, useContext } from 'react';

type FlightBookingContextType = {
  isFlightModalVisible: boolean;
  setFlightModalVisible: (visible: boolean) => void;
};

const FlightBookingContext = createContext<FlightBookingContextType | undefined>(undefined);

export const FlightBookingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFlightModalVisible, setFlightModalVisible] = useState(false);

  return (
    <FlightBookingContext.Provider value={{ isFlightModalVisible, setFlightModalVisible }}>
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