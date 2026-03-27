/**
 * 🧭 Navigation Bar Component
 * Premium-styled bottom navigation for main app navigation
 * Routes: Home, Communities, Marketplace, Profile (+ Discovery badge support)
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme/colors';

/** Navigation item configuration */
interface NavItem {
  name: string;
  label: string;
  shortLabel?: string;
  icon: string;
  route: string;
  activeColor: string;
  backgroundColor: string;
}

/** Primary navigation items with color scheme */
const NAV_ITEMS: NavItem[] = [
  {
    name: 'home',
    label: 'Home',
    icon: 'home',
    route: '/(tabs)',
    activeColor: '#0d9488',
    backgroundColor: '#0d948820',
  },
  {
    name: 'marketplace',
    label: 'Marketplace',
    shortLabel: 'Marketplace',
    icon: 'swap-horizontal',
    route: '/(tabs)/marketplace',
    activeColor: '#10b981',
    backgroundColor: '#10b98120',
  },
  {
    name: 'communities',
    label: 'Communities',
    icon: 'people',
    route: '/(tabs)/communities',
    activeColor: '#0891b2',
    backgroundColor: '#0891b220',
  },
  {
    name: 'profile',
    label: 'Menu',
    icon: 'menu',
    route: '/(tabs)/profile',
    activeColor: '#f97316',
    backgroundColor: '#f9731620',
  },
];

interface NavigationBarProps {
  badge?: number;
}

/**
 * Custom Navigation Bar Component
 * Replaces default tab bar with premium-styled bottom navigation
 * Handles routing via expo-router with programmatic navigation
 * 
 * @param badge - Notification badge count (shows on discovery/marketplace tab)
 */
export const NavigationBar: React.FC<NavigationBarProps> = ({ badge = 0 }) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  /** Check if route is active based on pathname */
  const isActive = (route: string): boolean => {
    return pathname.startsWith(route);
  };

  /** Handle navigation press */
  const handlePress = (route: string): void => {
    router.push(route);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 8 },
      ]}
    >
      {/* Premium Gradient Accent */}
      <View style={styles.gradientAccent} />

      <View style={styles.navContent}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.route);

          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.navItem,
                active && { backgroundColor: item.backgroundColor },
              ]}
              onPress={() => handlePress(item.route)}
              activeOpacity={0.6}
            >
              {/* Icon Container */}
              <View style={styles.iconContainer}>
                <View style={[active && styles.activeIconBackground]}>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={
                      active
                        ? item.activeColor
                        : colors.neutral[400]
                    }
                    weight={active ? 'fill' : 'regular'}
                  />
                </View>

                {/* Badge Notification */}
                {item.name === 'marketplace' && badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {badge > 9 ? '9+' : badge}
                    </Text>
                  </View>
                )}

                {/* Active Indicator */}
                {active && (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: item.activeColor },
                    ]}
                  />
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.navLabel,
                  active ? styles.navLabelActive : styles.navLabelInactive,
                ]}
                numberOfLines={1}
              >
                {item.shortLabel || item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 229, 229, 0.4)',
  },
  gradientAccent: {
    height: 2,
    backgroundColor: colors.primary[600],
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 32,
    height: 32,
  },
  activeIconBackground: {
    backgroundColor: colors.neutral[0],
    borderRadius: 12,
    padding: 6,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    backgroundColor: colors.error.DEFAULT,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[0],
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 3,
    borderRadius: 1.5,
    elevation: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 4,
  },
  navLabelActive: {
    color: colors.neutral[900],
    fontWeight: '800',
    fontSize: 11.5,
  },
  navLabelInactive: {
    color: colors.neutral[500],
  },
});

export default NavigationBar;
