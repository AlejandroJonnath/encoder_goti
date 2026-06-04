import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/shared/hooks/use-theme-color';

// Sección: Este archivo provee una caja o contenedor inteligente que se pinta sola del color de fondo adecuado según el celular esté en modo oscuro o claro

// Funciones: ThemedView sirve como la base para agrupar elementos en la pantalla asegurando que el fondo sea blanco o negro sin que tengas que programarlo a mano

// Definimos los tipos extendiendo un View normal para aceptar nuestros colores forzados
export type ThemedViewProps = ViewProps & {
  // Color opcional para fijar si el modo es claro
  lightColor?: string;
  // Color opcional para fijar si el modo es oscuro
  darkColor?: string;
};

// Exportamos nuestro contenedor principal
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // Preguntamos a nuestro hook inteligente de qué color debe ser el fondo (background)
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // Retornamos la vista o contenedor nativo de React
  return <View 
    // Aplicamos primero el color de fondo calculado y luego agregamos cualquier estilo extra
    style={[{ backgroundColor }, style]} 
    // Le pasamos las demás propiedades como padding o márgenes
    {...otherProps} 
  />;
}

// si quitas ThemedView pasa que perderás la herramienta básica para agrupar tu contenido tus pantallas podrían quedar transparentes o con colores equivocados y no cambiarían con el modo nocturno
