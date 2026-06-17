import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { useSessionAuth } from '@/features/auth/hooks/useSessionAuth';
import { AlertProvider } from '@/shared/context/AlertContext';
import { LogBox } from 'react-native';
import { supabase } from '@/shared/services/supabase';
import { CompleteProfileModal } from '@/shared/components/CompleteProfileModal';

LogBox.ignoreLogs([
  '[Reanimated] Property "transform"',
  'Property "transform" of AnimatedComponent',
]);

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useSessionAuth();
  const segments = useSegments();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // Cargar el rol y el nombre del usuario cuando se autentica
  useEffect(() => {
    if (!user) {
      setRole(null);
      setFullName(null);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);

    const loadProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        console.log('[RootLayout] fetched profile:', data);
        setRole(data?.role || 'client');
        setFullName(data?.full_name || null);
      } catch (err) {
        console.log('[RootLayout] profile fetch error:', err);
        setRole('client');
        setFullName(null);
      } finally {
        setRoleLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Redirigir según el estado de sesión y el rol
  useEffect(() => {
    if (loading || roleLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && role === 'admin') {
      // Los admins van siempre al panel administrativo
      if (inAuthGroup || inTabsGroup) {
        router.replace('/(admin)/dashboard' as any);
      }
    } else if (user && role === 'client') {
      // Los clientes van al panel de usuario
      if (inAuthGroup || inAdminGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, role, roleLoading, segments]);

  const needsFullName = !!user && !roleLoading && !fullName;

  return (
    <AlertProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />

        {user && (
          <CompleteProfileModal
            visible={needsFullName}
            userId={user.id}
            onCompleted={(newName) => setFullName(newName)}
          />
        )}
      </ThemeProvider>
    </AlertProvider>
  );
}
