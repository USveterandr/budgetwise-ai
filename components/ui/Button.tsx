import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconSize,
  iconColor
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    (styles as any)[variant],
    (styles as any)[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    (styles as any)[`${variant}Text`],
    (styles as any)[`${size}Text`],
    textStyle,
  ];

  const defaultIconSize = size === 'large' ? 24 : size === 'medium' ? 20 : 18;
  const finalIconColor = iconColor || (variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white);

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      onPress={onPress} 
      disabled={disabled || loading}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && (
            <Ionicons 
              name={icon} 
              size={iconSize || defaultIconSize} 
              color={finalIconColor} 
              style={styles.icon} 
            />
          )}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  dark: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  small: { paddingVertical: 10, paddingHorizontal: 16 },
  medium: { paddingVertical: 14, paddingHorizontal: 24 },
  large: { paddingVertical: 18, paddingHorizontal: 32 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '700' as const, letterSpacing: 0.2 },
  primaryText: { color: Colors.white },
  secondaryText: { color: Colors.white },
  outlineText: { color: Colors.primary },
  ghostText: { color: Colors.primary },
  darkText: { color: '#F8FAFC' },
  smallText: { fontSize: 14 },
  mediumText: { fontSize: 16 },
  largeText: { fontSize: 18 },
});
