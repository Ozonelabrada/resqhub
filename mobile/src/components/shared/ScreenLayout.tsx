/**
 * 🎯 Screen Layout Component
 * Wrapper component that combines Header, content area, and navigation bar
 */

import React from 'react';
import {
  View,
  ScrollView,
  ViewStyle,
  ScrollViewProps,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header, { HeaderProps } from './Header';
import NavigationBar from './NavigationBar';
import { colors } from '@/theme/colors';

interface ScreenLayoutProps extends ScrollViewProps {
  children: React.ReactNode;
  headerProps?: HeaderProps;
  showHeader?: boolean;
  showNavBar?: boolean;
  navBarBadge?: number;
  scrollable?: boolean;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
}

/**
 * ScreenLayout Component
 * Provides consistent header, content area, and navigation bar
 * With modern design patterns and proper spacing
 *
 * @example
 * <ScreenLayout
 *   headerProps={{ title: 'Home' }}
 *   scrollable={true}
 * >
 *   <Text>Your content here</Text>
 * </ScreenLayout>
 */
export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  headerProps,
  showHeader = true,
  showNavBar = true,
  navBarBadge,
  scrollable = true,
  containerStyle,
  contentStyle,
  ...scrollViewProps
}) => {
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Header */}
      {showHeader && <Header {...headerProps} />}

      {/* Content */}
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            paddingBottom: showNavBar ? 80 + insets.bottom : insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}

      {/* Navigation Bar */}
      {showNavBar && <NavigationBar badge={navBarBadge} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ScreenLayout;
