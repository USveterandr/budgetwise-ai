import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Consultation } from '../../components/Consultation';

export default function ConsultationScreen() {
  return (
    <View style={styles.container}>
      <Consultation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});