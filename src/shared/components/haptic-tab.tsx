import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

// Sección: Este archivo crea un botón especial para la barra de navegación de abajo que produce una pequeña vibración (respuesta háptica) cuando el usuario lo toca en dispositivos iOS

// Funciones: HapticTab sirve para envolver los botones del menú de pestañas inferior y agregarles vibración táctil al presionarlos

// Exportamos el componente que recibe las propiedades normales de un botón de pestaña
export function HapticTab(props: BottomTabBarButtonProps) {
  // Retornamos un componente presioneable nativo
  return (
    <PlatformPressable
      // Le pasamos todas las propiedades originales
      {...props}
      // Interceptamos el evento de cuando el dedo apenas toca la pantalla
      onPressIn={(ev) => {
        // Verificamos si el dispositivo es un iPhone o iPad
        if (process.env.EXPO_OS === 'ios') {
          // Disparamos una pequeña vibración ligera usando el motor háptico de Apple
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        // Después de vibrar llamamos a la función original que iba a ocurrir de todos modos
        props.onPressIn?.(ev);
      }}
    />
  );
}

// si quitas HapticTab pasa que la aplicación perderá esa sensación de calidad premium al tocar los botones de abajo en iOS ya que dejarán de vibrar
