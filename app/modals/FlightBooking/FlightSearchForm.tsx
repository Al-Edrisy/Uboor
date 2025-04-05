// app/modals/FlightBooking/FlightSearchForm.tsx
import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const FlightSearchForm = () => {
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [date, setDate] = React.useState('');

  const handleSearch = () => {
    console.log('Searching for flights:', { from, to, date });
  };

  return (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="From"
        value={from}
        onChangeText={setFrom}
      />
      <TextInput
        style={styles.input}
        placeholder="To"
        value={to}
        onChangeText={setTo}
      />
      <TextInput
        style={styles.input}
        placeholder="Date"
        value={date}
        onChangeText={setDate}
      />
      <Button title="Search" onPress={handleSearch} />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
 borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default FlightSearchForm;