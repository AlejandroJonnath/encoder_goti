import { Stack } from 'expo-router';

// Sección: Este archivo agrupa y organiza todas las pantallas relacionadas con la autenticación (registro e inicio de sesión) para que compartan reglas y estilos

// Funciones: AuthLayout sirve como una carpeta inteligente que le dice a las pantallas de adentro cómo deben mostrarse (en este caso sin encabezado)

// Exportamos el contenedor de la zona de acceso
export default function AuthLayout() {
  // Retornamos una pila de pantallas
  return (
    // Le quitamos la barra de navegación de arriba a todas las pantallas que vivan aquí
    <Stack screenOptions={{ headerShown: false }}>
      {/* Registramos la pantalla de login */}
      <Stack.Screen name="login" />
      {/* Registramos la pantalla de crear cuenta */}
      <Stack.Screen name="register" />
    </Stack>
  );
}

// si quitas AuthLayout pasa que tus pantallas de login y registro perderán su estructura quedarán huérfanas en el enrutador y podrían aparecer con la barra superior de navegación molesta
