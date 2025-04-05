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
  ScrollView,
  SafeAreaView
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import FlightResultsModal from './../modals/FlightBooking/FlightResultsModal'; 
import airportData from './../../python/airports.json'; 

// Types
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
};

type ModalState = {
  type: string;
  visible: boolean;
  flightIndex?: number;
};

// Constants
const TRIP_TYPES = ['roundtrip', 'oneway', 'multicity'] as const;
const CLASS_TYPES = ['Economy', 'Business', 'First Class'] as const;
const MAX_FLIGHTS = 5;
const MAX_TRAVELERS = 10;
const MIN_TRAVELERS = 1;
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:2000' : 'http://localhost:2000';

// Theme
const theme = {
  colors: {
    primary: '#6246ea',
    secondary: '#e0e0e0',
    danger: '#ff4444',
    text: '#2d3436',
    background: '#ffffff',
    border: '#cccccc',
    success: '#4CAF50',
    warning: '#FFC107',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  borderRadius: {
    small: 5,
    medium: 8,
    large: 10,
  },
  fontSize: {
    small: 14,
    medium: 16,
    large: 18,
    xlarge: 24,
  }
};

// Helper functions
const parseAirportData = (data: { airportData: string[] }): Airport[] => {
  return data.airportData.map(entry => {
    const [iata, city, country, airportName] = entry.split('-');
    return { iata, city, country, airportName };
  });
};

const airports = parseAirportData(airportData);

const searchAirports = (query: string): Airport[] => {
  if (!query) return [];
  const lowerCaseQuery = query.toLowerCase();
  return airports.filter(airport => 
    airport.city.toLowerCase().includes(lowerCaseQuery) || 
    airport.iata.toLowerCase().includes(lowerCaseQuery) ||
    airport.airportName.toLowerCase().includes(lowerCaseQuery)
  ).slice(0, 20);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Select date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const FlightSearch: React.FC = () => {
  // State
  const [searchParams, setSearchParams] = useState<SearchParams>({
    tripType: 'roundtrip',
    flights: [{ id: Date.now(), flyingFrom: '', flyingTo: '', departureDate: '' }],
    travelers: 1,
    classType: 'Economy',
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

  // Memoized values
  const isRoundTrip = useMemo(() => searchParams.tripType === 'roundtrip', [searchParams.tripType]);
  const isMultiCity = useMemo(() => searchParams.tripType === 'multicity', [searchParams.tripType]);
  const canAddFlight = isMultiCity && searchParams.flights.length < MAX_FLIGHTS;
  const canRemoveFlight = isMultiCity && searchParams.flights.length > 1;

  // Handlers
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
        currencyCode: "USD",
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
          maxFlightOffers: 20,
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
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
  }, []);

  const getAirportDisplayName = useCallback((iata: string) => {
    if (!iata) return 'Select';
    const airport = airports.find(a => a.iata === iata);
    return airport ? `${iata} (${airport.city})` : iata;
  }, []);

  // Effects
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

  // Render functions
  const renderTripTypeButtons = () => (
    <View style={styles.tripTypeContainer}>
      {TRIP_TYPES.map(type => (
        <TouchableOpacity 
          key={type} 
          onPress={() => handleInputChange('tripType', type)}
          style={[
            styles.tripTypeButton, 
            searchParams.tripType === type && styles.activeButton
          ]}
          accessibilityLabel={`Select ${type} trip`}
        >
          <Text style={[
            styles.buttonText,
            searchParams.tripType === type && styles.activeButtonText
          ]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
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
            accessibilityLabel="Remove flight"
          >
            <FontAwesome5 
              name="times" 
              size={16} 
              color={canRemoveFlight ? 'white' : theme.colors.secondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        onPress={() => openModal('flyingFrom', index)} 
        style={styles.detailItem}
        accessibilityLabel={`Select departure airport for flight ${index + 1}`}
      >
        <FontAwesome5 name="plane-departure" size={16} color={theme.colors.primary} />
        <Text style={styles.detailText}>
          From: {getAirportDisplayName(flight.flyingFrom)}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => openModal('flyingTo', index)} 
        style={styles.detailItem}
        accessibilityLabel={`Select arrival airport for flight ${index + 1}`}
      >
        <FontAwesome5 name="plane-arrival" size={16} color={theme.colors.primary} />
        <Text style={styles.detailText}>
          To: {getAirportDisplayName(flight.flyingTo)}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => openModal('departureDate', index)} 
        style={styles.detailItem}
        accessibilityLabel={`Select departure date for flight ${index + 1}`}
      >
        <FontAwesome5 name="calendar-alt" size={16} color={theme.colors.primary} />
        <Text style={styles.detailText}>
          Departure: {formatDate(flight.departureDate)}
        </Text>
      </TouchableOpacity>
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
            <TextInput
              style={styles.input}
              placeholder="Search by city, airport code or name"
              value={airportSearchQuery}
              onChangeText={handleAirportSearch}
              autoFocus
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
            {filteredAirports.length === 0 && airportSearchQuery ? (
              <Text style={styles.noResultsText}>No airports found</Text>
            ) : (
              <FlatList
                data={filteredAirports}
                keyExtractor={item => item.iata}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.airportItem}
                    onPress={() => handleInputChange(
                      modalState.type, 
                      item.iata, 
                      modalState.flightIndex
                    )}
                  >
                    <Text style={styles.airportCode}>{item.iata}</Text>
                    <View style={styles.airportInfo}>
                      <Text style={styles.airportCity}>{item.city}, {item.country}</Text>
                      <Text style={styles.airportName}>{item.airportName}</Text>
                    </View>
                  </TouchableOpacity>
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
          </View>
        );
      
      case 'travelers':
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>Number of Travelers</Text>
            <View style={styles.travelerInputContainer}>
              <TouchableOpacity
                onPress={() => handleInputChange('travelers', Math.max(MIN_TRAVELERS, searchParams.travelers - 1))}
                disabled={searchParams.travelers <= MIN_TRAVELERS}
                style={[
                  styles.travelerButton,
                  searchParams.travelers <= MIN_TRAVELERS && styles.disabledButton
                ]}
                accessibilityLabel="Decrease traveler count"
              >
                <Text style={styles.travelerButtonText}>-</Text>
              </TouchableOpacity>
              
              <Text style={styles.travelerCount}>{searchParams.travelers}</Text>
              
              <TouchableOpacity
                onPress={() => handleInputChange('travelers', searchParams.travelers + 1)}
                disabled={searchParams.travelers >= MAX_TRAVELERS}
                style={[
                  styles.travelerButton,
                  searchParams.travelers >= MAX_TRAVELERS && styles.disabledButton
                ]}
                accessibilityLabel="Increase traveler count"
              >
                <Text style={styles.travelerButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.travelerNote}>
              {searchParams.travelers >= MAX_TRAVELERS ? 
                `Maximum ${MAX_TRAVELERS} travelers allowed` : 
                ''}
            </Text>
          </View>
        );
      
      case 'class':
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>Preferred Class</Text>
            <View style={styles.classOptionsContainer}>
              {CLASS_TYPES.map(option => (
                <TouchableOpacity 
                  key={option}
                  style={[
                    styles.classOption,
                    searchParams.classType === option && styles.selectedClassOption
                  ]}
                  onPress={() => handleInputChange('classType', option)}
                  accessibilityLabel={`Select ${option} class`}
                >
                  <FontAwesome5 
                    name={option === 'First Class' ? 'crown' : option === 'Business' ? 'briefcase' : 'user'} 
                    size={16} 
                    color={searchParams.classType === option ? 'white' : theme.colors.primary} 
                  />
                  <Text style={[
                    styles.classOptionText,
                    searchParams.classType === option && styles.selectedClassOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          {/* Loading Modal */}
          <Modal visible={loading} transparent animationType="fade">
            <View style={styles.loadingContainer}>
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Searching for flights...</Text>
              </View>
            </View>
          </Modal>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {}} accessibilityLabel="Go back">
              <FontAwesome5 name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Flight Search</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Trip Type Selector */}
          {renderTripTypeButtons()}

          {/* Travel Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.travelersAndClass}>
              <TouchableOpacity 
                onPress={() => openModal('class')} 
                style={styles.detailItem}
                accessibilityLabel="Select travel class"
              >
                <FontAwesome5 name="chair" size={16} color={theme.colors.primary} />
                <Text style={styles.detailText}>
                  Class: {searchParams.classType}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => openModal('travelers')} 
                style={styles.detailItem}
                accessibilityLabel="Select number of travelers"
              >
                <FontAwesome5 name="users" size={16} color={theme.colors.primary} />
                <Text style={styles.detailText}>
                  Travelers: {searchParams.travelers}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Flight Segments */}
            {searchParams.flights.map((flight, index) => renderFlightSegment(flight, index))}

            {/* Add Flight (for multi-city) */}
            {isMultiCity && (
              <TouchableOpacity 
                onPress={addFlight} 
                style={[
                  styles.addFlightButton,
                  !canAddFlight && styles.disabledAddButton
                ]}
                disabled={!canAddFlight}
                accessibilityLabel="Add another flight"
              >
                <FontAwesome5 
                  name="plus-circle" 
                  size={20} 
                  color={canAddFlight ? theme.colors.primary : theme.colors.secondary} 
                />
                <Text style={[
                  styles.addFlightText,
                  !canAddFlight && styles.disabledText
                ]}>
                  Add Flight
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search Button */}
          <TouchableOpacity 
            onPress={handleSearch} 
            style={styles.searchButton}
            disabled={loading}
            accessibilityLabel="Search for flights"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <FontAwesome5 name="search" size={16} color="white" />
                <Text style={styles.searchButtonText}> Search Flights</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Results Modal */}
          <FlightResultsModal 
            visible={resultsVisible} 
            onClose={() => setResultsVisible(false)} 
            results={flightResults} 
            searchParams={searchParams}
          />
        </View>

        {/* Input Modals */}
        <Modal 
          visible={modalState.visible} 
          transparent 
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalScrollContainer}>
              {renderModalContent()}
              <TouchableOpacity 
                onPress={closeModal} 
                style={styles.closeModalButton}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 24,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.medium,
  },
  tripTypeButton: {
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.secondary,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: theme.spacing.small,
  },
  activeButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.text,
  },
  activeButtonText: {
    color: 'white',
  },
  detailsContainer: {
    marginBottom: theme.spacing.large,
  },
  travelersAndClass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.medium,
  },
  flightSegment: {
    marginBottom: theme.spacing.medium,
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.background,
  },
  flightSegmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  flightTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.small,
    marginVertical: theme.spacing.small,
    backgroundColor: theme.colors.background,
  },
  detailText: {
    marginLeft: theme.spacing.small,
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
  },
  addFlightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.small,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  disabledAddButton: {
    borderColor: theme.colors.secondary,
  },
  addFlightText: {
    marginLeft: theme.spacing.small,
    fontSize: theme.fontSize.medium,
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.secondary,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  searchButtonText: {
    color: 'white',
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
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
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
  },
  modalContentContainer: {
    paddingBottom: theme.spacing.medium,
  },
  modalTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    marginBottom: theme.spacing.medium,
    color: theme.colors.text,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.small,
    marginBottom: theme.spacing.medium,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: theme.fontSize.medium,
  },
  removeFlightButton: {
    backgroundColor: theme.colors.danger,
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
    backgroundColor: theme.colors.background,
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
  },
  noResultsText: {
    textAlign: 'center',
    color: theme.colors.text,
    marginVertical: theme.spacing.medium,
  },
  airportItem: {
    flexDirection: 'row',
    padding: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
  },
  airportCode: {
    fontWeight: 'bold',
    marginRight: theme.spacing.small,
    color: theme.colors.primary,
    width: 40,
  },
  airportInfo: {
    flex: 1,
  },
  airportCity: {
    fontWeight: '500',
    color: theme.colors.text,
  },
  airportName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.small,
  },
  travelerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.small,
  },
  travelerButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.secondary,
  },
  travelerButtonText: {
    color: 'white',
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
  },
  travelerCount: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.medium,
    minWidth: 30,
    textAlign: 'center',
  },
  travelerNote: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: theme.fontSize.small,
    marginBottom: theme.spacing.small,
  },
  classOptionsContainer: {
    marginBottom: theme.spacing.medium,
  },
  classOption: {
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedClassOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  classOptionText: {
    color: theme.colors.text,
    marginLeft: theme.spacing.small,
    fontSize: theme.fontSize.medium,
  },
  selectedClassOptionText: {
    color: 'white',
  },
  closeModalButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
    marginTop: theme.spacing.small,
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: theme.fontSize.medium,
    fontWeight: 'bold',
  },
});

export default FlightSearch;