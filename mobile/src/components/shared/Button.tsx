/**
 * 🔘 Button Component
 * Versatile button with multiple variants and sizes
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors, spacing, typography } from '@/theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const getVariantStyle = (variant: string) => {
  switch (variant) {
    case 'secondary':
      return { ...styles.secondary, ...styles.secondaryText };
    case 'outlined':
      return { ...styles.outlined, ...styles.outlinedText };
    case 'ghost':
      return { ...styles.ghost, ...styles.ghostText };
    case 'primary':
    default:
      return { ...styles.primary, ...styles.primaryText };
  }
};

const getSizeStyle = (size: string) => {
  switch (size) {
    case 'sm':
      return styles.sm;
    case 'lg':
      return styles.lg;
    case 'md':
    default:
      return styles.md;
  }
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const variantStyle = getVariantStyle(variant);
  const sizeStyle = getSizeStyle(size);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyle,
        variantStyle,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[variantStyle, styles.text, sizeStyle]} numberOfLines={1}>
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    fontWeight: '600',
  },

  // Sizes
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.md,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    fontSize: typography.fontSize.lg,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary.DEFAULT,
  },
  primaryText: {
    color: colors.white,
  },
  secondary: {
    backgroundColor: `${colors.primary.DEFAULT}15`,
  },
  secondaryText: {
    color: colors.primary.DEFAULT,
  },
  outlined: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlinedText: {
    color: colors.text.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.primary.DEFAULT,
  },

  // States
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
