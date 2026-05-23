import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Sección: Este archivo crea un componente desplegable parecido a un acordeón donde tocas un título y se muestra u oculta el contenido de abajo

// Funciones: Collapsible sirve para agrupar contenido largo en secciones que se pueden contraer o expandir para no llenar la pantalla de texto innecesario

// Exportamos el componente recibiendo los elementos hijos y el texto del título principal
export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  // Creamos un estado interno para saber si la caja está abierta o cerrada (por defecto empieza cerrada)
  const [isOpen, setIsOpen] = useState(false);
  // Obtenemos el tema para pintar los íconos de color negro o blanco según corresponda
  const theme = useColorScheme() ?? 'light';

  // Retornamos nuestro contenedor inteligente que reacciona a temas
  return (
    <ThemedView>
      <TouchableOpacity
        // Aplicamos estilos de caja flexible
        style={styles.heading}
        // Cuando alguien hace clic en la cabecera invertimos el estado (si estaba abierto se cierra y viceversa)
        onPress={() => setIsOpen((value) => !value)}
        // Hacemos que el botón se transparente solo un poco al tocarlo
        activeOpacity={0.8}>
        <IconSymbol
          // Usamos el ícono de la flechita que apunta a la derecha
          name="chevron.right"
          // Tamaño de la flecha
          size={18}
          // Grosor del trazo
          weight="medium"
          // Color de la flecha dependiendo del modo
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          // Si está abierto giramos la flecha 90 grados para que apunte hacia abajo indicando expansión
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        {/* Mostramos el texto del título en negritas */}
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {/* Usamos una condición corta: si está abierto entonces renderizamos los hijos dentro de su contenedor */}
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

// Estilos locales de la cabecera y el contenido
const styles = StyleSheet.create({
  // Cabecera clickeable
  heading: {
    // Acomodamos el ícono y el título en fila horizontal
    flexDirection: 'row',
    // Centramos ambos elementos verticalmente
    alignItems: 'center',
    // Les damos un poco de separación
    gap: 6,
  },
  // Contenido expandido
  content: {
    // Un pequeño margen de separación con el título
    marginTop: 6,
    // Lo empujamos un poco a la derecha para que quede alineado bajo el título y no bajo la flecha
    marginLeft: 24,
  },
});

// si quitas Collapsible pasa que tus menús expandibles o de acordeón desaparecerán y no podrás ocultar información larga en cajas pequeñas
