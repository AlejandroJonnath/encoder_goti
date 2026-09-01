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
import { TermsAndConditionsModal } from '@/shared/components/TermsAndConditionsModal';

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
  // Si el usuario ya aceptó los términos: true = sí, false = no, null = cargando
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);
  // Si la verificación de términos todavía está en curso
  const [termsLoading, setTermsLoading] = useState(false);

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

  // Verificar si el usuario ya aceptó los términos y condiciones (persistido en su cuenta de Supabase)
  useEffect(() => {
    if (!user) {
      setTermsAccepted(null);
      return;
    }
    setTermsLoading(true);
    const checkTerms = async () => {
      try {
        // 1) Leemos desde los user_metadata de Supabase (persiste entre dispositivos y sesiones)
        const { data } = await supabase.auth.getUser();
        const acceptedInAccount = data?.user?.user_metadata?.accepted_terms === true;
        setTermsAccepted(acceptedInAccount);
      } catch (err) {
        console.warn('[RootLayout] error al leer términos de cuenta:', err);
        // Si falla la lectura, mostramos el modal por seguridad
        setTermsAccepted(false);
      } finally {
        setTermsLoading(false);
      }
    };
    checkTerms();
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

  // FUNCION: handleAcceptTerms
  // Guarda la aceptación en los user_metadata de Supabase para que persista en todos los dispositivos
  const handleAcceptTerms = async () => {
    if (!user) return;
    try {
      // Actualizamos los metadatos del usuario en Supabase — esto persiste por cuenta, no por dispositivo
      const { error } = await supabase.auth.updateUser({
        data: { accepted_terms: true, accepted_terms_at: new Date().toISOString() },
      });
      if (error) throw error;
      setTermsAccepted(true);
    } catch (err) {
      console.error('[RootLayout] error al guardar aceptación de términos:', err);
    }
  };

  // FUNCION: handleRejectTerms
  // Cierra la sesión del usuario y redirige al login si rechaza los términos
  const handleRejectTerms = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[RootLayout] error al hacer signOut por rechazo de términos:', err);
    }
    // El onAuthStateChange de useSessionAuth detecta el signOut y redirige al login automáticamente
  };

  // El modal de términos debe mostrarse cuando hay usuario, terminó de cargar, y no ha aceptado aún
  const needsTermsAcceptance = !!user && !loading && !roleLoading && !termsLoading && termsAccepted === false;

  const needsFullName = !!user && !roleLoading && !fullName && termsAccepted === true;

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

        {/* Modal de Términos y Condiciones: aparece solo si el usuario no los ha aceptado aún */}
        {user && (
          <TermsAndConditionsModal
            visible={needsTermsAcceptance}
            onAccept={handleAcceptTerms}
            onReject={handleRejectTerms}
          />
        )}

        {/* Modal de Completar Perfil: solo aparece si ya aceptó los términos y no tiene nombre */}
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
