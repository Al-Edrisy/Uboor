import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Pressable,
  ScrollView
} from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import airportData from './../../python/airports.json';
import { useTheme } from './../context/ThemeContext';
import { useThemeColor } from '@/components/Themed';
import { useNavigation } from '@react-navigation/native';
import { useFlightBooking } from '../context/FlightBookingContext';
import currencyData from './../../python/currencies.json';
import FlightResultsModal from './../modals/FlightBooking/FlightResultsModal';

type Airport = {
  iata: string;
  city: string;
  country: string;
  airportName: string;
};

type Flight = {
  id: number;
  flyingFrom: string;
  flyingTo: string;
  departureDate: string;
};

type SearchParams = {
  tripType: 'roundtrip' | 'oneway' | 'multicity';
  flights: Flight[];
  travelers: number;
  classType: 'Economy' | 'Business' | 'First Class';
  currency: string;
};

type ModalState = {
  type: string;
  visible: boolean;
  flightIndex?: number;
};

const TRIP_TYPES = ['roundtrip', 'oneway', 'multicity'] as const;
const CLASS_TYPES = ['Economy', 'Business', 'First Class'] as const;
const MAX_FLIGHTS = 5;
const MAX_TRAVELERS = 10;
const MIN_TRAVELERS = 1;
const API_BASE_URL = 'http://localhost:2000';

const FlightSearch: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const highlightColor = useThemeColor({}, 'highlight');
  const borderColor = useThemeColor({}, 'border');
  const secondaryColor = useThemeColor({}, 'secondary');
  const dangerColor = useThemeColor({}, 'warning');
  const placeholderColor = useThemeColor({}, 'secondary');

  const [searchParams, setSearchParams] = useState<SearchParams>({
    tripType: 'roundtrip',
    flights: [{ id: Date.now(), flyingFrom: '', flyingTo: '', departureDate: '' }],
    travelers: 1,
    classType: 'Economy',
    currency: 'USD'
  });

  const [modalState, setModalState] = useState<ModalState>({
    type: '',
    visible: false
  });
  const [loading, setLoading] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [flightResults, setFlightResults] = useState<any[]>([]);
  const [airportSearchQuery, setAirportSearchQuery] = useState('');
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['USD']);


  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);


  // Add this handler function
