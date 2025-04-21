import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Picker
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Traveler = {
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
      deviceType: string;
      countryCallingCode: string;
      number: string;
    }[];
  };
  documents?: {
    documentType: string;
    number: string;
    expiryDate?: string;
    issuanceCountry?: string;
  }[];
};

type FlightOffer = {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  travelerPricings: {
    travelerId: string;
    travelerType: string;
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
    }[];
  }[];
};

type FlightOrder = {
  id: string;
  associatedRecords?: {
    reference: string;
    creationDate: string;
  }[];
  travelers: Traveler[];
};

type FlightBookingModalProps = {
  visible: boolean;
  onClose: () => void;
  flightOffer: FlightOffer;
  onBookingComplete: (order: FlightOrder) => void;
};

const FlightBookingModal: React.FC<FlightBookingModalProps> = ({
  visible,
  onClose,
  flightOffer,
  onBookingComplete
}) => {
  const [currentStep, setCurrentStep] = useState<'travelerInfo' | 'confirmation'>('travelerInfo');
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<FlightOrder | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (flightOffer) {
      const initialTravelers = flightOffer.travelerPricings.map(t => ({
        id: t.travelerId,
        dateOfBirth: '',
        name: { firstName: '', lastName: '' },
        gender: 'MALE',
        contact: { 
          emailAddress: '', 
          phones: [{ deviceType: 'MOBILE', countryCallingCode: '1', number: '' }] 
        }
      }));
      setTravelers(initialTravelers);
    }
  }, [flightOffer]);

  const validateTravelerInfo = () => {
    const newErrors: {[key: string]: string} = {};
    
    travelers.forEach((traveler, index) => {
      if (!traveler.name.firstName) {
        newErrors[`traveler-${index}-firstName`] = 'First name is required';
      }
      if (!traveler.name.lastName) {
        newErrors[`traveler-${index}-lastName`] = 'Last name is required';
      }
      if (!traveler.dateOfBirth) {
        newErrors[`traveler-${index}-dob`] = 'Date of birth is required';
      }
    });

    if (!contactEmail) {
      newErrors['contactEmail'] = 'Contact email is required';
    }
    if (!phoneNumber) {
      newErrors['phoneNumber'] = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTravelerChange = (index: number, field: string, value: string) => {
    const updatedTravelers = [...travelers];
    const fieldPath = field.split('.');
    
    if (fieldPath[0] === 'name') {
      updatedTravelers[index].name = { 
        ...updatedTravelers[index].name, 
        [fieldPath[1]]: value 
      };
    } else if (fieldPath[0] === 'contact') {
      updatedTravelers[index].contact = { 
        ...updatedTravelers[index].contact, 
        [fieldPath[1]]: value 
      };
    } else {
      (updatedTravelers[index] as any)[field] = value;
    }
    
    setTravelers(updatedTravelers);
  };

  const handleSubmitTravelerInfo = () => {
    if (validateTravelerInfo()) {
      setCurrentStep('confirmation');
    }
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockOrder: FlightOrder = {
        id: `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        associatedRecords: [{
          reference: `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          creationDate: new Date().toISOString()
        }],
        travelers: travelers.map(t => ({
          ...t,
          contact: {
            emailAddress: contactEmail,
            phones: [{
              deviceType: 'MOBILE',
              countryCallingCode: '1',
              number: phoneNumber
            }]
          }
        }))
      };
      
      setBookingResult(mockOrder);
      onBookingComplete(mockOrder);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTravelerInfoStep = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Traveler Information</Text>
      
      {travelers.map((traveler, index) => (
        <View key={index} style={styles.travelerForm}>
          <Text style={styles.travelerType}>
            {flightOffer.travelerPricings[index].travelerType === 'ADULT' ? 'Adult' : 
             flightOffer.travelerPricings[index].travelerType === 'CHILD' ? 'Child' : 'Infant'}
          </Text>

          <TextInput
            style={[styles.input, errors[`traveler-${index}-firstName`] && styles.inputError]}
            placeholder="First Name"
            value={traveler.name.firstName}
            onChangeText={(text) => handleTravelerChange(index, 'name.firstName', text)}
          />
          {errors[`traveler-${index}-firstName`] && (
            <Text style={styles.errorText}>{errors[`traveler-${index}-firstName`]}</Text>
          )}

          <TextInput
            style={[styles.input, errors[`traveler-${index}-lastName`] && styles.inputError]}
            placeholder="Last Name"
            value={traveler.name.lastName}
            onChangeText={(text) => handleTravelerChange(index, 'name.lastName', text)}
          />
          {errors[`traveler-${index}-lastName`] && (
            <Text style={styles.errorText}>{errors[`traveler-${index}-lastName`]}</Text>
          )}

          <TextInput
            style={[styles.input, errors[`traveler-${index}-dob`] && styles.inputError]}
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={traveler.dateOfBirth}
            onChangeText={(text) => handleTravelerChange(index, 'dateOfBirth', text)}
          />
          {errors[`traveler-${index}-dob`] && (
            <Text style={styles.errorText}>{errors[`traveler-${index}-dob`]}</Text>
          )}

          <Picker
            selectedValue={traveler.gender}
            onValueChange={(value) => handleTravelerChange(index, 'gender', value)}
            style={styles.picker}
          >
            <Picker.Item label="Male" value="MALE" />
            <Picker.Item label="Female" value="FEMALE" />
          </Picker>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Contact Information</Text>
      <View style={styles.contactForm}>
        <TextInput
          style={[styles.input, errors.contactEmail && styles.inputError]}
          placeholder="Email Address"
          value={contactEmail}
          onChangeText={setContactEmail}
          keyboardType="email-address"
        />
        {errors.contactEmail && <Text style={styles.errorText}>{errors.contactEmail}</Text>}

        <TextInput
          style={[styles.input, errors.phoneNumber && styles.inputError]}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSubmitTravelerInfo}
      >
        <Text style={styles.primaryButtonText}>Continue to Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderConfirmationStep = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Flight Details</Text>
      <View style={styles.flightDetails}>
        {flightOffer.itineraries.map((itinerary, i) => (
          <View key={i} style={styles.itinerary}>
            <Text style={styles.itineraryTitle}>
              {i === 0 ? 'Outbound Flight' : 'Return Flight'}
            </Text>
            {itinerary.segments.map((segment, j) => (
              <View key={j} style={styles.segment}>
                <Text style={styles.segmentText}>
                  {segment.departure.iataCode} → {segment.arrival.iataCode}
                </Text>
                <Text style={styles.segmentText}>
                  Departure: {new Date(segment.departure.at).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Traveler Information</Text>
      {travelers.map((traveler, index) => (
        <View key={index} style={styles.travelerSummary}>
          <Text style={styles.travelerName}>
            {traveler.name.firstName} {traveler.name.lastName}
          </Text>
          <Text>Date of Birth: {traveler.dateOfBirth}</Text>
          <Text>Gender: {traveler.gender}</Text>
        </View>
      ))}

      <View style={styles.priceSummary}>
        <Text style={styles.priceLabel}>Total Price:</Text>
        <Text style={styles.priceValue}>
          {flightOffer.price.total} {flightOffer.price.currency}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleConfirmBooking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Confirm Booking</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderBookingComplete = () => (
    <View style={styles.completeContainer}>
      <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
      <Text style={styles.completeTitle}>Booking Confirmed!</Text>
      <Text style={styles.bookingId}>Booking ID: {bookingResult?.id}</Text>
      {bookingResult?.associatedRecords?.map((record, i) => (
        <Text key={i} style={styles.bookingRef}>
          Reference: {record.reference}
        </Text>
      ))}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onClose}
      >
        <Text style={styles.primaryButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          {currentStep === 'confirmation' && !bookingResult ? (
            <TouchableOpacity onPress={() => setCurrentStep('travelerInfo')}>
              <MaterialIcons name="arrow-back" size={24} color="#0066cc" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
          <Text style={styles.headerTitle}>
            {bookingResult ? 'Booking Confirmation' : 
             currentStep === 'travelerInfo' ? 'Traveler Information' : 'Confirm Booking'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#0066cc" />
          </TouchableOpacity>
        </View>

        {bookingResult ? renderBookingComplete() : 
         currentStep === 'travelerInfo' ? renderTravelerInfoStep() : renderConfirmationStep()}
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
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  travelerForm: {
    marginBottom: 24,
  },
  travelerType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  contactForm: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  flightDetails: {
    marginBottom: 24,
  },
  itinerary: {
    marginBottom: 16,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  segment: {
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#0066cc',
  },
  segmentText: {
    fontSize: 14,
    color: '#666',
  },
  travelerSummary: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  travelerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066cc',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 16,
    color: '#333',
  },
  bookingId: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444',
  },
  bookingRef: {
    fontSize: 16,
    marginBottom: 4,
    color: '#666',
  },
});

export default FlightBookingModal;