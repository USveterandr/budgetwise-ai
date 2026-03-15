import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BudgetPlanning } from '../../components/BudgetPlanning';

export default function BudgetPlanningScreen() {
  return (
    <View style={styles.container}>
      <BudgetPlanning />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});