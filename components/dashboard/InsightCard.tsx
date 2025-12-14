import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface InsightCardProps {
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'success';
}

export function InsightCard({ title, content, type = 'info' }: InsightCardProps) {
  const colors = {
    info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
    warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
    success: { bg: '#ECFDF5', border: '#10B981', text: '#065F46' },
  };

  const color = colors[type];

  return (
    <View style={[styles.container, { backgroundColor: color.bg, borderLeftColor: color.border }]}>
      <View style={styles.header}>
        <Ionicons 
          name={type === 'warning' ? 'warning' : type === 'success' ? 'checkmark-circle' : 'bulb'} 
          size={18} 
          color={color.border} 
        />
        <Text style={[styles.title, { color: color.text }]}>{title}</Text>
      </View>
      <Text style={[styles.content, { color: color.text }]}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    fontSize: 13,
    lineHeight: 20,
  },
});
