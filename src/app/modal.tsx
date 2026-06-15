import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';

// Sección: Este archivo contiene una pantalla modal de ejemplo que se abre flotando por encima de la aplicación sin reemplazar la pantalla anterior

// Funciones: ModalScreen sirve para mostrar información adicional rápida o alertas sin que el usuario pierda su contexto actual de navegación

// Exportamos nuestro componente de pantalla modal
export default function ModalScreen() {
  // Retornamos nuestro contenedor que soporta temas oscuros y claros
  return (
    <ThemedView style={styles.container}>
      {/* Título del modal */}
      <ThemedText type="title">This is a modal</ThemedText>
      {/* Enlace para cerrar la ventana modal y volver a donde estábamos */}
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

// Estilos de la ventana flotante
const styles = StyleSheet.create({
  // Contenedor centrado en toda la pantalla
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  // Separación para el botón de regresar
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});

// si quitas ModalScreen pasa que no tendrás un molde para mostrar ventanas flotantes y si otra pantalla intenta llamar a modal la app dará error de ruta no encontrada
