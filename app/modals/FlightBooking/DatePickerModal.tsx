import React, { useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const DatePickerModal = ({ visible, onClose }) => {
  const [startDate, setStartDate] = useState('Wed, Apr 9');
  const [endDate, setEndDate] = useState('Fri, Apr 25');
  const [selectedDay, setSelectedDay] = useState(null);
  
  const daysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const renderDays = (month, year) => {
    const days = [];
    const totalDays = daysInMonth(month, year);
    for (let day = 1; day <= totalDays; day++) {
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.day,
            selectedDay === day && styles.selectedDay
          ]}
          onPress={() => setSelectedDay(day)}
        >
          <Text style={styles.dayText}>{day}</Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Date Range Display */}
          <View style={styles.dateRange}>
            <Text style={styles.dateText}>{startDate}</Text>
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
            <Text style={styles.dateText}>{endDate}</Text>
          </View>

          {/* Calendar for April */}
          <Text style={styles.monthTitle}>April 2025</Text>
          <View style={styles.calendar}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <Text key={index} style={styles.dayHeader}>{day}</Text>
            ))}
            {renderDays(4, 2025)} {/* April is the 4th month */}
          </View>

          {/* Calendar for May */}
          <Text style={styles.monthTitle}>May 2025</Text>
          <View style={styles.calendar}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <Text key={index} style={styles.dayHeader}>{day}</Text>
            ))}
            {renderDays(5, 2025)} {/* May is the 5th month */}
          </View>

          {/* Done Button */}
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1F2937', // Dark gray background
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  dateRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayHeader: {
    width: ' 14.28%', // 1/7 of the row
    textAlign: 'center',
    color: '#9CA3AF',
  },
  day: {
    width: '14.28%', // 1/7 of the row
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: '#3B82F6', // Blue background for selected day
  },
  dayText: {
    color: '#FFFFFF',
  },
  doneButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default DatePickerModal;