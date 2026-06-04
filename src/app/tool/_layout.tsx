import { Stack } from 'expo-router';

// Sección: Define el diseño y la navegación para las pantallas de herramientas
// (Configura el stack navigator para que las pantallas dentro de la carpeta tool tengan un header y navegación correcta)

// Función ToolLayout: Renderiza el Stack navigator que envuelve a las herramientas
// (Proporciona el contexto de navegación para las pantallas anidadas y define opciones comunes como el título del header)
export default function ToolLayout() {
  return (
    <Stack>
      {/* Pantalla dinámica genérica para herramientas sin pantalla específica */}
      <Stack.Screen name="[id]" options={{ headerTitle: 'Herramienta PDF' }} />
      {/* Pantalla de resumen por IA */}
      <Stack.Screen name="ai" options={{ headerTitle: 'Resumen IA' }} />
      {/* Pantalla de compresión de PDF */}
      <Stack.Screen name="compress" options={{ headerTitle: 'Comprimir PDF' }} />
      {/* Pantalla de unión de PDFs */}
      <Stack.Screen name="merge" options={{ headerTitle: 'Unir PDFs' }} />
      {/* Pantalla de firma de PDF */}
      <Stack.Screen name="sign" options={{ headerTitle: 'Firmar PDF' }} />
      {/* Pantalla dinámica de conversión */}
      <Stack.Screen name="convert/[type]" options={{ headerTitle: 'Convertir PDF' }} />
    </Stack>
  );
}

// si quitas la función ToolLayout las pantallas dentro de la carpeta tool no tendrán un contexto de navegación y la aplicación podría fallar al intentar acceder a ellas
