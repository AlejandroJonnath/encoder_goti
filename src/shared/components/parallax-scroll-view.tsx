import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/shared/components/themed-view';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

// Sección: Este archivo crea una pantalla con efecto parallax donde la imagen principal de arriba se mueve a una velocidad distinta que el resto del contenido cuando deslizas el dedo dando una sensación de profundidad 3D

// Funciones: ParallaxScrollView sirve como un contenedor envolvente para pantallas enteras que necesitan una imagen de portada arriba y contenido desplazable abajo

// Altura constante de la cabecera con la imagen
const HEADER_HEIGHT = 250;

// Definimos las propiedades que necesita este componente para funcionar
type Props = PropsWithChildren<{
  // La imagen o componente que irá en la parte superior
  headerImage: ReactElement;
  // Los colores de fondo de la cabecera tanto para el modo claro como el oscuro
  headerBackgroundColor: { dark: string; light: string };
}>;

// Exportamos el componente por defecto
export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  // Obtenemos el color de fondo general de la app usando nuestro hook de tema
  const backgroundColor = useThemeColor({}, 'background');
  // Obtenemos el esquema de color actual para saber qué fondo pintar en la cabecera
  const colorScheme = useColorScheme() ?? 'light';
  // Creamos una referencia animada hacia el componente que hace scroll
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  // Sacamos el valor exacto de cuánto ha bajado el usuario en la pantalla leyendo la referencia
  const scrollOffset = useScrollOffset(scrollRef);
  
  // Creamos unos estilos dinámicos que se van a calcular a 60 cuadros por segundo basados en cuánto bajaste
  const headerAnimatedStyle = useAnimatedStyle(() => {
    // Retornamos la transformación visual
    return {
      transform: [
        {
          // Movemos la imagen hacia arriba o hacia abajo
          translateY: interpolate(
            // Tomamos la posición actual del scroll
            scrollOffset.value,
            // Los rangos de entrada (si el usuario estira hacia arriba, si está en cero, o si bajó toda la altura)
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            // Los rangos de salida de movimiento (cómo va a reaccionar la imagen)
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          // Escala (para hacer un efecto de rebote si el usuario estira la pantalla más allá del límite superior)
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  // Retornamos el contenedor con scroll animado
  return (
    <Animated.ScrollView
      // Le enganchamos nuestra referencia
      ref={scrollRef}
      // Color de fondo y le decimos que ocupe toda la pantalla
      style={{ backgroundColor, flex: 1 }}
      // Le decimos que registre los eventos de scroll muy rápido (cada 16 milisegundos para mayor fluidez)
      scrollEventThrottle={16}>
      <Animated.View
        // Aplicamos estilos fijos más los colores dinámicos más las animaciones de parallax
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ]}>
        {/* Renderizamos la imagen o ícono que nos hayan pasado */}
        {headerImage}
      </Animated.View>
      {/* Contenedor temático para todo el contenido de la pantalla */}
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

// Creamos la hoja de estilos estáticos
const styles = StyleSheet.create({
  // Contenedor general que abarca todo
  container: {
    flex: 1,
  },
  // La cabecera superior
  header: {
    // Alto fijo
    height: HEADER_HEIGHT,
    // Escondemos cualquier cosa de la imagen que se desborde del límite
    overflow: 'hidden',
  },
  // Contenido de la página
  content: {
    flex: 1,
    // Espaciado interno grueso para que no se pegue a los bordes
    padding: 32,
    // Espacio entre elementos hijos
    gap: 16,
    // Esconder desbordamientos
    overflow: 'hidden',
  },
});

// si quitas ParallaxScrollView pasa que la mayoría de tus pantallas que usan este diseño dejarán de funcionar se romperá la estructura y perderás esa animación tan bonita de desplazamiento
