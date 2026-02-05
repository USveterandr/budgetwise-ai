import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = React.useState('');

  const markedDates = {
    '2026-02-02': { marked: true, selected: true, selectedColor: '#6366f1' },
    '2026-02-05': { marked: true, dotColor: '#f59e0b' },
    '2026-02-10': { marked: true, dotColor: '#ef4444' },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
      </View>

      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          selectedDayBackgroundColor: '#6366f1',
          todayTextColor: '#6366f1',
          arrowColor: '#6366f1',
        }}
      />

      <ScrollView style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Events for {selectedDate || 'Today'}</Text>
        
        <TouchableOpacity style={styles.eventItem}>
          <View style={styles.eventDot} />
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>Team Meeting</Text>
            <Text style={styles.eventTime}>10:00 AM - 11:00 AM</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.eventItem}>
          <View style={[styles.eventDot, { backgroundColor: '#f59e0b' }]} />
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>Project Deadline</Text>
            <Text style={styles.eventTime}>5:00 PM</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.syncButton}>
          <Text style={styles.syncButtonText}>Sync Calendar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  eventsSection: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  eventItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
  },
  syncButton: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
