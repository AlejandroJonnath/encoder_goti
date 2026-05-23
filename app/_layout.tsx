import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';

// Sección: Este archivo es el componente principal o enrutador raíz de toda la aplicación donde se decide qué pantallas mostrar y se protege el acceso dependiendo de si el usuario inició sesión o no

// Funciones: RootLayout sirve como contenedor maestro para configurar los temas oscuro/claro y aplicar la lógica de redirección automática cuando detecta cambios en la sesión del usuario

// Configuramos la pestaña predeterminada para que el sistema sepa dónde arrancar
export const unstable_settings = {
  anchor: '(tabs)',
};

// Exportamos nuestra estructura principal
export default function RootLayout() {
  // Obtenemos si el sistema está en modo claro u oscuro
  const colorScheme = useColorScheme();
  // Sacamos los datos de sesión y el estado de carga desde nuestro manejador de autenticación
  const { user, loading } = useAuth();
  // Obtenemos en qué ruta exacta nos encontramos actualmente
  const segments = useSegments();
  // Obtenemos el objeto para poder viajar entre pantallas
  const router = useRouter();

  // Escuchamos los cambios en la sesión para saber si debemos echar o dejar pasar al usuario
  useEffect(() => {
    // Si todavía estamos cargando la sesión no hacemos nada y esperamos
    if (loading) return;

    // Verificamos si estamos metidos dentro de la carpeta auth (las pantallas de login o registro)
    const inAuthGroup = segments[0] === '(auth)';

    // Si nadie inició sesión y además intentan entrar a otra parte que no sea auth
    if (!user && !inAuthGroup) {
      // Redirigir a login si no hay usuario y no estamos en auth
      router.replace('/(auth)/login');
    // Si ya iniciaron sesión y de todos modos intentan entrar a login o registro
    } else if (user && inAuthGroup) {
      // Redirigir a la app principal si hay usuario pero estamos en auth
      router.replace('/(tabs)');
    }
  // Se ejecuta cada vez que estos valores cambien
  }, [user, loading, segments]);

  // Retornamos la estructura visual del cascarón de la app
  return (
    // Aplicamos el tema visual para que todo herede esos colores por defecto
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Ocultamos las cabeceras nativas porque nosotros diseñaremos las nuestras */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Declaramos el grupo de pestañas principales */}
        <Stack.Screen name="(tabs)" />
        {/* Declaramos el grupo de pantallas de registro e inicio de sesión */}
        <Stack.Screen name="(auth)" />
        {/* Declaramos una pantalla modal por si necesitamos mostrar ventanitas emergentes */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      {/* Ajustamos la barra de arriba del celular (donde está la batería) para que combine con el tema */}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// si quitas RootLayout pasa que tu aplicación dejará de arrancar por completo perderá el enrutamiento y cualquier persona podrá acceder a las pantallas protegidas sin haber iniciado sesión
