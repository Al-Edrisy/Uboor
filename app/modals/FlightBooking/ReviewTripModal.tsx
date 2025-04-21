


import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Image
} from 'react-native';
import {
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  Entypo
} from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColor } from '@/components/Themed';
import { FlightOffer, Itinerary, Segment, TravelerPricing, FareDetail } from '../../interfaces/amadeus.interfaces';

type ReviewTripModalProps = {
  visible: boolean;
  onClose: () => void;
  flight: FlightOffer;
  travelers: Traveler[];
  onCheckout: (orderData: any) => void;
  loading?: boolean;
  onSelectSeats?: () => void;
  onChangeFlight?: () => void;
};

const ReviewTripModal: React.FC<ReviewTripModalProps> = ({
  visible,
  onClose,
  flight,
  travelers,
  onCheckout,
  loading = false,
  onSelectSeats,
  onChangeFlight
}) => {
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const highlightColor = useThemeColor({}, 'highlight');
  const borderColor = useThemeColor({}, 'border');
  const secondaryColor = useThemeColor({}, 'secondary');

  const [priceDropProtection, setPriceDropProtection] = useState(false);
  const [expandedItinerary, setExpandedItinerary] = useState<number | null>(null);

  // Format time as "HH:MM"
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date as "Day, Month DD"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Format duration as "Xh Ym"
  const formatDuration = (duration: string) => {
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  };

  // Get included bags for a segment
  const getIncludedBags = (segmentId: string, travelerPricing: TravelerPricing) => {
    const segment = travelerPricing.fareDetailsBySegment.find(s => s.segmentId === segmentId);
    return segment?.includedCheckedBags?.quantity || 0;
  };

  // Get cabin class name
  const getCabinName = (cabin: string) => {
    switch (cabin) {
      case 'ECONOMY': return 'Economy';
      case 'PREMIUM_ECONOMY': return 'Premium Economy';
      case 'BUSINESS': return 'Business';
      case 'FIRST': return 'First Class';
      default: return cabin;
    }
  };

  // Render flight itinerary
  const renderItinerary = (itinerary: Itinerary, index: number) => {
    const isExpanded = expandedItinerary === index;
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    const isRoundTrip = flight.itineraries.length > 1;

    return (
      <View key={index} style={[styles.itineraryCard, { backgroundColor: surfaceColor }]}>
        <TouchableOpacity
          onPress={() => setExpandedItinerary(isExpanded ? null : index)}
          style={styles.itineraryHeader}
        >
          <View style={styles.itinerarySummary}>
            <Text style={[styles.itineraryTitle, { color: textColor }]}>
              {isRoundTrip ? (index === 0 ? 'Outbound' : 'Return') : 'Flight'}
            </Text>
            <Text style={[styles.itineraryDates, { color: secondaryColor }]}>
              {formatDate(firstSegment.departure.at)}
            </Text>
          </View>
          <View style={styles.itineraryRoute}>
            <Text style={[styles.routeAirport, { color: textColor }]}>
              {firstSegment.departure.iataCode}
            </Text>
            <View style={styles.routeLine}>
              <View style={[styles.routeDot, { backgroundColor: highlightColor }]} />
              <View style={[styles.routeLineInner, { backgroundColor: borderColor }]} />
              <View style={[styles.routeDot, { backgroundColor: highlightColor }]} />
            </View>
            <Text style={[styles.routeAirport, { color: textColor }]}>
              {lastSegment.arrival.iataCode}
            </Text>
          </View>
          <MaterialIcons
            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={secondaryColor}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.itineraryDetails}>
            {itinerary.segments.map((segment, segIndex) => (
              <View key={segIndex} style={styles.segmentContainer}>
                <View style={styles.segmentHeader}>
                  <View style={styles.segmentTiming}>
                    <Text style={[styles.segmentTime, { color: textColor }]}>
                      {formatTime(segment.departure.at)}
                    </Text>
                    <Text style={[styles.segmentAirport, { color: highlightColor }]}>
                      {segment.departure.iataCode}
                    </Text>
                  </View>

                  <View style={styles.segmentDuration}>
                    <Text style={[styles.durationText, { color: secondaryColor }]}>
                      {formatDuration(segment.duration)}
                    </Text>
                  </View>

                  <View style={styles.segmentTiming}>
                    <Text style={[styles.segmentTime, { color: textColor }]}>
                      {formatTime(segment.arrival.at)}
                    </Text>
                    <Text style={[styles.segmentAirport, { color: highlightColor }]}>
                      {segment.arrival.iataCode}
                    </Text>
                  </View>
                </View>

                <View style={styles.segmentInfo}>
                  <Text style={[styles.airlineText, { color: textColor }]}>
                    {segment.carrierCode} {segment.number} • {getCabinName(segment.cabin)}
                  </Text>
                </View>

                {segIndex < itinerary.segments.length - 1 && (
                  <View style={styles.connectionContainer}>
                    <Text style={[styles.connectionText, { color: secondaryColor }]}>
                      Connection: {formatDuration(segment.duration)} at {segment.arrival.iataCode}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity 
              style={[styles.changeFlightButton, { borderColor: highlightColor }]}
              onPress={onChangeFlight}
            >
              <MaterialIcons name="flight" size={18} color={highlightColor} />
              <Text style={[styles.changeFlightText, { color: highlightColor }]}>
                Change Flight
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Render fare details
  const renderFareDetails = () => {
    return (
      <View style={[styles.fareCard, { backgroundColor: surfaceColor }]}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="receipt" size={20} color={highlightColor} />
          <Text style={[styles.cardTitle, { color: textColor }]}>Fare Details</Text>
        </View>

        {flight.travelerPricings.map((travelerPricing, index) => {
          const traveler = travelers.find(t => t.id === travelerPricing.travelerId);
          const travelerType = travelerPricing.travelerType === 'ADULT' ? 'Adult' :
                            travelerPricing.travelerType === 'CHILD' ? 'Child' : 'Infant';

          return (
            <View key={index} style={styles.travelerPricing}>
              <Text style={[styles.travelerType, { color: highlightColor }]}>
                {travelerType} {traveler ? `(${traveler.name.firstName} ${traveler.name.lastName})` : ''}
              </Text>
              
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: textColor }]}>Base Fare:</Text>
                <Text style={[styles.priceValue, { color: textColor }]}>
                  {travelerPricing.price.base} {flight.price.currency}
                </Text>
              </View>
              
              {travelerPricing.fareDetailsBySegment.map((segment, segIndex) => (
                <View key={segIndex} style={styles.segmentFare}>
                  <Text style={[styles.segmentFareLabel, { color: secondaryColor }]}>
                    {segment.segmentId}: {getCabinName(segment.cabin)} ({segment.class})
                  </Text>
                  <Text style={[styles.segmentFareValue, { color: secondaryColor }]}>
                    Bags: {segment.includedCheckedBags?.quantity || 0}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        <View style={styles.priceRow}>
          <Text style={[styles.totalLabel, { color: textColor }]}>Total Price:</Text>
          <Text style={[styles.totalValue, { color: highlightColor }]}>
            {flight.price.total} {flight.price.currency}
          </Text>
        </View>
      </View>
    );
  };

  // Render seat selection card
  const renderSeatSelection = () => {
    const hasSeatSelection = flight.travelerPricings.some(tp => 
      tp.fareDetailsBySegment.some(fd => 
        fd.amenities?.some(a => a.amenityType === 'SEAT_SELECTION')
      )
    );

    return (
      <View style={[styles.seatCard, { backgroundColor: surfaceColor }]}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="seat-recline-normal" size={20} color={highlightColor} />
          <Text style={[styles.cardTitle, { color: textColor }]}>Seat Selection</Text>
        </View>
        
        <Text style={[styles.seatInfoText, { color: secondaryColor }]}>
          {hasSeatSelection ? 
            "You can select your seats now or during check-in" : 
            "Seat selection may be available during check-in"}
        </Text>
        
        <TouchableOpacity 
          style={[styles.selectSeatButton, { 
            backgroundColor: hasSeatSelection ? highlightColor : borderColor 
          }]}
          onPress={onSelectSeats}
          disabled={!hasSeatSelection}
        >
          <Text style={styles.selectSeatText}>
            {hasSeatSelection ? "Select Seats" : "Seat Selection Not Available"}
          </Text>
          <MaterialIcons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render baggage information
  const renderBaggageInfo = () => {
    const includedBags = flight.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags?.quantity || 0;
    
    return (
      <View style={[styles.baggageCard, { backgroundColor: surfaceColor }]}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="suitcase" size={20} color={highlightColor} />
          <Text style={[styles.cardTitle, { color: textColor }]}>Baggage Information</Text>
        </View>
        
        <View style={styles.baggageRow}>
          <View style={styles.baggageIcon}>
            <FontAwesome5 name="suitcase" size={24} color={highlightColor} />
            <Text style={[styles.baggageCount, { color: textColor }]}>{includedBags}</Text>
          </View>
          
          <View style={styles.baggageDetails}>
            <Text style={[styles.baggageTitle, { color: textColor }]}>Included Checked Bags</Text>
            <Text style={[styles.baggageSubtitle, { color: secondaryColor }]}>
              {includedBags > 0 ? 
                `${includedBags} bag${includedBags > 1 ? 's' : ''} included (max 23kg each)` : 
                'No checked bags included'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.addBaggageButton}>
          <Text style={[styles.addBaggageText, { color: highlightColor }]}>
            Add Additional Baggage
          </Text>
          <MaterialIcons name="add" size={18} color={highlightColor} />
        </TouchableOpacity>
      </View>
    );
  };

  // Render price drop protection
  const renderPriceDropProtection = () => {
    return (
      <View style={[styles.protectionCard, { backgroundColor: surfaceColor }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="price-change" size={20} color={highlightColor} />
          <Text style={[styles.cardTitle, { color: textColor }]}>Price Drop Protection</Text>
        </View>
        
        <View style={styles.protectionRow}>
          <View style={styles.protectionInfo}>
            <Text style={[styles.protectionTitle, { color: textColor }]}>
              Get refunded if the price drops
            </Text>
            <Text style={[styles.protectionSubtitle, { color: secondaryColor }]}>
              We'll refund you the difference if the flight price decreases before departure
            </Text>
          </View>
          
          <Switch
            value={priceDropProtection}
            onValueChange={setPriceDropProtection}
            trackColor={{ false: borderColor, true: highlightColor }}
            thumbColor="#ffffff"
          />
        </View>
      </View>
    );
  };

  // Render free cancellation
  const renderFreeCancellation = () => {
    return (
      <View style={[styles.cancellationCard, { backgroundColor: surfaceColor }]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="cancel" size={20} color="#4CAF50" />
          <Text style={[styles.cardTitle, { color: textColor }]}>Free Cancellation</Text>
        </View>
        
        <Text style={[styles.cancellationText, { color: secondaryColor }]}>
          <MaterialIcons name="check-circle" size={16} color="#4CAF50" /> Free cancellation within 24 hours of booking
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: surfaceColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={highlightColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Review Your Trip</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Main Content */}
        <ScrollView style={styles.content}>
          {flight.itineraries.map((itinerary, index) => renderItinerary(itinerary, index))}
          
          {renderFareDetails()}
          {renderSeatSelection()}
          {renderBaggageInfo()}
          {renderPriceDropProtection()}
          {renderFreeCancellation()}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: surfaceColor }]}>
          <View style={styles.totalPriceContainer}>
            <Text style={[styles.totalLabel, { color: textColor }]}>Total</Text>
            <Text style={[styles.totalPrice, { color: highlightColor }]}>
              {flight.price.total} {flight.price.currency}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: highlightColor }]}
            onPress={() => onCheckout({
              flightOffers: [flight],
              travelers,
              priceDropProtection
            })}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                <FontAwesome name="credit-card" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  itineraryCard: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  itineraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itinerarySummary: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itineraryDates: {
    fontSize: 14,
    marginTop: 4,
  },
  itineraryRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  routeAirport: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  routeLineInner: {
    flex: 1,
    height: 1,
  },
  itineraryDetails: {
    padding: 16,
    paddingTop: 0,
  },
  segmentContainer: {
    marginBottom: 16,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  segmentTiming: {
    alignItems: 'center',
    minWidth: 80,
  },
  segmentTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  segmentAirport: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  segmentDuration: {
    alignItems: 'center',
    minWidth: 80,
  },
  durationText: {
    fontSize: 14,
  },
  segmentInfo: {
    marginLeft: 16,
  },
  airlineText: {
    fontSize: 14,
  },
  connectionContainer: {
    marginTop: 8,
    marginBottom: 16,
    paddingLeft: 16,
  },
  connectionText: {
    fontSize: 12,
  },
  changeFlightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 8,
  },
  changeFlightText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  fareCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  seatCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  baggageCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  protectionCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cancellationCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  travelerPricing: {
    marginBottom: 12,
  },
  travelerType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  segmentFare: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingLeft: 8,
  },
  segmentFareLabel: {
    fontSize: 12,
  },
  segmentFareValue: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  seatInfoText: {
    fontSize: 14,
    marginBottom: 16,
  },
  selectSeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  selectSeatText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  baggageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  baggageIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  baggageCount: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#3F51B5',
    color: 'white',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 12,
  },
  baggageDetails: {
    flex: 1,
  },
  baggageTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  baggageSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  addBaggageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  addBaggageText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  protectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  protectionInfo: {
    flex: 1,
    marginRight: 16,
  },
  protectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  protectionSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  cancellationText: {
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  totalPriceContainer: {
    flex: 1,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    flex: 2,
    marginLeft: 16,
  },
  checkoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default ReviewTripModal;