const handleBookFlight = (offer: FlightOffer) => {
  setSelectedFlight(offer);
  setShowResultsModal(false);
  setShowBookingModal(true);
};
  // Load currencies from JSON file
  useEffect(() => {
    try {
      if (currencyData?.currencies) {
        setAvailableCurrencies(currencyData.currencies);
        if (!searchParams.currency) {
          setSearchParams(prev => ({
            ...prev,
            currency: currencyData.currencies[0] || 'USD'
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load currencies:', error);
    }
  }, []);

  const parseAirportData = (data: { airportData: string[] }): Airport[] => {
    return data.airportData.map(entry => {
      const [iata, city, country, airportName] = entry.split('-');
      return { iata, city, country, airportName };
    });
  };

  const airports = parseAirportData(airportData);

  const isRoundTrip = useMemo(() => searchParams.tripType === 'roundtrip', [searchParams.tripType]);
  const isMultiCity = useMemo(() => searchParams.tripType === 'multicity', [searchParams.tripType]);
  const canAddFlight = isMultiCity && searchParams.flights.length < MAX_FLIGHTS;
  const canRemoveFlight = isMultiCity && searchParams.flights.length > 1;

  const openModal = useCallback((type: string, flightIndex?: number) => {
    setModalState({ type, visible: true, flightIndex });
    if (type.includes('date') && flightIndex !== undefined) {
      const currentDate = searchParams.flights[flightIndex].departureDate;
      setSelectedDate(currentDate ? new Date(currentDate) : new Date());
    }
  }, [searchParams.flights]);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, visible: false }));
    setAirportSearchQuery('');
    setFilteredAirports([]);
  }, []);

  const handleInputChange = useCallback((key: keyof SearchParams | keyof Flight, value: any, flightIndex?: number) => {
    if (flightIndex !== undefined) {
      setSearchParams(prev => ({
        ...prev,
        flights: prev.flights.map((flight, idx) =>
          idx === flightIndex ? { ...flight, [key]: value } : flight
        )
      }));
    } else {
      setSearchParams(prev => ({ ...prev, [key]: value }));
    }
    closeModal();
  }, [closeModal]);

  const searchAirports = useCallback((query: string): Airport[] => {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();
    return airports.filter(airport =>
      airport.city.toLowerCase().includes(lowerCaseQuery) ||
      airport.iata.toLowerCase().includes(lowerCaseQuery) ||
      airport.airportName.toLowerCase().includes(lowerCaseQuery)
    ).slice(0, 20);
  }, []);

  const getAirportDisplayName = useCallback((iata: string) => {
    if (!iata) return 'Select';
    const airport = airports.find(a => a.iata === iata);
    return airport ? `${iata} (${airport.city})` : iata;
  }, []);

  const validateDate = useCallback((date: string) => {
    const selectedDate = new Date(date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return selectedDate >= currentDate;
  }, []);

  const validateInputs = useCallback(() => {
    if (isMultiCity && searchParams.flights.length < 2) {
      Alert.alert('Validation Error', 'Please add at least 2 flights for multi-city trips');
      return false;
    }

    for (const flight of searchParams.flights) {
      if (!flight.flyingFrom || !flight.flyingTo || !flight.departureDate) {
        Alert.alert('Validation Error', 'Please fill in all flight details.');
        return false;
      }

      if (flight.flyingFrom === flight.flyingTo) {
        Alert.alert('Validation Error', 'Departure and arrival airports cannot be the same.');
        return false;
      }

      if (!validateDate(flight.departureDate)) {
        Alert.alert('Invalid Date', 'Please select a valid departure date.');
        return false;
      }
    }

    if (isRoundTrip && !searchParams.flights[1]?.departureDate) {
      Alert.alert('Validation Error', 'Please select a return date.');
      return false;
    }

    return true;
  }, [searchParams, isMultiCity, isRoundTrip, validateDate]);

  const handleSearch = useCallback(async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const requestData = {
        currencyCode: searchParams.currency,
        originDestinations: searchParams.flights.map((flight, index) => ({
          id: (index + 1).toString(),
          originLocationCode: flight.flyingFrom,
          destinationLocationCode: flight.flyingTo,
          departureDateTimeRange: {
            date: flight.departureDate,
            time: "10:00:00"
          }
        })),
        travelers: Array.from({ length: searchParams.travelers }, (_, i) => ({
          id: (i + 1).toString(),
          travelerType: "ADULT",
          fareOptions: ["STANDARD"]
        })),
        sources: ["GDS"],
        searchCriteria: {
          maxFlightOffers: 30,
          flightFilters: {
            cabinRestrictions: [{
              cabin: searchParams.classType.toUpperCase().replace(' ', '_'),
              coverage: "MOST_SEGMENTS",
              originDestinationIds: searchParams.flights.map((_, index) => (index + 1).toString())
            }]
          }
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/api/flights/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFlightResults(data.data || []);
      setResultsVisible(true);
    } catch (error) {
      console.error('Search error:', error);
      let errorMessage = 'Failed to search flights. Please try again later.';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your connection.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Search Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchParams, validateInputs]);

  const addFlight = useCallback(() => {
    if (!canAddFlight) {
      Alert.alert('Limit Reached', `You can only add up to ${MAX_FLIGHTS} flights for multi-city trips.`);
      return;
    }

    setSearchParams(prev => ({
      ...prev,
      flights: [...prev.flights, {
        id: Date.now(),
        flyingFrom: '',
        flyingTo: '',
        departureDate: ''
      }]
    }));
  }, [canAddFlight]);

  const removeFlight = useCallback((id: number) => {
    if (!canRemoveFlight) return;
    setSearchParams(prev => ({
      ...prev,
      flights: prev.flights.filter(flight => flight.id !== id)
    }));
  }, [canRemoveFlight]);

  const handleAirportSearch = useCallback((query: string) => {
    setAirportSearchQuery(query);
    setFilteredAirports(searchAirports(query));
  }, [searchAirports]);

  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (isRoundTrip && searchParams.flights.length < 2) {
      setSearchParams(prev => ({
        ...prev,
        flights: [...prev.flights, { id: Date.now(), flyingFrom: '', flyingTo: '', departureDate: '' }]
      }));
    } else if (!isRoundTrip && !isMultiCity && searchParams.flights.length > 1) {
      setSearchParams(prev => ({
        ...prev,
        flights: [prev.flights[0]]
      }));
    }
  }, [isRoundTrip, isMultiCity]);

  const renderTripTypeButtons = () => (
    <View style={styles.tripTypeContainer}>
      {TRIP_TYPES.map(type => (
        <Pressable
          key={type}
          onPress={() => handleInputChange('tripType', type)}
          style={({ pressed }) => [
            styles.tripTypeButton,
            searchParams.tripType === type && styles.activeButton,
            pressed && styles.pressedButton
          ]}
        >
          <Text style={[
            styles.buttonText,
            searchParams.tripType === type && styles.activeButtonText
          ]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderOptionsRow = () => (
    <View style={styles.optionsRow}>
      {/* Class Type */}
      <Pressable
        onPress={() => openModal('class')}
        style={({ pressed }) => [
          styles.optionButton,
          pressed && styles.pressedItem,
          { flex: 3 }
        ]}
      >
        <View style={styles.optionContent}>
          <FontAwesome5 name="chair" size={16} color={highlightColor} />
          <Text style={styles.optionText} numberOfLines={1}>
            {searchParams.classType}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color={secondaryColor} />
        </View>
      </Pressable>

      {/* Travelers */}
      <Pressable
        onPress={() => openModal('travelers')}
        style={({ pressed }) => [
          styles.optionButton,
          pressed && styles.pressedItem,
          { flex: 2 }
        ]}
      >
        <View style={styles.optionContent}>
          <FontAwesome5 name="users" size={16} color={highlightColor} />
          <Text style={styles.optionText}>
            {searchParams.travelers}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color={secondaryColor} />
        </View>
      </Pressable>

      {/* Currency */}
      <Pressable
        onPress={() => openModal('currency')}
        style={({ pressed }) => [
          styles.optionButton,
          pressed && styles.pressedItem,
          { flex: 1 }
        ]}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionText}>
            {searchParams.currency}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color={secondaryColor} />
        </View>
      </Pressable>
    </View>
  );

  const renderFlightSegment = (flight: Flight, index: number) => (
    <View key={flight.id} style={styles.flightSegment}>
      <View style={styles.flightSegmentHeader}>
        <Text style={styles.flightTitle}>
          {isMultiCity ? `Flight ${index + 1}` : index === 0 ? 'Outbound' : 'Return'}
        </Text>
        {(isMultiCity && canRemoveFlight) && (
          <TouchableOpacity
            style={styles.removeFlightButton}
            onPress={() => removeFlight(flight.id)}
            disabled={!canRemoveFlight}
          >
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <Pressable
        onPress={() => openModal('flyingFrom', index)}
        style={({ pressed }) => [
          styles.detailItem,
          pressed && styles.pressedItem
        ]}
      >
        <FontAwesome5 name="plane-departure" size={16} color={highlightColor} />
        <Text style={styles.detailText}>
          From: {getAirportDisplayName(flight.flyingFrom)}
        </Text>
        <MaterialIcons name="keyboard-arrow-right" size={20} color={secondaryColor} />
      </Pressable>

      <Pressable
        onPress={() => openModal('flyingTo', index)}
        style={({ pressed }) => [
          styles.detailItem,
          pressed && styles.pressedItem
        ]}
      >
        <FontAwesome5 name="plane-arrival" size={16} color={highlightColor} />
        <Text style={styles.detailText}>
          To: {getAirportDisplayName(flight.flyingTo)}
        </Text>
        <MaterialIcons name="keyboard-arrow-right" size={20} color={secondaryColor} />
      </Pressable>

      <Pressable
        onPress={() => openModal('departureDate', index)}
        style={({ pressed }) => [
          styles.detailItem,
          pressed && styles.pressedItem
        ]}
      >
        <FontAwesome5 name="calendar-alt" size={16} color={highlightColor} />
        <Text style={styles.detailText}>
          Departure: {formatDateDisplay(flight.departureDate)}
        </Text>
        <MaterialIcons name="keyboard-arrow-right" size={20} color={secondaryColor} />
      </Pressable>
    </View>
  );

  const renderModalContent = () => {
    switch (modalState.type) {
      case 'flyingFrom':
      case 'flyingTo':
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>
              {modalState.type === 'flyingFrom' ? 'Departure Airport' : 'Arrival Airport'}
            </Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={secondaryColor} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search by city, airport code or name"
                placeholderTextColor={placeholderColor}
                value={airportSearchQuery}
                onChangeText={handleAirportSearch}
                autoFocus
              />
            </View>
            {filteredAirports.length === 0 && airportSearchQuery ? (
              <View style={styles.noResultsContainer}>
                <Ionicons name="alert-circle-outline" size={40} color={secondaryColor} />
                <Text style={styles.noResultsText}>No airports found</Text>
              </View>
            ) : (
              <FlatList
                data={filteredAirports}
                keyExtractor={item => item.iata}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.airportItem,
                      pressed && styles.pressedItem
                    ]}
                    onPress={() => handleInputChange(
                      modalState.type,
                      item.iata,
                      modalState.flightIndex
                    )}
                  >
                    <View style={styles.airportIcon}>
                      <FontAwesome5 name="plane" size={16} color={highlightColor} />
                    </View>
                    <View style={styles.airportTextContainer}>
                      <Text style={styles.airportCity}>{item.city}, {item.country}</Text>
                      <Text style={styles.airportName}>{item.airportName}</Text>
                    </View>
                    <Text style={styles.airportCode}>{item.iata}</Text>
                  </Pressable>
                )}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        );

      case 'departureDate':
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>
              Select {modalState.flightIndex === 1 && isRoundTrip ? 'return' : 'departure'} date
            </Text>
            <DateTimePicker
              style={styles.input}
              testID="dateTimePicker"
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(_, date) => {
                if (date) {
                  setSelectedDate(date);
                  handleInputChange(
                    'departureDate',
                    date.toISOString().split('T')[0],
                    modalState.flightIndex
                  );
                }
              }}
            />
            {Platform.OS === 'android' && (
              <Pressable
                style={styles.confirmButton}
                onPress={closeModal}
              >
                <Text style={styles.confirmButtonText}>Confirm Date</Text>
              </Pressable>
            )}
          </View>
        );

      case 'travelers':
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>Number of Travelers</Text>
            <View style={styles.travelerInputContainer}>
              <Pressable
                onPress={() => handleInputChange('travelers', Math.max(MIN_TRAVELERS, searchParams.travelers - 1))}
                disabled={searchParams.travelers <= MIN_TRAVELERS}
                style={({ pressed }) => [
                  styles.travelerButton,
                  searchParams.travelers <= MIN_TRAVELERS && styles.disabledButton,
                  pressed && styles.pressedButton
                ]}
              >
                <Text style={styles.travelerButtonText}>-</Text>
              </Pressable>

              <Text style={styles.travelerCount}>{searchParams.travelers}</Text>

              <Pressable
                onPress={() => handleInputChange('travelers', searchParams.travelers + 1)}
                disabled={searchParams.travelers >= MAX_TRAVELERS}
                style={({ pressed }) => [
                  styles.travelerButton,
                  searchParams.travelers >= MAX_TRAVELERS && styles.disabledButton,
                  pressed && styles.pressedButton
                ]}
              >
                <Text style={styles.travelerButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        );

      case 'class':
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>Preferred Class</Text>
            <View style={styles.classOptionsContainer}>
              {CLASS_TYPES.map(option => (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.classOption,
                    searchParams.classType === option && styles.selectedClassOption,
                    pressed && styles.pressedButton
                  ]}
                  onPress={() => handleInputChange('classType', option)}
                >
                  <View style={styles.classIconContainer}>
                    <FontAwesome5
                      name={option === 'First Class' ? 'crown' : option === 'Business' ? 'briefcase' : 'user'}
                      size={16}
                      color={searchParams.classType === option ? 'white' : highlightColor}
                    />
                  </View>
                  <Text style={[
                    styles.classOptionText,
                    searchParams.classType === option && styles.selectedClassOptionText
                  ]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 'currency':
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <FlatList
              data={availableCurrencies}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.currencyItem,
                    searchParams.currency === item && styles.selectedCurrencyItem,
                    pressed && styles.pressedItem
                  ]}
                  onPress={() => handleInputChange('currency', item)}
                >
                  <Text style={[
                    styles.currencyText,
                    searchParams.currency === item && styles.selectedCurrencyText
                  ]}>
                    {item}
                  </Text>
                  {searchParams.currency === item && (
                    <Ionicons name="checkmark" size={20} color={highlightColor} />
                  )}
                </Pressable>
              )}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor,
    },
    container: {
      flex: 1,
      backgroundColor,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: textColor,
    },
    placeholder: {
      width: 24,
    },
    tripTypeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 12,
      backgroundColor: surfaceColor,
      borderRadius: 10,
      padding: 4,
    },
    tripTypeButton: {
      padding: 12,
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
    },
    activeButton: {
      backgroundColor: highlightColor,
    },
    pressedButton: {
      opacity: 0.8,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '500',
      color: textColor,
    },
    activeButtonText: {
      color: 'white',
    },
    detailsContainer: {
      marginBottom: 24,
    },
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 8,
    },
    optionButton: {
      padding: 5,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      backgroundColor: surfaceColor,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 8,
      borderBlockColor: borderColor,
    },
    optionText: {
      marginHorizontal: 5,
      fontSize: 14,
      color: textColor,
      fontWeight: '500',
    },
    flightSegment: {
      marginBottom: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 12,
      backgroundColor: surfaceColor,
    },
    flightSegmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    flightTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      marginVertical: 8,
      backgroundColor: surfaceColor,
      justifyContent: 'space-between',
    },
    pressedItem: {
      backgroundColor: `${highlightColor}20`,
    },
    detailText: {
      marginLeft: 8,
      fontSize: 16,
      color: textColor,
      flex: 1,
    },
    addFlightButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      padding: 12,
      borderRadius: 8,
      backgroundColor: surfaceColor,
      borderWidth: 1,
      borderColor: highlightColor,
    },
    disabledAddButton: {
      borderColor: secondaryColor,
    },
    addFlightText: {
      marginLeft: 8,
      fontSize: 16,
      color: highlightColor,
    },
    disabledText: {
      color: secondaryColor,
    },
    searchButton: {
      backgroundColor: highlightColor,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    searchButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalScrollContainer: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: surfaceColor,
      borderRadius: 16,
      padding: 16,
    },
    modalContentContainer: {
      paddingBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: textColor,
      textAlign: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
      backgroundColor: surfaceColor,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      backgroundColor: surfaceColor,
      fontSize: 16,
    },
    removeFlightButton: {
      backgroundColor: dangerColor,
      padding: 6,
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loadingContent: {
      backgroundColor: surfaceColor,
      padding: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: textColor,
    },
    noResultsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    noResultsText: {
      textAlign: 'center',
      color: textColor,
      marginTop: 8,
      fontSize: 16,
    },
    airportItem: {
      flexDirection: 'row',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      alignItems: 'center',
    },
    airportIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: `${highlightColor}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    airportTextContainer: {
      flex: 1,
    },
    airportCity: {
      fontWeight: '600',
      color: textColor,
      fontSize: 16,
    },
    airportName: {
      color: secondaryColor,
      fontSize: 14,
      marginTop: 2,
    },
    airportCode: {
      fontWeight: 'bold',
      color: highlightColor,
      fontSize: 16,
      marginLeft: 8,
    },
    travelerInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    travelerButton: {
      backgroundColor: highlightColor,
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: secondaryColor,
    },
    travelerButtonText: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
    travelerCount: {
      fontSize: 20,
      fontWeight: 'bold',
      color: textColor,
      marginHorizontal: 24,
      minWidth: 30,
      textAlign: 'center',
    },
    classOptionsContainer: {
      marginBottom: 16,
    },
    classOption: {
      padding: 16,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    classIconContainer: {
      width: 24,
      alignItems: 'center',
      marginRight: 12,
    },
    selectedClassOption: {
      backgroundColor: highlightColor,
      borderColor: highlightColor,
    },
    classOptionText: {
      color: textColor,
      fontSize: 16,
      fontWeight: '500',
    },
    selectedClassOptionText: {
      color: 'white',
    },
    closeModalButton: {
      backgroundColor: surfaceColor,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
      borderWidth: 1,
      borderColor: borderColor,
    },
    closeModalButtonText: {
      color: highlightColor,
      fontSize: 16,
      fontWeight: 'bold',
    },
    confirmButton: {
      backgroundColor: highlightColor,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 16,
    },
    confirmButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    currencyItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedCurrencyItem: {
      backgroundColor: `${highlightColor}20`,
    },
    currencyText: {
      color: textColor,
      fontSize: 16,
    },
    selectedCurrencyText: {
      fontWeight: 'bold',
      color: highlightColor,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            <Modal visible={loading} transparent animationType="fade">
              <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="large" color={highlightColor} />
                  <Text style={styles.loadingText}>Searching for flights...</Text>
                </View>
              </View>
            </Modal>

            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={24} color={textColor} />
              </TouchableOpacity>
              <Text style={styles.title}>Flight Search</Text>
              <View style={styles.placeholder} />
            </View>

            {renderTripTypeButtons()}

            <View style={styles.detailsContainer}>
              {renderOptionsRow()}

              {searchParams.flights.map((flight, index) => renderFlightSegment(flight, index))}

              {isMultiCity && (
                <Pressable
                  onPress={addFlight}
                  style={({ pressed }) => [
                    styles.addFlightButton,
                    !canAddFlight && styles.disabledAddButton,
                    pressed && styles.pressedButton
                  ]}
                  disabled={!canAddFlight}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={canAddFlight ? highlightColor : secondaryColor}
                  />
                  <Text style={[
                    styles.addFlightText,
                    !canAddFlight && styles.disabledText
                  ]}>
                    Add Flight
                  </Text>
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={handleSearch}
              style={({ pressed }) => [
                styles.searchButton,
                pressed && styles.pressedButton
              ]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <FontAwesome5 name="search" size={16} color="white" />
                  <Text style={styles.searchButtonText}> Search Flights</Text>
                </>
              )}
            </Pressable>

            {/* Ensure FlightResultsModal is defined or imported */}
            {/* Example: Uncomment and replace with the correct import or definition */}
            <FlightResultsModal
              visible={resultsVisible}
              onClose={() => setResultsVisible(false)}
              results={flightResults}
              searchParams={searchParams}
              onSelectFlight={(flight) => console.log('Selected flight:', flight)}
              navigation={navigation}
            />
          </View>
        </ScrollView>

        <Modal
          visible={modalState.visible}
          transparent
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalScrollContainer}>
              {renderModalContent()}
              <Pressable
                onPress={closeModal}
                style={({ pressed }) => [
                  styles.closeModalButton,
                  pressed && styles.pressedButton
                ]}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FlightSearch;