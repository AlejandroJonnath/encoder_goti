import { useColorScheme as useRNColorScheme } from 'react-native';

// Sección: Este archivo sirve para exportar la funcionalidad de detectar el modo de color nativo del dispositivo móvil

// Funciones: exportamos useColorScheme que detecta si el celular está en modo oscuro o claro

// Exportamos la función con el nombre original (para mantener la compatibilidad con el resto de la app)
export const useColorScheme = useRNColorScheme;

// si quitas useColorScheme pasa que la aplicación perderá la capacidad de saber si el celular del usuario está en modo oscuro o claro
