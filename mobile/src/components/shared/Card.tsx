/**
 * 🎴 Card Component
 * Reusable card container for content
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';
import { colors, spacing } from '@/theme/colors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

const getPadding = (size?: string) => {
  switch (size) {
    case 'xs':
      return spacing.xs;
    case 'sm':
      return spacing.sm;
    case 'md':
      return spacing.md;
    case 'lg':
      return spacing.lg;
    case 'xl':
      return spacing.xl;
    default:
      return spacing.md;
  }
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'filled',
  padding = 'md',
  style,
  onPress,
  disabled = false,
}) => {
  const paddingValue = getPadding(padding);

  let variantStyle = {};
  switch (variant) {
    case 'elevated':
      variantStyle = styles.elevated;
      break;
    case 'outlined':
      variantStyle = styles.outlined;
      break;
    case 'filled':
    default:
      variantStyle = styles.filled;
  }

  const content = (
    <View
      style={[
        styles.container,
        variantStyle,
        { padding: paddingValue },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} disabled={disabled}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
  },
  elevated: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlined: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filled: {
    backgroundColor: colors.surface,
  },
});

export default Card;
