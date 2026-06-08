import { Platform } from 'react-native';

// Sección: Este archivo define toda la paleta de colores globales y las tipografías que se usarán en toda la aplicación dependiendo de la plataforma

// Funciones: No hay funciones propias, solo se exportan objetos constantes que guardan la configuración de estilos

// Definimos el color principal que destacará en el modo claro (un rosa/morado neón vibrante para dar un toque moderno)
const tintColorLight = '#D946EF';
// Definimos el color principal que destacará en el modo oscuro (cian neón resplandeciente)
const tintColorDark = '#22D3EE';

// Exportamos nuestro objeto de colores para poder usarlo en cualquier pantalla
export const Colors = {
  // Configuramos la paleta para cuando el celular esté en modo claro
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    // Colores extra para fondos inmersivos
    surface: '#FFFFFF',
    border: '#E2E8F0',
  },
  // Configuramos la paleta para cuando el celular esté en modo oscuro (o en este caso, el diseño por defecto que queremos forzar si es posible)
  dark: {
    // Texto blanco puro y gris muy claro para legibilidad
    text: '#F8FAFC',
    // Fondo oscuro profundo (Midnight blue / Slate)
    background: '#020617',
    // Detalles principales en cian neón
    tint: tintColorDark,
    // Iconos apagados
    icon: '#64748B',
    tabIconDefault: '#475569',
    tabIconSelected: tintColorDark,
    // Superficies para tarjetas (Dark Glass)
    surface: '#0F172A',
    border: '#1E293B',
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
