// app/modals/FlightBooking/components/DocumentTypeIcon.tsx
import React, { memo, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';

interface DocumentTypeIconProps {
  type: 'PASSPORT' | 'ID_CARD';
  color?: string;
}

const DocumentTypeIcon: React.FC<DocumentTypeIconProps> = memo(({ type, color }) => {
  const highlightColor = useThemeColor({}, 'highlight');
  const iconColor = color || highlightColor;

  return (
    <View style={styles.docIconContainer}>
      {type === 'PASSPORT' ? (
        <MaterialIcons name="book" size={20} color={iconColor} />
      ) : (
        <MaterialIcons name="credit-card" size={20} color={iconColor} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  docIconContainer: {
    marginRight: 4,
  },
});

export default DocumentTypeIcon;