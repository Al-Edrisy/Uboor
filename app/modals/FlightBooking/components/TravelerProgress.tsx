// app/modals/FlightBooking/components/TravelerProgress.tsx
import React, { memo, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColor } from '@/components/Themed';

interface TravelerProgressProps {
  completeness: number;
  highlightColor?: string;
  warningColor?: string;
}

const TravelerProgress: React.FC<TravelerProgressProps> = memo(({ 
  completeness,
  highlightColor,
  warningColor
}) => {
  const defaultHighlightColor = useThemeColor({}, 'highlight');
  const defaultWarningColor = useThemeColor({}, 'warning');
  const secondaryColor = useThemeColor({}, 'secondary');

  const progressColor = completeness === 1 ? 
    (highlightColor || defaultHighlightColor) : 
    (warningColor || defaultWarningColor);

  return (
    <View style={[
      styles.progressContainer,
      { backgroundColor: secondaryColor }
    ]}>
      <View 
        style={[
          styles.progressBar,
          { 
            width: `${Math.min(100, completeness * 100)}%`, 
            backgroundColor: progressColor 
          }
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  progressContainer: {
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});

export default TravelerProgress;