import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { DashboardColors } from '../../constants/Colors';

interface SummaryCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

export function SummaryCard({ title, value, change, changeType, icon, iconColor }: SummaryCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          <Text style={[styles.change, changeType === 'positive' ? styles.positive : styles.negative]}>
            {change}
          </Text>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    maxWidth: '48%', // Ensure cards don't take more than half the width minus gap
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 13,
    color: DashboardColors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: DashboardColors.text,
    marginBottom: 4,
  },
  change: {
    fontSize: 12,
    fontWeight: '500',
  },
  positive: {
    color: DashboardColors.income,
  },
  negative: {
    color: DashboardColors.expense,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});