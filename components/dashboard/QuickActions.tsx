import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.action} 
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
            <Ionicons name={action.icon} size={24} color={action.color} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  action: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: DashboardColors.textSecondary,
    textAlign: 'center',
  },
});
