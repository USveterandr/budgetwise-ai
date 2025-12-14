import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Profile } from '../../components/Profile';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Profile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});