import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';


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

  
const FlightResultsModal = ({ visible, onClose, results }) => {
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (start, end) => {
        const diff = new Date(end) - new Date(start);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <Modal 
            visible={visible} 
            animationType="slide"
            transparent={false}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Flight Options</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {results.length > 0 ? (
                        results.map((offer, index) => (
                            <View key={index} style={styles.offerCard}>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceText}>
                                        {offer.price.total} {offer.price.currency}
                                    </Text>
                                    <Text style={styles.priceSubText}>
                                        {offer.travelerPricings.length} travelers
                                    </Text>
                                </View>

                                {offer.itineraries.map((itinerary, i) => (
                                    <View key={i} style={styles.itineraryContainer}>
                                        <Text style={styles.itineraryTitle}>
                                            {i === 0 ? 'Outbound' : 'Return'} • {itinerary.segments.length} {itinerary.segments.length > 1 ? 'flights' : 'flight'} • {formatDuration(itinerary.segments[0].departure.at, itinerary.segments[itinerary.segments.length - 1].arrival.at)}
                                        </Text>

                                        {itinerary.segments.map((segment, j) => (
                                            <View key={j} style={styles.segmentCard}>
                                                <View style={styles.segmentHeader}>
                                                    <Text style={styles.segmentTime}>
                                                        {formatTime(segment.departure.at)} - {formatTime(segment.arrival.at)}
                                                    </Text>
                                                    <Text style={styles.segmentDuration}>
                                                        {formatDuration(segment.departure.at, segment.arrival.at)}
                                                    </Text>
                                                </View>
                                                
                                                <View style={styles.segmentBody}>
                                                    <View style={styles.segmentAirport}>
                                                        <Text style={styles.airportCode}>{segment.departure.iataCode}</Text>
                                                        <Text style={styles.airportName}>{segment.departure.terminal ? `Terminal ${segment.departure.terminal}` : ''}</Text>
                                                    </View>
                                                    
                                                    <View style={styles.segmentDivider}>
                                                        <View style={styles.dividerLine} />
                                                        <Text style={styles.flightNumber}>
                                                            {segment.carrierCode} {segment.number}
                                                        </Text>
                                                    </View>
                                                    
                                                    <View style={styles.segmentAirport}>
                                                        <Text style={styles.airportCode}>{segment.arrival.iataCode}</Text>
                                                        <Text style={styles.airportName}>{segment.arrival.terminal ? `Terminal ${segment.arrival.terminal}` : ''}</Text>
                                                    </View>
                                                </View>
                                                
                                                <Text style={styles.segmentDate}>
                                                    {formatDate(segment.departure.at)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}

                                <TouchableOpacity style={styles.selectButton}>
                                    <Text style={styles.selectButtonText}>Select this flight</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    ) : (
                        <View style={styles.noResultsContainer}>
                            <Text style={styles.noResultsText}>No flights found</Text>
                            <Text style={styles.noResultsSubText}>Try adjusting your search criteria</Text>
                            <TouchableOpacity style={styles.closeButtonAlt} onPress={onClose}>
                                <Text style={styles.closeButtonAltText}>Go back</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.medium,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.primary,
    },
    headerTitle: {
        fontSize: theme.fontSize.large,
        fontWeight: '600',
        color: '#ffffff',
    },
    closeButton: {
        padding: theme.spacing.small,
    },
    closeButtonText: {
        fontSize: theme.fontSize.large,
        color: '#ffffff',
    },
    scrollContainer: {
        padding: theme.spacing.medium,
    },
    offerCard: {
        backgroundColor: '#ffffff',
        borderRadius: theme.borderRadius.medium,
        marginBottom: theme.spacing.medium,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    priceContainer: {
        padding: theme.spacing.medium,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.secondary,
    },
    priceText: {
        fontSize: theme.fontSize.xlarge,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    priceSubText: {
        fontSize: theme.fontSize.small,
        color: theme.colors.text,
        opacity: 0.7,
    },
    itineraryContainer: {
        padding: theme.spacing.medium,
    },
    itineraryTitle: {
        fontSize: theme.fontSize.medium,
        fontWeight: '500',
        color: theme.colors.text,
        marginBottom: theme.spacing.medium,
    },
    segmentCard: {
        marginBottom: theme.spacing.medium,
        borderWidth: 1,
        borderColor: theme.colors.secondary,
        borderRadius: theme.borderRadius.small,
        padding: theme.spacing.medium,
    },
    segmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.small,
    },
    segmentTime: {
        fontSize: theme.fontSize.medium,
        fontWeight: '500',
        color: theme.colors.text,
    },
    segmentDuration: {
        fontSize: theme.fontSize.small,
        color: theme.colors.text,
        opacity: 0.7,
    },
    segmentBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.small,
    },
    segmentAirport: {
        alignItems: 'center',
        flex: 1,
    },
    airportCode: {
        fontSize: theme.fontSize.large,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    airportName: {
        fontSize: theme.fontSize.small,
        color: theme.colors.text,
        opacity: 0.6,
    },
    segmentDivider: {
        alignItems: 'center',
        flex: 2,
    },
    dividerLine: {
        height: 1,
        backgroundColor: theme.colors.secondary,
        width: '100%',
        marginVertical: theme.spacing.small,
    },
    flightNumber: {
        fontSize: theme.fontSize.small,
        color: theme.colors.text,
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: theme.spacing.small,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.small,
    },
    segmentDate: {
        fontSize: theme.fontSize.small,
        color: theme.colors.text,
        opacity: 0.7,
    },
    selectButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.medium,
        alignItems: 'center',
    },
    selectButtonText: {
        color: '#ffffff',
        fontSize: theme.fontSize.medium,
        fontWeight: '500',
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.large,
    },
    noResultsText: {
        fontSize: theme.fontSize.large,
        fontWeight: '500',
        color: theme.colors.text,
        marginBottom: theme.spacing.small,
    },
    noResultsSubText: {
        fontSize: theme.fontSize.medium,
        color: theme.colors.text,
        opacity: 0.7,
        marginBottom: theme.spacing.medium,
    },
    closeButtonAlt: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.large,
        paddingVertical: theme.spacing.medium,
        borderRadius: theme.borderRadius.medium,
    },
    closeButtonAltText: {
        color: '#ffffff',
        fontSize: theme.fontSize.medium,
        fontWeight: '500',
    },
});

export default FlightResultsModal;