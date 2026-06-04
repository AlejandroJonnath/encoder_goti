import Animated from 'react-native-reanimated';

// Sección: Este archivo contiene un pequeño componente de animación para mostrar una mano saludando que se mueve de un lado a otro repetidas veces usando la API más simple de reanimated

// Funciones: HelloWave sirve para renderizar el emoji de la mano y hacer que ejecute una animación tipo CSS de saludo

// Exportamos el componente del saludo animado
export function HelloWave() {
  // Retornamos un componente de texto animado
  return (
    <Animated.Text
      // Le aplicamos estilos directamente incluyendo la animación
      style={{
        // Tamaño del emoji
        fontSize: 28,
        // Altura de la línea
        lineHeight: 32,
        // Un pequeño margen negativo para ajustarlo visualmente
        marginTop: -6,
        // Definimos la animación directamente (algo parecido a keyframes en CSS)
        animationName: {
          // A la mitad del tiempo de la animación rotará 25 grados
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        // Indicamos que esta animación de saludo se va a repetir 4 veces
        animationIterationCount: 4,
        // Cada movimiento tomará 300 milisegundos en completarse
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}

// si quitas HelloWave pasa que ya no tendrás ese lindo saludo animado en la pantalla de inicio y la app se verá un poco más aburrida
