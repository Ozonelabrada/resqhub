/**
 * 🏷️ Badge Component
 * Small status indicator badge
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme/colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'sm',
  style,
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.success.light, text: colors.success.DEFAULT };
      case 'error':
        return { bg: colors.error.light, text: colors.error.DEFAULT };
      case 'warning':
        return { bg: colors.warning.light, text: colors.warning.DEFAULT };
      case 'neutral':
        return { bg: colors.neutral[100], text: colors.neutral[700] };
      case 'primary':
      default:
        return { bg: `${colors.primary.DEFAULT}15`, text: colors.primary.DEFAULT };
    }
  };

  const colors_varaint = getVariantColor();
  const sizeStyle = size === 'sm' ? styles.sm : styles.md;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors_varaint.bg },
        sizeStyle,
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors_varaint.text }, sizeStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontWeight: '600',
    fontSize: typography.fontSize.xs,
  },
});

export default Badge;
