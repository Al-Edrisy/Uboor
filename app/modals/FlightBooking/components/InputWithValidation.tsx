import React, { memo } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

interface InputWithValidationProps {
  label?: string;
  error?: string;
  style?: any;
  textColor: string;
  borderColor: string;
  surfaceColor: string;
  dangerColor: string;
  placeholderColor: string;
  [key: string]: any;
}

const InputWithValidation: React.FC<InputWithValidationProps> = memo(({ 
  label,
  error, 
  style, 
  textColor,
  borderColor,
  surfaceColor,
  dangerColor,
  placeholderColor,
  ...props 
}) => {
  const inputStyle = [
    styles.input,
    { 
      color: textColor, 
      borderColor: error ? dangerColor : borderColor,
      backgroundColor: surfaceColor
    },
    style,
  ];

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.labelText, { color: textColor }]}>
          {label}
        </Text>
      )}
      <TextInput
        {...props}
        style={inputStyle}
        placeholderTextColor={placeholderColor}
      />
      {error && (
        <Text style={[styles.errorText, { color: dangerColor }]}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default InputWithValidation;