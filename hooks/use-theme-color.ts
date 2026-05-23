import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Sección: Este archivo proporciona un hook para obtener los colores correctos de la aplicación dependiendo de si el usuario está en modo oscuro o modo claro

// Funciones: useThemeColor sirve para decidir qué color pintar en pantalla tomando en cuenta el modo actual del celular y los colores que hayamos definido en nuestro archivo de tema

// Definimos y exportamos la función que nos ayuda a escoger el color correcto
export function useThemeColor(
  // Recibimos propiedades opcionales por si queremos forzar un color específico para claro u oscuro desde donde llamemos la función
  props: { light?: string; dark?: string },
  // Recibimos el nombre del color que queremos buscar (tiene que existir dentro de nuestro objeto Colors tanto en claro como en oscuro)
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // Obtenemos el tema actual del dispositivo (claro u oscuro) usando nuestro propio hook y si falla por defecto usamos el claro
  const theme = useColorScheme() ?? 'light';
  // Revisamos si en las propiedades que le mandamos viene un color forzado para el tema actual
  const colorFromProps = props[theme];

  // Verificamos si existe ese color forzado que pasamos por las propiedades
  if (colorFromProps) {
    // Si existe lo devolvemos directamente (esto nos da prioridad para sobrescribir colores)
    return colorFromProps;
  // Si no pasamos ningún color manual en las propiedades
  } else {
    // Buscamos el color en nuestra paleta global de Colors usando el tema actual y el nombre del color
    return Colors[theme][colorName];
  }
}

// si quitas useThemeColor pasa que todos tus componentes ya no sabrán cómo adaptarse automáticamente entre modo claro y oscuro y la app se verá rara o con colores equivocados
