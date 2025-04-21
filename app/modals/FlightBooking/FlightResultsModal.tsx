import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert,
  SectionList
} from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useThemeColor
} from '@/components/Themed';
import { useTheme } from './../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

// Define types
type FlightOffer = {
  id: string;
  price: {
    total: string;
    currency: string;
    base: string;
  };
  travelerPricings: {
    travelerId: string;
    travelerType: string;
    price: {
      total: string;
      base: string;
      taxes?: {
        amount: string;
        code: string;
      }[];
    };
    fareDetailsBySegment: {
      segmentId: string;
      cabin: string;
      fareBasis: string;
      brandedFare?: string;
      class: string;
      includedCheckedBags?: {
        quantity: number;
      };
      amenities?: {
        description: string;
        isChargeable: boolean;
        amenityType: string;
      }[];
    }[];
  }[];
  itineraries: {
    duration: string;
    segments: {
      departure: {
        iataCode: string;
        at: string;
        terminal?: string;
      };
      arrival: {
        iataCode: string;
        at: string;
        terminal?: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      duration: string;
      id: string;
      co2Emissions?: {
        weight: number;
        weightUnit: string;
        cabin: string;
      }[];
    }[];
  }[];
  dictionaries?: any;
  pricingData?: FlightOfferPricingResponse;
  searchParams?: any;
};

type FlightOfferPricingResponse = {
  data: {
    type: string;
    flightOffers: FlightOffer[];
    bookingRequirements?: {
      emailAddressRequired: boolean;
      mobilePhoneNumberRequired: boolean;
      travelerRequirements?: {
        documentRequired: boolean;
        dateOfBirthRequired: boolean;
      }[];
    };
  };
  dictionaries?: any;
};

// Update the props type
type FlightResultsModalProps = {
  visible: boolean;
  onClose: () => void;
  results: FlightOffer[];
  searchParams: any;
  onSelectFlight: (offer: FlightOffer) => void;
  onBookFlight: (offer: FlightOffer) => void; // Add this prop
};

const FlightResultsModal: React.FC<FlightResultsModalProps> = ({
  visible,
  onClose,
  results,
  searchParams,
  onSelectFlight,
  onBookFlight
}) => {
  const { theme } = useTheme();
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [loadingDates, setLoadingDates] = useState(false);
  const [confirmingFlight, setConfirmingFlight] = useState(false);
  const [priceLoading, setPriceLoading] = useState<{ [key: number]: boolean }>({});
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({}, 'highlight');
  const borderColor = useThemeColor({}, 'border');
  const secondaryColor = useThemeColor({}, 'secondary');
  const cardBackground = useThemeColor({}, 'warning');

  const generateDateRange = useCallback(() => {
    const range = [];
    const baseDate = new Date(searchParams.flights[0].departureDate);

    const prices = results.map(r => parseFloat(r.price.total));
    const minPrice = prices.length ? Math.min(...prices) : 100;
    const maxPrice = prices.length ? Math.max(...prices) : 500;

    for (let i = -3; i <= 3; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);

      if (date >= new Date()) {
        range.push({
          date,
          formattedDate: date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
          price: `${Math.floor(Math.random() * (maxPrice - minPrice + 1) + minPrice)}`
        });
      }
    }

    return range;
  }, [results, searchParams.flights]);

  const dateRange = generateDateRange();

  useEffect(() => {
    const initialDate = new Date(searchParams.flights[0].departureDate);
    const index = dateRange.findIndex(d =>
      d.date.toDateString() === initialDate.toDateString()
    );
    if (index >= 0) setSelectedDateIndex(index);
  }, [dateRange, searchParams.flights]);

  const handleDateSelect = async (index: number) => {
    setSelectedDateIndex(index);
    setLoadingDates(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoadingDates(false);
  };

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatDuration = useCallback((start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, []);

  const handlePriceRequest = async (offer: FlightOffer, index: number) => {
    setPriceLoading(prev => ({ ...prev, [index]: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pricingData: FlightOfferPricingResponse = {
        data: {
          type: "flight-offers-pricing",
          flightOffers: [offer],
          bookingRequirements: {
            emailAddressRequired: true,
            mobilePhoneNumberRequired: true,
          },
        },
        dictionaries: offer.dictionaries,
      };
      return {
        ...offer,
        pricingData,
      };
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pricing details.');
      throw error;
    } finally {
      setPriceLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleSelectFlight = async (offer: FlightOffer) => {
    setConfirmingFlight(true);

    try {
      let updatedOffer = offer;
      if (!offer.pricingData) {
        updatedOffer = await handlePriceRequest(offer, results.indexOf(offer));
      }

      setSelectedFlight(updatedOffer);
      setShowDetailsModal(true);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to load flight details. Please try again.",
        [{ text: "OK" }]
      );
      console.error("Error loading flight details:", error);
    } finally {
      setConfirmingFlight(false);
    }
  };

  const renderDateItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity
      style={[
        styles.dateItem,
        {
          backgroundColor: index === selectedDateIndex ? highlightColor : surfaceColor,
          borderColor: index === selectedDateIndex ? highlightColor : borderColor,
        }
      ]}
      onPress={() => handleDateSelect(index)}
      disabled={loadingDates}
    >
      <Text style={[
        styles.dateText,
        {
          color: index === selectedDateIndex ? '#fff' : textColor,
          fontWeight: index === selectedDateIndex ? '600' : '400',
        }
      ]}>
        {item.formattedDate.split(',')[0]}
      </Text>
      <Text style={[
        styles.dateDayText,
        {
          color: index === selectedDateIndex ? '#fff' : textColor,
          fontWeight: index === selectedDateIndex ? '600' : '500',
        }
      ]}>
        {item.formattedDate.split(',')[1].trim()}
      </Text>
      <Text style={[
        styles.priceText,
        {
          color: index === selectedDateIndex ? '#fff' : highlightColor,
          fontWeight: '600',
        }
      ]}>
        {item.price}
      </Text>
    </TouchableOpacity>
  );

  const PricingDetailsModal = () => {
    if (!selectedFlight?.pricingData) return null;

    const offer = selectedFlight.pricingData.data.flightOffers[0];
    const totalPrice = offer.price.total;
    const currency = offer.price.currency;
    const basePrice = offer.price.base;
    const taxes = (parseFloat(totalPrice) - parseFloat(basePrice)).toFixed(2);

    const renderTravelerSection = (traveler: any) => {
      const travelerType = traveler.travelerType === 'ADULT' ? 'Adult' :
        traveler.travelerType === 'CHILD' ? 'Child' : 'Infant';
      return (
        <View style={[styles.travelerSection, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.travelerHeader, { color: highlightColor }]}>
            {travelerType} Pricing
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: textColor }]}>Total:</Text>
            <Text style={[styles.priceValue, { color: textColor }]}>
              {traveler.price.total} {currency}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: textColor }]}>Base:</Text>
            <Text style={[styles.priceValue, { color: textColor }]}>
              {traveler.price.base} {currency}
            </Text>
          </View>

          {traveler.fareDetailsBySegment.map((segment: any, idx: number) => (
            <View key={idx} style={styles.segmentDetails}>
              <Text style={[styles.segmentTitle, { color: secondaryColor }]}>
                Segment {segment.segmentId} - {segment.cabin} Class
              </Text>
              <View style={styles.segmentInfoRow}>
                <Text style={[styles.segmentLabel, { color: textColor }]}>Fare Basis:</Text>
                <Text style={[styles.segmentValue, { color: textColor }]}>{segment.fareBasis}</Text>
              </View>
              {segment.brandedFare && (
                <View style={styles.segmentInfoRow}>
                  <Text style={[styles.segmentLabel, { color: textColor }]}>Branded Fare:</Text>
                  <Text style={[styles.segmentValue, { color: textColor }]}>{segment.brandedFare}</Text>
                </View>
              )}
              <View style={styles.segmentInfoRow}>
                <Text style={[styles.segmentLabel, { color: textColor }]}>Class:</Text>
                <Text style={[styles.segmentValue, { color: textColor }]}>{segment.class}</Text>
              </View>
              {segment.includedCheckedBags && (
                <View style={styles.segmentInfoRow}>
                  <Text style={[styles.segmentLabel, { color: textColor }]}>Checked Bags:</Text>
                  <Text style={[styles.segmentValue, { color: textColor }]}>
                    {segment.includedCheckedBags.quantity}
                  </Text>
                </View>
              )}
              {segment.amenities && segment.amenities.length > 0 && (
                <View style={styles.amenitiesContainer}>
                  <Text style={[styles.amenitiesTitle, { color: secondaryColor }]}>Amenities:</Text>
                  {segment.amenities.map((amenity: any, aIdx: number) => (
                    <View key={aIdx} style={styles.amenityRow}>
                      <MaterialIcons
                        name={amenity.isChargeable ? "attach-money" : "check-circle"}
                        size={16}
                        color={amenity.isChargeable ? highlightColor : '#4CAF50'}
                      />
                      <Text style={[styles.amenityText, { color: textColor }]}>
                        {amenity.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      );
    };

    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={false}
      >
        <View style={[styles.pricingModalContainer, { backgroundColor }]}>
          <View style={[styles.pricingHeader, { backgroundColor: surfaceColor }]}>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <MaterialIcons name="arrow-back" size={24} color={highlightColor} />
            </TouchableOpacity>
            <Text style={[styles.pricingHeaderTitle, { color: textColor }]}>
              Pricing Details
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.pricingScrollContainer}>
            <View style={[styles.totalPriceContainer, { backgroundColor: highlightColor + '20' }]}>
              <Text style={[styles.totalPriceLabel, { color: secondaryColor }]}>Total Price</Text>
              <Text style={[styles.totalPriceValue, { color: highlightColor }]}>
                {totalPrice} {currency}
              </Text>
            </View>

            <View style={[styles.summaryContainer, { backgroundColor: surfaceColor }]}>
              <Text style={[styles.sectionHeader, { color: highlightColor }]}>Price Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: textColor }]}>Total Price</Text>
                <Text style={[styles.summaryValue, { color: textColor }]}>{totalPrice} {currency}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: textColor }]}>Base Fare</Text>
                <Text style={[styles.summaryValue, { color: textColor }]}>{basePrice} {currency}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: textColor }]}>Taxes & Fees</Text>
                <Text style={[styles.summaryValue, { color: textColor }]}>{taxes} {currency}</Text>
              </View>
            </View>

            {offer.travelerPricings.map((traveler, index) => (
              <View key={index}>
                {renderTravelerSection(traveler)}
              </View>
            ))}

            <View style={styles.pricingButtonsContainer}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: highlightColor }]}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={[styles.secondaryButtonText, { color: highlightColor }]}>
                  Back to Flights
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: highlightColor }]}
                onPress={() => {
                  setShowDetailsModal(false);
                  onClose();
                  onBookFlight(selectedFlight); // Call the prop instead of navigation
                }}
              >
                <Text style={styles.primaryButtonText}>Book Now</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: surfaceColor }]}>
          <TouchableOpacity
            onPress={onClose}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.6 : 1 }
            ]}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={highlightColor}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Available Flights
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.dateRangeContainer]}>
          <FlatList
            horizontal
            data={dateRange}
            renderItem={renderDateItem}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
            initialScrollIndex={selectedDateIndex}
            getItemLayout={(_, index) => (
              { length: 96, offset: 96 * index, index }
            )}
          />
        </View>

        {loadingDates ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={highlightColor} />
            <Text style={[styles.loadingText, { color: secondaryColor }]}>
              Loading flights...
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {results.length > 0 ? (
              results.map((offer, index) => (
                <View
                  key={index}
                  style={[
                    styles.offerCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor: borderColor,
                      shadowColor: theme === 'light' ? '#000' : 'transparent',
                    }
                  ]}
                >
                  <View style={styles.priceHeader}>
                    <Text style={[styles.priceText, { color: highlightColor }]}>
                      {offer.price.total} {offer.price.currency}
                    </Text>
                    <Text style={[styles.priceSubText, { color: secondaryColor }]}>
                      {offer.travelerPricings.length} traveler{offer.travelerPricings.length > 1 ? 's' : ''}
                    </Text>
                  </View>

                  {offer.itineraries.map((itinerary, i) => (
                    <View key={i} style={styles.itineraryContainer}>
                      <Text style={[styles.itineraryTitle, { color: secondaryColor }]}>
                        {i === 0 ? 'Outbound' : 'Return'} • {formatDuration(
                          itinerary.segments[0].departure.at,
                          itinerary.segments[itinerary.segments.length - 1].arrival.at
                        )}
                      </Text>

                      {itinerary.segments.map((segment, j) => (
                        <View key={j} style={styles.segmentContainer}>
                          <View style={styles.timeContainer}>
                            <Text style={[styles.timeText, { color: textColor }]}>
                              {formatTime(segment.departure.at)}
                            </Text>
                            <View style={styles.durationLine}>
                              <View style={[styles.durationDot, { backgroundColor: highlightColor }]} />
                              <View style={[styles.durationLineInner, { backgroundColor: borderColor }]} />
                              <View style={[styles.durationDot, { backgroundColor: highlightColor }]} />
                            </View>
                            <Text style={[styles.timeText, { color: textColor }]}>
                              {formatTime(segment.arrival.at)}
                            </Text>
                          </View>

                          <View style={styles.flightDetails}>
                            <View style={styles.airportRow}>
                              <Text style={[styles.airportCode, { color: highlightColor }]}>
                                {segment.departure.iataCode}
                              </Text>
                              <Text style={[styles.airportName, { color: secondaryColor }]}>
                                {segment.departure.terminal ? `Terminal ${segment.departure.terminal}` : ''}
                              </Text>
                            </View>

                            <View style={styles.flightInfo}>
                              <Text style={[styles.flightNumber, { color: textColor }]}>
                                {segment.carrierCode} {segment.number}
                              </Text>
                              <Text style={[styles.flightDuration, { color: secondaryColor }]}>
                                {formatDuration(segment.departure.at, segment.arrival.at)}
                              </Text>
                            </View>

                            <View style={styles.airportRow}>
                              <Text style={[styles.airportCode, { color: highlightColor }]}>
                                {segment.arrival.iataCode}
                              </Text>
                              <Text style={[styles.airportName, { color: secondaryColor }]}>
                                {segment.arrival.terminal ? `Terminal ${segment.arrival.terminal}` : ''}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={({ pressed }) => [
                        styles.priceButton,
                        {
                          backgroundColor: pressed ? highlightColor + '30' : surfaceColor,
                          borderColor: highlightColor,
                        }
                      ]}
                      onPress={() => handleSelectFlight(offer)}
                      disabled={priceLoading[index]}
                    >
                      {priceLoading[index] ? (
                        <ActivityIndicator size="small" color={highlightColor} />
                      ) : (
                        <Text style={[styles.priceButtonText, { color: highlightColor }]}>
                          View Details
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={({ pressed }) => [
                        styles.selectButton,
                        {
                          backgroundColor: highlightColor,
                          opacity: pressed ? 0.8 : 1
                        }
                      ]}
                      onPress={() => handleSelectFlight(offer)}
                      disabled={confirmingFlight}
                    >
                      {confirmingFlight ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <>
                          <Text style={styles.selectButtonText}>Select Flight</Text>
                          <MaterialIcons
                            name="arrow-forward"
                            size={20}
                            color="#fff"
                            style={{ marginLeft: 8 }}
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <MaterialIcons
                  name="flight"
                  size={48}
                  color={secondaryColor}
                  style={{ opacity: 0.5 }}
                />
                <Text style={[styles.noResultsText, { color: textColor }]}>
                  No flights found
                </Text>
                <Text style={[styles.noResultsSubText, { color: secondaryColor }]}>
                  Try adjusting your search dates or filters
                </Text>
                <TouchableOpacity
                  style={({ pressed }) => [
                    styles.closeButtonAlt,
                    {
                      backgroundColor: pressed ? highlightColor + '30' : highlightColor + '20',
                    }
                  ]}
                  onPress={onClose}
                >
                  <Text style={[styles.closeButtonAltText, { color: highlightColor }]}>
                    Modify Search
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
        <PricingDetailsModal />
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
    paddingTop: 70,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  dateRangeContainer: {
    paddingVertical: 12,
  },
  dateList: {
    paddingHorizontal: 16,
  },
  dateItem: {
    width: 100,
    alignItems: 'center',
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  dateText: {
    fontSize: 13,
  },
  dateDayText: {
    fontSize: 15,
    marginVertical: 4,
  },
  priceText: {
    fontSize: 12,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  offerCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  priceHeader: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceSubText: {
    fontSize: 14,
  },
  itineraryContainer: {
    padding: 16,
  },
  itineraryTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  segmentContainer: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 60,
  },
  durationLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  durationLineInner: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  durationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 60,
  },
  airportRow: {
    alignItems: 'center',
  },
  airportCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  airportName: {
    fontSize: 12,
    marginTop: 2,
  },
  flightInfo: {
    alignItems: 'center',
  },
  flightNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  flightDuration: {
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  priceButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  closeButtonAlt: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonAltText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  // Pricing Modal Styles
  pricingModalContainer: {
    flex: 1,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 70,
    borderBottomWidth: 1,
  },
  pricingHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  pricingScrollContainer: {
    flex: 1,
    padding: 16,
  },
  totalPriceContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalPriceValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  travelerSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  travelerHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  segmentDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  segmentTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  segmentInfoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  segmentLabel: {
    fontSize: 14,
    width: 120,
  },
  segmentValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  amenitiesContainer: {
    marginTop: 8,
  },
  amenitiesTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 14,
    marginLeft: 8,
  },
  pricingButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  primaryButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FlightResultsModal;