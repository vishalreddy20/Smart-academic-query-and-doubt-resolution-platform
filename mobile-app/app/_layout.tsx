import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getRoleDashboardPath } from '@/services/api';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.accent,
    background: Colors.background,
    surface: Colors.surface,
    surfaceVariant: Colors.surfaceAlt,
    outline: Colors.border,
    onSurface: Colors.text,
    onSurfaceVariant: Colors.muted,
  },
};

function RouteGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const root = segments[0];
    const isAuthGroup = root === '(auth)';
    const isProtectedGroup = root === '(student)' || root === '(faculty)' || root === '(admin)';
    const isPublicRoute = root === 'knowledge-base' || root === undefined;

    if (!user && isProtectedGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (user && (isAuthGroup || root === undefined)) {
      router.replace(getRoleDashboardPath(user.role));
      return;
    }

    if (user && isProtectedGroup) {
      const expectedGroup = getRoleDashboardPath(user.role).split('/')[1];
      if (root !== expectedGroup) {
        router.replace(getRoleDashboardPath(user.role));
      }
      return;
    }

    if (!user && !isPublicRoute && !isAuthGroup && !isProtectedGroup) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, segments, user, router]);

  if (isLoading) {
    return <LoadingSpinner label="Restoring session" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme as never}>
          <AuthProvider>
            <StatusBar style="dark" />
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
              <RouteGuard />
            </View>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
