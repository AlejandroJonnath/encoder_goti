import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/shared/hooks/use-theme-color';

// Sección: Este archivo proporciona un componente de texto inteligente que cambia su color automáticamente dependiendo de si el celular está en modo oscuro o claro y te permite usar diferentes estilos predefinidos (como título subtítulo etc)

// Funciones: ThemedText sirve para escribir textos en la pantalla que se adaptan a los colores del tema sin que tengas que programar la lógica del color cada vez

// Definimos las propiedades personalizadas para nuestro componente combinándolas con las normales que tiene cualquier texto de React Native
export type ThemedTextProps = TextProps & {
  // Opcionalmente podemos forzar el color para cuando esté en modo claro
  lightColor?: string;
  // Opcionalmente podemos forzar el color para el modo oscuro
  darkColor?: string;
  // El tipo de texto que define el tamaño y la importancia (por defecto será default)
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

// Exportamos nuestro componente de texto
export function ThemedText({
  // Extraemos los estilos extra que le queramos añadir en el momento
  style,
  // Extraemos los colores forzados si los hay
  lightColor,
  darkColor,
  // Le damos el valor 'default' si no nos especificaron qué tipo de texto es
  type = 'default',
  // Agarramos todas las demás propiedades normales de texto (como onPress numberOfLines etc)
  ...rest
}: ThemedTextProps) {
  // Calculamos el color correcto que debe tener el texto consultando a nuestro hook inteligente
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Retornamos el elemento de texto nativo con esteroides
  return (
    <Text
      // Combinamos varios estilos en un arreglo
      style={[
        // Primero aplicamos el color calculado para modo oscuro o claro
        { color },
        // Si el tipo es 'default' le aplicamos los estilos normales
        type === 'default' ? styles.default : undefined,
        // Si es un título le hacemos la letra grande y gordita
        type === 'title' ? styles.title : undefined,
        // Si es semibold lo hacemos negrita pero sin llegar a ser título
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        // Si es un subtítulo le ponemos el formato correspondiente
        type === 'subtitle' ? styles.subtitle : undefined,
        // Si es un enlace lo ponemos azul
        type === 'link' ? styles.link : undefined,
        // Al final agregamos cualquier estilo extra que nos hayan mandado para sobrescribir
        style,
      ]}
      // Y le inyectamos todas las demás propiedades normales
      {...rest}
    />
  );
}

// Creamos los estilos estáticos
const styles = StyleSheet.create({
  // Estilo de párrafo normal
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Estilo de texto remarcado
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  // Estilos gigantes para los títulos principales
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  // Estilo para títulos secundarios
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Estilo para enlaces
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});

// si quitas ThemedText pasa que todos los textos de tu aplicación dejarán de verse en pantalla se romperán los diseños y tendrás que cambiar todo a textos normales que no responden al modo oscuro
