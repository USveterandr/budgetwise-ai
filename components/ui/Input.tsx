import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Colors, DashboardColors } from '../../constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  variant?: 'light' | 'dark';
}

export function Input({ 
  label, 
  error, 
  containerStyle, 
  variant = 'light',
  ...props 
}: InputProps) {
  const isDark = variant === 'dark';
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          isDark && styles.inputDark,
          error && styles.inputError,
        ]}
        placeholderTextColor={isDark ? Colors.textMuted : DashboardColors.textSecondary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DashboardColors.text,
    marginBottom: 8,
  },
  labelDark: {
    color: Colors.text,
  },
  input: {
    backgroundColor: DashboardColors.surface,
    borderWidth: 1,
    borderColor: DashboardColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: DashboardColors.text,
  },
  inputDark: {
    backgroundColor: Colors.backgroundLight,
    borderColor: Colors.border,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
});
