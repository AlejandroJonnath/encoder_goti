import { Platform } from 'react-native';

// Sección: Este archivo define toda la paleta de colores globales y las tipografías que se usarán en toda la aplicación dependiendo de la plataforma

// Funciones: No hay funciones propias, solo se exportan objetos constantes que guardan la configuración de estilos

// Definimos el color principal que destacará en el modo claro (un tono azul)
const tintColorLight = '#0a7ea4';
// Definimos el color principal que destacará en el modo oscuro (color blanco puro)
const tintColorDark = '#fff';

// Exportamos nuestro objeto de colores para poder usarlo en cualquier pantalla
export const Colors = {
  // Configuramos la paleta para cuando el celular esté en modo claro
  light: {
    // Color principal para los textos (un gris muy oscuro)
    text: '#11181C',
    // Color para el fondo de las pantallas (blanco puro)
    background: '#fff',
    // El color de destaque o botones principales
    tint: tintColorLight,
    // Color para los íconos inactivos o secundarios
    icon: '#687076',
    // Color para los íconos de la barra de navegación que no están seleccionados
    tabIconDefault: '#687076',
    // Color para el ícono de la barra de navegación que sí está seleccionado
    tabIconSelected: tintColorLight,
  },
  // Configuramos la paleta para cuando el celular esté en modo oscuro
  dark: {
    // Color principal para los textos (un gris muy clarito casi blanco)
    text: '#ECEDEE',
    // Color para el fondo de las pantallas (un negro o gris súper oscuro)
    background: '#151718',
    // El color de destaque o botones principales para el modo oscuro
    tint: tintColorDark,
    // Color para los íconos inactivos o secundarios
    icon: '#9BA1A6',
    // Color para los íconos de la barra de navegación que no están seleccionados
    tabIconDefault: '#9BA1A6',
    // Color para el ícono de la barra de navegación que sí está seleccionado
    tabIconSelected: tintColorDark,
  },
};

// Exportamos las fuentes tipográficas dependiendo del sistema operativo donde esté corriendo la app
export const Fonts = Platform.select({
  // Si estamos en un iPhone o iPad (iOS) usamos estas fuentes nativas de Apple
  ios: {
    // Fuente sin serifas por defecto del sistema
    sans: 'system-ui',
    // Fuente con serifas del sistema
    serif: 'ui-serif',
    // Fuente redondeada del sistema
    rounded: 'ui-rounded',
    // Fuente monoespaciada para código
    mono: 'ui-monospace',
  },
  // Si estamos en Android o cualquier otro dispositivo genérico
  default: {
    // Fuente normal del sistema
    sans: 'normal',
    // Fuente con serifas
    serif: 'serif',
    // Fuente redondeada (en android agarra la normal)
    rounded: 'normal',
    // Fuente monoespaciada
    mono: 'monospace',
  },
  // Si la app se abre en un navegador web
  web: {
    // Lista de fuentes seguras para web intentando usar las del sistema operativo primero
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    // Lista de fuentes con serifas típicas de web
    serif: "Georgia, 'Times New Roman', serif",
    // Lista de fuentes redondeadas o amigables
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    // Fuentes monoespaciadas para la web
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// si quitas Colors pasa que la aplicación perderá todo su diseño de colores y se romperán los componentes que dependen de esta paleta visual
// si quitas Fonts pasa que no podrás aplicar tipografías consistentes según cada sistema operativo y los textos se verán diferentes a lo planeado
