// SECCION DE IMPORTACIONES
// Importamos React y el hook useState para controlar lo que el usuario escribe en las cajitas de texto
import { useState } from 'react';
// Traemos nuestra conexión maestra de Supabase para poder registrar a los usuarios nuevos en la base de datos
import { supabase } from '@/shared/services/supabase';
// Importamos herramientas de navegación de expo-router para poder mandar al usuario a la pantalla de login cuando termine
import { useRouter } from 'expo-router';
// Importamos WebBrowser para poder abrir la ventanita mágica de Google donde la gente mete su contraseña
import * as WebBrowser from 'expo-web-browser';
// Importamos esta utilidad para crear el caminito de regreso desde Google hacia nuestra aplicación
import { makeRedirectUri } from 'expo-auth-session';
// Importamos el gancho de alertas para avisarle al usuario si la riega llenando el formulario o si todo sale bien
import { useCustomAlert } from '@/shared/context/AlertContext';

// Bloque de configuración del navegador
// Lanzamos esta función para que si el usuario regresa de Google la aplicación sepa cómo recibirlo y cerrar la pestaña
WebBrowser.maybeCompleteAuthSession();

// FUNCION: useRegister
// Este gancho abstrae todo el embrollo del estado y la comunicación con el servidor
export function useRegister() {
  // Bloque de inicialización
  // Sacamos el router para poder cambiar de pantalla por código cuando el registro sea exitoso
  const router = useRouter();
  // Estado para guardar el nombre real de la persona
  const [fullName, setFullName] = useState('');
  // Estado para ir guardando el correo que teclea el usuario
  const [email, setEmail] = useState('');
  // Estado para la contraseña secreta
  const [password, setPassword] = useState('');
  // Estado para mostrar la ruedita morada de carga cuando estamos enviando cosas al servidor
  const [loading, setLoading] = useState(false);
  // Sacamos la función para mostrar ventanitas de alerta bonitas
  const { showAlert } = useCustomAlert();

  // FUNCION: signUpWithEmail
  // Esta es la rutina principal que se ejecuta cuando tocan el botón de registrarse de forma manual
  async function signUpWithEmail() {
    // Le quitamos los espacios en blanco inútiles al nombre por si el usuario tecleó de más
    const trimmedName = fullName.trim();
    // Verificamos que el flojo no haya dejado ningún campo vacío
    if (!trimmedName || !email || !password) {
      // Le mandamos un regaño amarillo para que llene todo
      showAlert('Campos vacíos', 'Por favor completa todos los campos.', 'warning');
      return;
    }
    // Hacemos una prueba estricta para que el nombre empiece con una letra y no con números o símbolos raros
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmedName)) {
      // Le avisamos que su nombre parece de robot y debe corregirlo
      showAlert('Nombre inválido', 'El nombre debe empezar con una letra.', 'warning');
      return;
    }
    // Revisamos que la contraseña no sea algo ridículamente fácil como 123
    if (password.length < 6) {
      // Le exigimos un mínimo de 6 letras o números
      showAlert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }

    // Prendemos la ruedita para decirle aguanta estamos trabajando
    setLoading(true);
    // Envolvemos todo en un try catch porque comunicarse con internet siempre es un deporte de riesgo
    try {
      // Paso 1: Validar nombre en la base de datos
      // Le preguntamos a la tabla de perfiles de Supabase si ya existe alguien con este exacto nombre para evitar clones
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('full_name', trimmedName)
        .maybeSingle();

      // Si la consulta falla y la base de datos explota lanzamos el error
      if (checkError) throw checkError;

      // Si encontramos a alguien devolvemos al usuario porque el nombre ya está agarrado
      if (existingUser) {
        // Alerta avisándole que sea más original con su nombre
        showAlert('Nombre duplicado', 'Ese nombre de usuario ya está en uso.', 'warning');
        // Apagamos la ruedita porque hasta aquí llegó el intento
        setLoading(false);
        return;
      }

      // Paso 2: Crear la cuenta real
      // Mandamos el correo y contraseña al sistema de autenticación de Supabase pasándole el nombre en la metadata
      const { error: signUpError } = await supabase.auth.signUp({
        // Aseguramos que el correo no tenga espacios fantasmas
        email: email.trim(),
        password: password,
        // Aquí le inyectamos los datos extras al usuario nuevo
        options: {
          data: {
            full_name: trimmedName,
          }
        }
      });

      // Si el registro falla por algo (como un correo falso) lanzamos la bomba
      if (signUpError) throw signUpError;

      // Paso 3: Intentar login automático
      // Como Supabase es raro a veces no loguea de inmediato así que forzamos un inicio de sesión manual para probar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      // Si el login automático falló significa que requiere confirmación por correo o algo así
      if (signInError) {
        // Le mostramos un mensaje de éxito pero pidiéndole que inicie él solito
        showAlert(
          '¡Cuenta creada!',
          'Tu cuenta fue creada. Por favor inicia sesión manualmente.',
          'success'
        );
        // Lo pateamos elegantemente hacia la pantalla de login para que lo intente allá
        router.replace('/(auth)/login');
      }

    // Si cualquier cosa en todo este largo proceso falló cae aquí
    } catch (error: any) {
      // Alerta roja de pánico con el mensaje técnico
      showAlert('Error', error.message || 'Ocurrió un error al registrarse.', 'error');
    // Siempre apagamos la ruedita al final para no dejar al compa esperando la muerte térmica del universo
    } finally {
      setLoading(false);
    }
  }

  // FUNCION: signUpWithGoogle
  // Esta rutina hace exactamente lo mismo que el login pero disfrazada de registro abriendo el navegador de Google
  async function signUpWithGoogle() {
    // Ruedita de espera on
    setLoading(true);
    // Try catch para evitar crashes repentinos si algo falla con el navegador
    try {
      // Creamos la dirección a la que Google nos va a devolver luego de autorizar
      const redirectUri = makeRedirectUri({ scheme: 'encodergoti' });
      // Pedimos a Supabase la llave para abrir Google por OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Dirección de regreso
          redirectTo: redirectUri,
          // Evitamos que Supabase intente abrir el navegador él solo porque Expo WebBrowser es más estable
          skipBrowserRedirect: true,
        },
      });

      // Si no nos dieron la llave explotamos
      if (error) throw error;

      // Verificamos que sí tengamos un link válido de Google
      if (data?.url) {
        // Abrimos la página de inicio de sesión de Google sobre nuestra app
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

        // Si el usuario terminó todo y regresó triunfante
        if (res.type === 'success' && res.url) {
          // Guardamos la URL sucia que nos trajo de regreso llena de tokens
          const returnUrl = res.url;
          // Rompemos la URL para sacar solo la basura importante que está después del hashtag
          const fragmentString = returnUrl.includes('#') ? returnUrl.split('#')[1] : returnUrl.split('?')[1];

          // Si sí había basura útil
          if (fragmentString) {
            // Usamos esta herramienta para leer los datos fácilmente como si fueran variables
            const params = new URLSearchParams(fragmentString);
            // Extraemos el pase VIP principal
            const access_token = params.get('access_token');
            // Extraemos el pase de reserva por si se caduca el principal
            const refresh_token = params.get('refresh_token');

            // Si trajimos pase VIP
            if (access_token) {
              // Se lo metemos a la fuerza a la sesión local de Supabase para que sepa que somos nosotros
              const { error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token: refresh_token ?? '',
              });
              // Si Supabase no quiso agarrar el pase VIP explotamos
              if (sessionError) throw sessionError;
            // Si por alguna razón los tokens venían invisibles
            } else {
              // Le ordenamos a Supabase que refresque la sesión cruzando los dedos para que las cookies funcionen
              await supabase.auth.refreshSession();
            }
          }
        }
      }
    // Atrapamos errores locos
    } catch (error: any) {
      // Alerta con el drama completo
      showAlert('Error', error.message || 'Error con Google Auth', 'error');
    // Fin del drama apagamos la ruedita
    } finally {
      setLoading(false);
    }
  }

  // Devolvemos el paquete con los estados y funciones
  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    signUpWithEmail,
    signUpWithGoogle
  };
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la consulta a la tabla profiles en signUpWithEmail? pasa que dos usuarios diferentes podrían registrarse usando exactamente el mismo nombre real generando confusión infinita en la base de datos
// para solucionarlo debes volver a implementar la verificación previa en la base de datos con ilike antes de dejar pasar el registro
// ¿qué pasa si borras las validaciones de !trimmedName o password.length? pasa que los usuarios podrán crear cuentas fantasmas sin datos o con contraseñas tan ridículas como a que serían hackeadas en 2 segundos
// para solucionarlo reescribe los if iniciales en tu función de registro devolviendo alertas claras si no cumplen las reglas
