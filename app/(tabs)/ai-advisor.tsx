import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AiAdvisor } from '../../components/AiAdvisor';

export default function AiAdvisorScreen() {
  return (
    <View style={styles.container}>
      <AiAdvisor />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});