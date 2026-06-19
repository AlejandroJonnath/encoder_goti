// SECCION DE IMPORTACIONES
// Importamos React junto con sus hooks useState y useEffect para poder manejar variables reactivas
import { useState } from 'react';
// Importamos nuestra conexión configurada de Supabase para poder hacer las peticiones de inicio de sesión a la base de datos
import { supabase } from '@/shared/services/supabase';
// Importamos el WebBrowser de Expo que nos permite abrir una pestañita del navegador dentro de la app para loguearnos con Google
import * as WebBrowser from 'expo-web-browser';
// Importamos makeRedirectUri para poder decirle a Google a qué dirección debe regresar el usuario después de iniciar sesión
import { makeRedirectUri } from 'expo-auth-session';
// Importamos nuestro gancho de alertas personalizadas para poder mostrar ventanitas de error o éxito bien diseñadas
import { useCustomAlert } from '@/shared/context/AlertContext';

// Bloque de configuración inicial del navegador
// Ejecutamos esta función mágica de WebBrowser en la raíz del archivo para que la app pueda atrapar la respuesta de Google cuando regrese del navegador
WebBrowser.maybeCompleteAuthSession();

// FUNCION: useLogin
// Este gancho extrae toda la lógica de autenticación para mantener la pantalla limpia
export function useLogin() {
  // Bloque de estados locales
  // Creamos un estado para guardar lo que el usuario va escribiendo en el campo del correo electrónico
  const [email, setEmail] = useState('');
  // Creamos un estado para guardar lo que el usuario escribe en el campo de la contraseña de forma oculta
  const [password, setPassword] = useState('');
  // Creamos un estado booleano para saber si estamos enviando los datos a Supabase y así mostrar la ruedita de carga
  const [loading, setLoading] = useState(false);
  // Extraemos la función showAlert de nuestro contexto para poder disparar los mensajes flotantes en pantalla
  const { showAlert } = useCustomAlert();

  // FUNCION: signInWithEmail
  // Esta función es la encargada de agarrar el correo y la clave y enviarlos a los servidores de Supabase para intentar entrar
  async function signInWithEmail() {
    // Primero verificamos que el usuario no se haya querido pasar de listo dejando los campos en blanco
    if (!email || !password) {
      // Si hay algo vacío le mostramos una alerta amarilla pidiéndole que por favor llene sus datos
      showAlert('Campos vacíos', 'Por favor ingresa tu correo y contraseña.', 'warning');
      // Cortamos la ejecución de la función para que no intente mandar datos vacíos al servidor
      return;
    }

    // Encendemos la bandera de carga para que el botón muestre la ruedita y el usuario sepa que estamos trabajando
    setLoading(true);

    // Bloque de petición a Supabase
    // Le pedimos a Supabase que inicie sesión usando la contraseña y el correo, pero le quitamos los espacios en blanco al inicio o al final del correo por si acaso
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    // Revisamos si Supabase nos devolvió algún error en el proceso
    if (error) {
      // Analizamos el mensaje de error para ver si dice algo sobre que el email no está confirmado
      if (error.message.toLowerCase().includes('email not confirmed')) {
        // Si es así le mostramos una alerta larguísima explicándole que es una cuenta vieja y que debe borrarla desde el panel de control
        showAlert(
          'Cuenta sin confirmar',
          'Esta cuenta fue creada antes de que se desactivara la confirmación de email.\n\nPor favor elimínala desde Supabase → Authentication → Users y regístrate de nuevo.',
          'warning'
        );
      // Si el error dice que las credenciales son inválidas significa que se equivocó de clave o correo
      } else if (error.message.toLowerCase().includes('invalid login credentials')) {
        // Le mandamos una alerta roja clásica de contraseña incorrecta
        showAlert('Credenciales incorrectas', 'El correo o la contraseña no son correctos.', 'error');
      // Si es cualquier otro tipo de error raro que no esperábamos
      } else {
        // Simplemente le mostramos el texto crudo del error en una alerta roja
        showAlert('Error', error.message, 'error');
      }
    }
    // Pase lo que pase apagamos la ruedita de carga para devolverle el control al usuario
    setLoading(false);
  }

  // FUNCION: signInWithGoogle
  // Esta es la función gigante que se encarga de abrir la pestaña del navegador para que el usuario inicie sesión con su cuenta de Google mediante OAuth
  async function signInWithGoogle() {
    // Prendemos la ruedita de carga porque este proceso puede tardar un poco mientras carga la web
    setLoading(true);
    // Envolvemos todo en un try porque tratar con el navegador externo y redirecciones es peligroso y puede fallar
    try {
      // Armamos la dirección de retorno especial de la app usando el esquema encodergoti para que el celular sepa a qué app volver
      const redirectUri = makeRedirectUri({ scheme: 'encodergoti' });
      // Le pedimos a Supabase la URL de Google para iniciar sesión con OAuth pasándole a dónde debe regresar
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Le enviamos el redirectUri que acabamos de armar
          redirectTo: redirectUri,
          // Le decimos a Supabase que no intente redirigir por sí solo porque nosotros usaremos el WebBrowser de Expo manualmente
          skipBrowserRedirect: true,
        },
      });

      // Si Supabase falla al darnos la URL lanzamos el error para que caiga en el catch
      if (error) throw error;

      // Verificamos que realmente hayamos recibido un enlace válido para abrir
      if (data?.url) {
        // Abrimos la pestañita segura del navegador con la página de Google y le decimos que espere a regresar a nuestro redirectUri
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

        // Cuando la pestaña se cierra revisamos si fue un éxito y si realmente trajo una URL de respuesta
        if (res.type === 'success' && res.url) {
          // Como Supabase tiene la maña de devolver los tokens en el fragmento con hashtag en lugar de parámetros normales de URL guardamos esa URL completa
          const returnUrl = res.url;
          // Partimos la URL en dos pedazos para agarrar todo lo que está después del hashtag o después del signo de interrogación por si acaso
          const fragmentString = returnUrl.includes('#') ? returnUrl.split('#')[1] : returnUrl.split('?')[1];

          // Si logramos extraer la cadenita de parámetros
          if (fragmentString) {
            // Usamos la herramienta nativa URLSearchParams para poder leer los valores de esa cadenita más fácil
            const params = new URLSearchParams(fragmentString);
            // Sacamos el token principal de acceso que nos dio Google
            const access_token = params.get('access_token');
            // Sacamos el token de refresco por si el principal caduca poder pedir otro sin molestar al usuario
            const refresh_token = params.get('refresh_token');

            // Si logramos rescatar el access token de la marea de letras
            if (access_token) {
              // Le inyectamos los tokens a la fuerza a la sesión de Supabase para decirle oye este usuario ya está logueado confía en mí
              const { error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token: refresh_token ?? '',
              });
              // Si Supabase rechaza los tokens lanzamos un error
              if (sessionError) throw sessionError;
            // Si por alguna razón la URL no traía el token explícito en el texto
            } else {
              // Le pedimos a Supabase que intente refrescar la sesión manualmente usando las cookies mágicas
              await supabase.auth.refreshSession();
            }
          }
        }
      }
    // Si algo sale mal en toda esta aventura del navegador
    } catch (error: any) {
      // Mostramos una alerta roja avisándole que Google falló mostrándole el mensaje técnico
      showAlert('Error', error.message || 'Error con Google Auth', 'error');
    // Finalmente aseguramos que la ruedita de carga se apague sí o sí para no dejar la app colgada
    } finally {
      setLoading(false);
    }
  }

  // Devolvemos todos los estados y funciones para que la vista pueda consumirlos
  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    signInWithEmail,
    signInWithGoogle
  };
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la constante supabase.auth.signInWithPassword? pasa que el botón de entrar funcionará visualmente pero nunca mandará los datos a la base de datos dejando al usuario en la pantalla de inicio eternamente
// para solucionarlo debes volver a implementar la llamada a la base de datos pasando el email y la contraseña capturados
// ¿qué pasa si quitas la función signInWithGoogle completa? pasa que el botón de continuar con Google simplemente dejará de hacer clics o lanzará un error interno impidiendo que la gente se registre rápido con su cuenta de gmail
// para solucionarlo restaura todo el bloque del WebBrowser con su manejo de tokens y redirectUri
// ¿qué pasa si borras la llamada WebBrowser.maybeCompleteAuthSession() de la raíz? pasa que la aplicación se quedará atascada en el navegador después de que el usuario meta su clave en Google y nunca sabrá cómo regresar a la app nativa
// para solucionarlo simplemente pon esa línea suelta en el encabezado del archivo para que el listener se quede activo escuchando la redirección
