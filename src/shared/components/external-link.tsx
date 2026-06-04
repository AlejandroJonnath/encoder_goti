import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

// Sección: Este archivo crea un componente personalizado para abrir enlaces externos asegurándose de que en celulares nativos los enlaces se abran dentro de la aplicación y no mandando al usuario al navegador del teléfono

// Funciones: ExternalLink sirve como un botón o texto clickeable que al ser presionado abre una página web externa

// Definimos los tipos de datos que recibirá el componente omitiendo el href original para forzar uno propio
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

// Exportamos nuestro componente de enlace externo personalizado
export function ExternalLink({ href, ...rest }: Props) {
  // Retornamos el componente Link nativo de expo-router modificado
  return (
    <Link
      // Le decimos que por defecto intente abrir en una nueva pestaña (útil para web)
      target="_blank"
      // Le pasamos el resto de las propiedades como los estilos
      {...rest}
      // Le asignamos el destino del enlace
      href={href}
      // Sobrescribimos lo que pasa cuando el usuario hace clic o toca el enlace
      onPress={async (event) => {
        // Verificamos si no estamos corriendo en la web (o sea si estamos en iOS o Android nativo)
        if (process.env.EXPO_OS !== 'web') {
          // Prevenimos el comportamiento por defecto que sacaría al usuario de la app
          event.preventDefault();
          // Abrimos el navegador interno de la aplicación para que el usuario no pierda nuestra app de vista
          await openBrowserAsync(href, {
            // Le decimos que use el estilo de presentación automático del sistema
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}

// si quitas ExternalLink pasa que todos los enlaces a páginas web de afuera se abrirán usando el navegador normal del teléfono sacando a los usuarios de tu aplicación y dándoles una mala experiencia
