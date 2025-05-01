import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Modal,
  Dimensions,
  Linking
} from 'react-native';
import { BASE_URL } from '@env';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/app/context/ThemeContext';
import { useThemeColor } from '@/components/Themed';
import { Document, Traveler, FlightOffer, FlightOrder, FlightBookingModalProps } from "./types/bookingTypes";
import TravelerModal from './components/TravelerModal';
import BottomSheet from './components/BottomSheet';
import DocumentModal from './components/DocumentModal';
import PaymentModal from './components/PaymentModal';
import TravelerCard from './components/TravelerCard';
import { auth, db } from './../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { IPDFData } from './types/pdfTypes';

const { width, height } = Dimensions.get('window');

const DEFAULT_CONTACT = {
  emailAddress: 'uboorapp@gmail.com',
  phone: {
    countryCallingCode: '90',
    number: '5488270084',
    deviceType: 'MOBILE' as const
  }
};

const FlightBookingModal: React.FC<FlightBookingModalProps> = memo(({
  visible,
  onClose,
  flightOffer,
  onBookingComplete,
}) => {
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const highlightColor = useThemeColor({}, 'highlight');
  const borderColor = useThemeColor({}, 'border');
  const secondaryColor = useThemeColor({}, 'secondary');
  const dangerColor = useThemeColor({}, 'error');
  const placeholderColor = useThemeColor({}, 'placeholder');

  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<FlightOrder | null>(null);
  const [currentTravelerIndex, setCurrentTravelerIndex] = useState(0);
  const [activeModal, setActiveModal] = useState<'traveler' | 'document' | 'payment' | null>(null);
  const [currentStep, setCurrentStep] = useState<'main' | 'confirmation' | 'payment'>('main');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (flightOffer && visible) {
      const initialTravelers: Traveler[] = flightOffer.travelerPricings.map(t => ({
        id: t.travelerId,
        dateOfBirth: '',
        name: { firstName: '', lastName: '' },
        gender: 'MALE',
        travelerType: t.travelerType,
        nationality: 'US',
        contact: { 
          emailAddress: DEFAULT_CONTACT.emailAddress,
          phones: [DEFAULT_CONTACT.phone]
        },
        documents: [{
          documentType: 'PASSPORT',
          number: '',
          expiryDate: '',
          issuanceCountry: '',
          validityCountry: '',
          nationality: 'US',
          holder: true,
          birthPlace: 'Unknown',
          issuanceLocation: 'Unknown',
          issuanceDate: new Date().toISOString().split('T')[0]
        }]
      }));
      setTravelers(initialTravelers);
    }
  }, [flightOffer, visible]);

  const isValidDate = (dateString: string) => {
    const pattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    return pattern.test(dateString);
  };

  const saveBookingToFirestore = async (bookingData: FlightOrder, userId: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingData.id);
      await setDoc(bookingRef, {
        ...bookingData,
        userId,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      });
      console.log('Booking saved to Firestore');
    } catch (error) {
      console.error('Error saving booking to Firestore:', error);
      throw error;
    }
  };

  const sendConfirmationPDF = async (email: string, bookingReference: string, order: FlightOrder): Promise<IPDFData> => {
    try {
      if (!flightOffer?.itineraries?.[0]?.segments?.[0]) {
        throw new Error('Invalid flight data');
      }

      // Airline code to name mapping
      const carrierNameMap: Record<string, string> = {
        PC: 'Pegasus Airlines',
        VF: 'Vueling Airlines',
        TK: 'Turkish Airlines',
        // Add more mappings as needed
      };

      // Helper to get cabin and booking class from fareDetailsBySegment
      const getSegmentDetails = (segmentId: string) => {
        for (const pricing of flightOffer.travelerPricings) {
          const detail = pricing.fareDetailsBySegment.find(d => d.segmentId === segmentId);
          if (detail) {
            return {
              cabin: detail.cabin,
              bookingClass: detail.class
            };
          }
        }
        return { cabin: 'ECONOMY', bookingClass: 'Y' }; // Fallback values
      };

      // Build complete flights data
      const flightData = flightOffer.itineraries.map(itinerary => ({
        itineraryType: itinerary.segments.length > 1 ? 'RETURN' : 'ONEWAY',
        segments: itinerary.segments.map(segment => {
          const { cabin, bookingClass } = getSegmentDetails(segment.id);
          return {
            departure: {
              iataCode: segment.departure.iataCode,
              time: segment.departure.at
            },
            arrival: {
              iataCode: segment.arrival.iataCode,
              time: segment.arrival.at
            },
            airline: {
              code: segment.carrierCode,
              name: carrierNameMap[segment.carrierCode] || 'Unknown Airline'
            },
            flightNumber: `${segment.carrierCode}${segment.number}`,
            duration: segment.duration,
            cabin,
            bookingClass,
            aircraft: segment.aircraft?.code
          };
        })
      }));

      const pdfData: IPDFData = {
        bookingReference,
        email,
        flights: flightData,
        passengers: travelers.map(t => ({
          firstName: t.name.firstName,
          lastName: t.name.lastName,
          dateOfBirth: t.dateOfBirth,
          documents: t.documents.map(d => ({
            type: d.documentType,
            number: d.number,
            expiry: d.expiryDate
          })),
          contact: {
            email: t.contact.emailAddress,
            phone: t.contact.phones[0]
              ? `+${t.contact.phones[0].countryCallingCode} ${t.contact.phones[0].number}`
              : undefined
          }
        })),
        price: {
          total: flightOffer.price.total,
          currency: flightOffer.price.currency,
          taxes: flightOffer.price.taxes?.map(t => ({
            code: t.code || 'TAX',
            amount: t.amount
          })) || [],
          fees: flightOffer.price.fees?.map(f => ({
            type: f.type,
            amount: f.amount
          })) || []
        },
        payment: {
          id: order.id,
          status: "confirmed",
          amount: parseFloat(flightOffer.price.total),
          currency: flightOffer.price.currency,
          method: "credit_card",
          processedAt: new Date().toISOString()
        },
        contactDetails: {
          agency: {
            name: "UBOOR TRAVEL",
            email: "support@uboor.com",
            phone: "+90 548 827 0084"
          },
          customer: {
            name: `${travelers[0].name.firstName} ${travelers[0].name.lastName}`,
            email: travelers[0].contact.emailAddress,
            phone: travelers[0].contact.phones[0]
              ? `+${travelers[0].contact.phones[0].countryCallingCode} ${travelers[0].contact.phones[0].number}`
              : '',
            address: " LODOS St, Girne, CY 99300"
          }
        },
        metadata: {
          issuedBy: "UBOOR Booking System",
          issueDate: new Date().toISOString(),
          termsLink: "https://uboor.com/terms"
        }
      };

      const response = await fetch(`${BASE_URL}/api/pdf/sent-flight-ticket`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
        body: JSON.stringify(pdfData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send ticket');
      }

      return pdfData;
    } catch (error) {
      console.error('Ticket sending error:', error);
      throw error;
    }
  };

  const handleConfirmBooking = useCallback(async () => {
    setLoading(true);
    try {
      const validationErrors: Record<string, string> = {};
      
      travelers.forEach((traveler, tIndex) => {
        if (!traveler.name.firstName) validationErrors[`traveler${tIndex}_firstName`] = `Traveler ${tIndex + 1}: First name required`;
        if (!traveler.name.lastName) validationErrors[`traveler${tIndex}_lastName`] = `Traveler ${tIndex + 1}: Last name required`;
        if (!traveler.dateOfBirth) validationErrors[`traveler${tIndex}_dob`] = `Traveler ${tIndex + 1}: Birth date required`;
        if (!traveler.nationality) validationErrors[`traveler${tIndex}_nationality`] = `Traveler ${tIndex + 1}: Nationality required`;
        
        traveler.documents.forEach((doc, dIndex) => {
          if (!doc.number) validationErrors[`traveler${tIndex}_doc${dIndex}_number`] = `Traveler ${tIndex + 1} Doc ${dIndex + 1}: Number required`;
          if (!doc.expiryDate || !isValidDate(doc.expiryDate)) {
            validationErrors[`traveler${tIndex}_doc${dIndex}_expiry`] = `Traveler ${tIndex + 1} Doc ${dIndex + 1}: Invalid expiry (YYYY-MM-DD)`;
          }
          if (!doc.issuanceCountry || doc.issuanceCountry.length !== 2) {
            validationErrors[`traveler${tIndex}_doc${dIndex}_issueCountry`] = `Traveler ${tIndex + 1} Doc ${dIndex + 1}: 2-letter country code required`;
          }
          if (!doc.nationality || doc.nationality.length !== 2) {
            validationErrors[`traveler${tIndex}_doc${dIndex}_nationality`] = `Traveler ${tIndex + 1} Doc ${dIndex + 1}: 2-letter nationality required`;
          }
        });
      });

      if (Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.values(validationErrors).join('\n\n');
        Alert.alert('Missing Information', errorMessages);
        return;
      }

      setActiveModal('payment');
    } finally {
      setLoading(false);
    }
  }, [travelers]);

  const handlePaymentSuccess = useCallback(async (email: string, paymentId: string) => {
    setLoading(true);
    try {
      if (!flightOffer) throw new Error('No flight selected');
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Transform flight offer into the required structure
      const flightOffers = [{
        ...flightOffer,
        travelerPricings: flightOffer.travelerPricings.map(pricing => ({
          ...pricing,
          fareDetailsBySegment: pricing.fareDetailsBySegment?.map(segment => ({
            ...segment,
            includedCabinBags: {
              quantity: segment.includedCabinBags?.quantity || 1,
              weight: segment.includedCabinBags?.weight || 0,
              weightUnit: segment.includedCabinBags?.weightUnit || 'KG'
            }
          }))
        }))
      }];

      // Transform travelers into the required structure
      const bookingTravelers = travelers.map(traveler => ({
        ...traveler,
        documents: traveler.documents.map(doc => ({
          ...doc,
          issuanceCountry: doc.issuanceCountry.toUpperCase(),
          validityCountry: doc.validityCountry.toUpperCase(),
          nationality: doc.nationality.toUpperCase(),
          birthPlace: doc.birthPlace || 'Unknown',
          issuanceLocation: doc.issuanceLocation || 'Unknown'
        }))
      }));

      // Construct the complete booking request
      const bookingRequest = {
        data: {
          type: "flight-order",
          flightOffers,
          travelers: bookingTravelers,
          remarks: {
            general: [{
              subType: "GENERAL_MISCELLANEOUS", 
              text: "Mobile app booking"
            }]
          },
          ticketingAgreement: {
            option: "DELAY_TO_CANCEL",
            delay: "6D"
          },
          contacts: [{
            addresseeName: {
              firstName: "UBOOR",
              lastName: "SUPPORT"
            },
            companyName: "UBOOR TRAVEL",
            purpose: "STANDARD",
            emailAddress: "support@uboor.com",
            phones: [{
              deviceType: "MOBILE",
              countryCallingCode: "90",
              number: "5488270084"
            }],
            address: {
              lines: ["Main Street 123"],
              postalCode: "34000",
              cityName: "Istanbul",
              countryCode: "TR"
            }
          }],
          metadata: {
            paymentId,
            customerEmail: email
          }
        }
      };

      const response = await fetch(`${BASE_URL}/api/flights/book`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify(bookingRequest)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error?.message || 'Booking failed. Please try again.');
      }

      // Save booking to Firestore
      await saveBookingToFirestore(responseData.data, user.uid);

      // Send confirmation PDF
      const bookingReference = responseData.data.associatedRecords[0]?.reference || responseData.data.id;
      await sendConfirmationPDF(email, bookingReference, responseData.data);

      setBookingResult(responseData.data);
      onBookingComplete(responseData.data);
      setActiveModal(null);
    } catch (error: any) {
      Alert.alert(
        'Booking Error',
        error.message || 'Failed to complete booking. Please contact support.',
        [
          { 
            text: 'Contact Support', 
            onPress: () => Linking.openURL('mailto:support@uboor.com') 
          },
          { text: 'OK' }
        ]
      );
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  }, [flightOffer, travelers, onBookingComplete]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  const renderContent = useMemo(() => {
    if (bookingResult) {
      return (
        <View style={styles.successContainer}>
          <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
          <Text style={[styles.successTitle, { color: textColor }]}>
            Booking Confirmed!
          </Text>
          <Text style={[styles.successText, { color: textColor }]}>
            Reference: {bookingResult.bookingReference || bookingResult.id}
          </Text>
          <Text style={[styles.successText, { color: textColor }]}>
            A confirmation has been sent to your email
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: highlightColor }]}
            onPress={onClose}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return currentStep === 'main' ? (
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Travelers ({travelers.length})
        </Text>
        <FlatList
          data={travelers}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <TravelerCard
              traveler={item}
              index={index}
              onPress={() => {
                setCurrentTravelerIndex(index);
                setActiveModal('traveler');
              }}
              onDocumentsPress={() => {
                setCurrentTravelerIndex(index);
                setActiveModal('document');
              }}
            />
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: highlightColor, marginTop: 16 }
              ]}
              onPress={() => setCurrentStep('confirmation')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Review Booking</Text>
              )}
            </TouchableOpacity>
          }
        />
      </View>
    ) : (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Booking Summary</Text>
        
        <View style={[styles.card, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.subTitle, { color: highlightColor }]}>Flight Details</Text>
          {flightOffer && (
            <>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: textColor }]}>Route:</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {flightOffer.itineraries[0].segments[0].departure.iataCode}  
                  {flightOffer.itineraries[flightOffer.itineraries.length - 1]
                    .segments[flightOffer.itineraries[0].segments.length - 1].arrival.iataCode}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: textColor }]}>Departure:</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {new Date(flightOffer.itineraries[0].segments[0].departure.at).toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: textColor }]}>Return:</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {new Date(flightOffer.itineraries[1]?.segments[0]?.departure.at || '').toLocaleString() || 'One-way'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: textColor }]}>Total Price:</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>
                  {flightOffer.price.total} {flightOffer.price.currency}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.subTitle, { color: highlightColor }]}>Travelers</Text>
          {travelers.map((traveler, index) => (
            <View key={index} style={styles.travelerItem}>
              <Text style={[styles.travelerName, { color: textColor }]}>
                {traveler.name.firstName} {traveler.name.lastName}
              </Text>
              <Text style={[styles.travelerInfo, { color: secondaryColor }]}>
                {traveler.travelerType} • {traveler.gender === 'MALE' ? 'Male' : 'Female'} • {traveler.nationality}
              </Text>
              <Text style={[styles.travelerInfo, { color: secondaryColor }]}>
                Passport: {traveler.documents[0]?.number || 'Not provided'}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: highlightColor }]}
            onPress={() => setCurrentStep('main')}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: highlightColor }]}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: highlightColor }]}
            onPress={handleConfirmBooking}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Confirm & Pay</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }, [bookingResult, currentStep, travelers, theme, loading]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor }]}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={[styles.loadingBox, { backgroundColor: surfaceColor }]}>
              <ActivityIndicator size="large" color={highlightColor} />
              <Text style={[styles.loadingText, { color: textColor }]}>Processing...</Text>
            </View>
          </View>
        )}

        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <MaterialIcons
            name={currentStep === 'main' ? 'close' : 'arrow-back'}
            size={24}
            color={highlightColor}
            onPress={currentStep === 'main' ? onClose : () => setCurrentStep('main')}
            disabled={loading}
          />
          <Text style={[styles.title, { color: textColor }]}>
            {bookingResult ? 'Booking Complete' : 'Complete Booking'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          {renderContent}
        </Animated.View>

        <BottomSheet visible={activeModal === 'traveler'} onClose={() => setActiveModal(null)}>
          <TravelerModal
            visible={activeModal === 'traveler'} 
            traveler={travelers[currentTravelerIndex]}
            index={currentTravelerIndex}
            onSave={(updatedTraveler) => {
              const newTravelers = [...travelers];
              newTravelers[currentTravelerIndex] = updatedTraveler;
              setTravelers(newTravelers);
              setActiveModal(null);
            }}
            onClose={() => setActiveModal(null)}
          />
        </BottomSheet>

        <BottomSheet visible={activeModal === 'document'} onClose={() => setActiveModal(null)}>
          <DocumentModal
            traveler={travelers[currentTravelerIndex]}
            visible={activeModal === 'document'} 
            index={currentTravelerIndex}
            onSave={(docs) => {
              const newTravelers = [...travelers];
              newTravelers[currentTravelerIndex].documents = docs;
              setTravelers(newTravelers);
              setActiveModal(null);
            }}
            onClose={() => setActiveModal(null)}
          />
        </BottomSheet>

        <BottomSheet visible={activeModal === 'payment'} onClose={() => setActiveModal(null)}>
          <PaymentModal
            amount={flightOffer?.price.total || '0'}
            currency={flightOffer?.price.currency || 'USD'}
            onPaymentSuccess={handlePaymentSuccess}
            onClose={() => setActiveModal(null)}
            visible={activeModal === 'payment'}
          />
        </BottomSheet>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  travelerItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  travelerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  travelerInfo: {
    fontSize: 14,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingBox: {
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 24,
  },
  successText: {
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FlightBookingModal;