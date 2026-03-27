import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { OfflineProvider } from '@/context/OfflineContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/theme/colors';
import { initApiService } from '@/services/api';

const queryClient = new QueryClient();

function RootLayoutContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Initialize API service on app load
  useEffect(() => {
    initApiService();
  }, []);

  // Watch for auth state changes and navigate accordingly
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('(tabs)');
      } else {
        router.replace('welcome');
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.neutral[0] }}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Welcome and Auth Screens */}
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth" />
      
      {/* Main App Navigation */}
      <Stack.Screen name="(tabs)" />
      
      {/* Detail/Modal Screens */}
      <Stack.Screen 
        name="item/[id]" 
        options={{ 
          presentation: 'card',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <OfflineProvider>
                <RootLayoutContent />
                <ToastContainer />
              </OfflineProvider>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
