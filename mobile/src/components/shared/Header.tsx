/**
 * 🎯 Header Component
 * Standard header for all screens with navigation and actions
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/theme/colors';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  variant?: 'light' | 'dark';
  showSearch?: boolean;
  showNotifications?: boolean;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  containerStyle?: ViewStyle;
  onSearchPress?: () => void;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  variant = 'light',
  showSearch = false,
  showNotifications = false,
  leftAction,
  rightAction,
  containerStyle,
  onSearchPress,
  notificationCount = 0,
}) => {
  const insets = useSafeAreaInsets();

  const isDark = variant === 'dark';
  const bgColor = isDark ? colors.neutral[900] : colors.white;
  const textColor = isDark ? colors.white : colors.neutral[900];

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={bgColor}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: bgColor,
            paddingTop: insets.top + 12,
          },
          containerStyle,
        ]}
      >
        {/* Left Action */}
        <View style={styles.leftSection}>
          {leftAction || <View style={styles.placeholder} />}
        </View>

        {/* Title Section */}
        <View style={styles.centerSection}>
          {title && (
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.neutral[500] }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Actions */}
        <View style={styles.rightSection}>
          {showSearch && (
            <TouchableOpacity onPress={onSearchPress} style={styles.actionButton}>
              <Ionicons name="search" size={24} color={colors.primary.DEFAULT} />
            </TouchableOpacity>
          )}
          {showNotifications && (
            <View style={styles.notificationWrapper}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="notifications" size={24} color={colors.primary.DEFAULT} />
              </TouchableOpacity>
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </View>
          )}
          {rightAction}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    marginHorizontal: spacing.md,
    alignItems: 'center',
  },
  rightSection: {
    width: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  notificationWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error.DEFAULT,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default Header;
