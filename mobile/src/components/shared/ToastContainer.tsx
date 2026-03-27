/**
 * 🔔 Toast Container Component
 * Displays toast notifications
 */

import React from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useToast } from '@/context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/theme/colors';

const { height } = Dimensions.get('window');

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return colors.success.DEFAULT;
      case 'error':
        return colors.error.DEFAULT;
      case 'warning':
        return colors.warning.DEFAULT;
      default:
        return colors.info.DEFAULT;
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Animated.View
          key={toast.id}
          style={[
            styles.toastWrapper,
            { backgroundColor: getColor(toast.type) },
          ]}
        >
          <View style={styles.content}>
            <Ionicons
              name={getIcon(toast.type) as any}
              size={20}
              color={colors.white}
              style={styles.icon}
            />
            <Text style={styles.message}>{toast.message}</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  toastWrapper: {
    borderRadius: 8,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  icon: {
    marginRight: spacing.md,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.white,
  },
});

export default ToastContainer;
