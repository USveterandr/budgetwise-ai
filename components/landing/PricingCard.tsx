import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  onSelect: () => void;
}

export function PricingCard({ name, price, period, features, popular, onSelect }: PricingCardProps) {
  return (
    <View style={[styles.container, popular && styles.popular]}>
      {popular && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Most Popular</Text>
        </View>
      )}
      <Text style={styles.name}>{name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.period}>/{period}</Text>
      </View>
      <View style={styles.features}>
        {features.map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity 
        style={[styles.button, popular && styles.buttonPopular]} 
        onPress={onSelect}
      >
        <Text style={[styles.buttonText, popular && styles.buttonTextPopular]}>
          Get Started
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  popular: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.text,
  },
  period: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  features: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 10,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPopular: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  buttonTextPopular: {
    color: Colors.white,
  },
});
