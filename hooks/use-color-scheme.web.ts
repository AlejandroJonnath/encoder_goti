import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Sección: Este archivo maneja la detección del esquema de color (modo claro o oscuro) específicamente para la versión web de la aplicación asegurando que la renderización estática funcione correctamente

// Funciones: useColorScheme sirve para obtener el modo de color actual en la web esperando a que la página cargue por completo para evitar parpadeos visuales

// Exportamos la función que usaremos en toda la app cuando esté en web
export function useColorScheme() {
  // Creamos un estado para saber si la página web ya cargó completamente en el navegador (hidratación)
  const [hasHydrated, setHasHydrated] = useState(false);

  // Usamos useEffect para que justo después de que el componente cargue en la pantalla
  useEffect(() => {
    // Cambiamos el estado a verdadero (indicando que ya cargó la página en el navegador del cliente)
    setHasHydrated(true);
  // Los corchetes vacíos indican que esto solo se ejecuta una vez al montar el componente
  }, []);

  // Obtenemos el esquema de color nativo que nos da react-native (claro u oscuro)
  const colorScheme = useRNColorScheme();

  // Comprobamos si la aplicación ya se cargó en el navegador web
  if (hasHydrated) {
    // Si ya cargó retornamos el color que tiene el sistema del usuario (el real)
    return colorScheme;
  }

  // Si todavía se está renderizando en el servidor (SSR) por defecto devolvemos el modo claro para no causar errores de diseño
  return 'light';
}

// si quitas useColorScheme pasa que la versión web de la app podría tener errores de hidratación al cargar y los colores podrían parpadear o mostrarse mal al principio
