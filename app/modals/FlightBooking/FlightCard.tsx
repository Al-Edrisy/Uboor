import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FlightCard = ({ flight, dictionaries }) => {
  const itinerary = flight.itineraries[0];
  const firstSegment = itinerary.segments[0];
  const lastSegment = itinerary.segments[itinerary.segments.length - 1];

  return (
    <View style={styles.card}>
      {/* Route Summary */}
      <Text style={styles.title}>
        {firstSegment.departure.iataCode} → {lastSegment.arrival.iataCode}
      </Text>

      {/* Date & Time */}
      <Text>
        Departure: {new Date(firstSegment.departure.at).toLocaleString()}
      </Text>
      <Text>
        Arrival: {new Date(lastSegment.arrival.at).toLocaleString()}
      </Text>

      {/* Airline & Flight Numbers for first segment */}
      <Text>
        Flight: {firstSegment.carrierCode} {firstSegment.number} - {dictionaries.carriers[firstSegment.carrierCode]}
      </Text>

      {/* Overall Duration */}
      <Text>Duration: {itinerary.duration}</Text>

      {/* Price */}
      <Text>Total Price: {flight.price.currency} {flight.price.total}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default FlightCard;
