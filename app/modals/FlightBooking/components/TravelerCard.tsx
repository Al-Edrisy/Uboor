// app/modals/FlightBooking/components/TravelerCard.tsx
import React, { memo, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Traveler } from "../types/bookingTypes";
import TravelerProgress from './TravelerProgress';
import { useTheme } from '@/app/context/ThemeContext';
import { useThemeColor } from '@/components/Themed';

interface TravelerCardProps {
  traveler: Traveler;
  index: number;
  onPress: () => void;
  onDocumentsPress: () => void;
}

const TravelerCard: React.FC<TravelerCardProps> = memo(({ 
  traveler, 
  index, 
  onPress, 
  onDocumentsPress
}) => {
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const highlightColor = useThemeColor({}, 'highlight');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'error');
  const secondaryColor = useThemeColor({}, 'secondary');

  const hasMissingInfo = !traveler.name.firstName || !traveler.dateOfBirth || 
                        traveler.documents.some(doc => !doc.number || !doc.expiryDate || !doc.validityCountry);

  const completeness = [
    traveler.name.firstName,
    traveler.dateOfBirth,
    ...traveler.documents.map(doc => doc.number && doc.expiryDate && doc.validityCountry)
  ].filter(Boolean).length / (2 + traveler.documents.length * 3);

  const cardStyle = [
    styles.card, 
    { 
      backgroundColor,
      borderColor: hasMissingInfo ? dangerColor : borderColor,
      shadowColor: theme === 'light' ? '#000' : 'transparent',
      elevation: theme === 'light' ? 2 : 0,
    }
  ];

  const docButtonStyle = [
    styles.docButton, 
    { 
      borderColor: highlightColor,
      backgroundColor: traveler.documents.length > 0 ? highlightColor : 'transparent'
    }
  ];

  const warningBadgeStyle = [
    styles.warningBadge,
    { backgroundColor: dangerColor + '20' }
  ];

  return (
    <View style={cardStyle}>
      <TouchableOpacity 
        onPress={onPress} 
        style={styles.cardHeader}
        activeOpacity={0.7}
      >
        <View style={styles.travelerInfo}>
          <Text style={[styles.travelerName, { color: highlightColor }]}>
            {traveler.name.firstName || `Traveler ${index + 1}`}
          </Text>
          {traveler.travelerType && (
            <Text style={[styles.travelerType, { color: textColor }]}>
              {traveler.travelerType.charAt(0) + traveler.travelerType.slice(1).toLowerCase()}
            </Text>
          )}
        </View>
        <MaterialIcons name="edit" size={20} color={highlightColor} />
      </TouchableOpacity>
      
      <TravelerProgress completeness={completeness} highlightColor={highlightColor} />
      
      {traveler.name.firstName && (
        <View style={styles.detailsContainer}>
          <Text style={[styles.detailText, { color: textColor }]}>
            {traveler.gender === 'MALE' ? 'Male' : 'Female'}, Born {traveler.dateOfBirth}
          </Text>
          <Text style={[styles.detailText, { color: textColor }]}>
            {traveler.contact.emailAddress} (default)
          </Text>
          {traveler.contact.phones[0] && (
            <Text style={[styles.detailText, { color: textColor }]}>
              +{traveler.contact.phones[0].countryCallingCode} {traveler.contact.phones[0].number} (default)
            </Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={docButtonStyle}
          onPress={onDocumentsPress}
          activeOpacity={0.7}
        >
          <View style={styles.docButtonContent}>
            <MaterialIcons 
              name="description" 
              size={16} 
              color={traveler.documents.length > 0 ? backgroundColor : highlightColor} 
              style={styles.docIcon}
            />
            <Text style={[
              styles.docButtonText, 
              { color: traveler.documents.length > 0 ? backgroundColor : highlightColor }
            ]}>
              {traveler.documents.length} Document{traveler.documents.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </TouchableOpacity>

        {hasMissingInfo && (
          <View style={warningBadgeStyle}>
            <MaterialIcons name="warning" size={16} color={dangerColor} />
            <Text style={[styles.warningText, { color: dangerColor }]}>Missing info</Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  travelerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelerName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  travelerType: {
    fontSize: 12,
    opacity: 0.8,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  docButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  docButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    marginRight: 4,
  },
  docButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: 12,
    paddingVertical: 4,
  },
  warningText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default TravelerCard;