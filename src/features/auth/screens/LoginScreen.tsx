// SECCION DE IMPORTACIONES
// Importamos React junto con sus hooks useState y useEffect para poder manejar variables reactivas en la pantalla
import React, { useState, useEffect } from 'react';
// Importamos un montón de componentes nativos de React Native para armar la interfaz visual como vistas, textos, entradas de teclado y la ruedita de carga
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
// Importamos nuestra conexión configurada de Supabase para poder hacer las peticiones de inicio de sesión a la base de datos
import { supabase } from '@/shared/services/supabase';
// Importamos el componente Link de expo-router pero le cambiamos el nombre a ExpoLink para que no choque con otras cosas y nos sirva para navegar a otras pantallas
import { Link as ExpoLink } from 'expo-router';
// Importamos LinearGradient para poder pintar fondos con degradados bonitos en lugar de colores sólidos aburridos
import { LinearGradient } from 'expo-linear-gradient';
// Importamos la librería de reanimated para poder hacer animaciones fluidas cuando aparecen los elementos en pantalla
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
// Importamos el WebBrowser de Expo que nos permite abrir una pestañita del navegador dentro de la app para loguearnos con Google
import * as WebBrowser from 'expo-web-browser';
// Importamos makeRedirectUri para poder decirle a Google a qué dirección debe regresar el usuario después de iniciar sesión
import { makeRedirectUri } from 'expo-auth-session';
// Importamos nuestra paleta de colores personalizada desde el tema global de la aplicación
import { Colors } from '@/shared/theme/theme';
// Importamos nuestro gancho de alertas personalizadas para poder mostrar ventanitas de error o éxito bien diseñadas
import { useCustomAlert } from '@/shared/context/AlertContext';

// Bloque de configuración inicial del navegador
// Ejecutamos esta función mágica de WebBrowser en la raíz del archivo para que la app pueda atrapar la respuesta de Google cuando regrese del navegador
WebBrowser.maybeCompleteAuthSession();

// SECCION PRINCIPAL DE LA PANTALLA
// FUNCION: LoginScreen
// Este es el componente que dibuja toda la pantalla completa de inicio de sesión con correo y contraseña o con Google
export default function LoginScreen() {
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

  // Bloque de renderizado
  // Aquí devolvemos el cascarón de diseño que se pintará en la pantalla del celular
  return (
    // Empezamos con un fondo en degradado oscuro que va de azul marino profundo a casi negro total
    <LinearGradient
      colors={['#0F172A', '#020617']}
      style={styles.gradientContainer}
    >
      {/* Envolvemos todo en este componente para que el teclado del celular no tape los campos de texto cuando el usuario vaya a escribir adaptándose si es iPhone o Android */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

        {/* Bloque del encabezado animado */}
        {/* Hacemos que el título baje suavecito desde arriba como un resorte cuando la pantalla recién se carga */}
        <Animated.View entering={FadeInDown.duration(800).springify()}>
          <View style={styles.headerContainer}>
            {/* Dibujamos el texto del logo mezclando un estilo normal con uno en negrita brillante */}
            <Text style={styles.logo}>Encoder<Text style={styles.logoBold}>Goti</Text></Text>
            {/* Ponemos un subtítulo chiquito debajo para decirle de qué va esta pantalla */}
            <Text style={styles.subtitle}>INICIA SESIÓN</Text>
          </View>
        </Animated.View>

        {/* Bloque del formulario animado */}
        {/* Hacemos que la caja de texto suba fluidamente desde abajo pero con un pequeño retraso para que aparezca después del título */}
        <Animated.View entering={FadeInUp.duration(1000).springify().delay(200)}>
          <View style={styles.formContainer}>

            {/* Agrupamos la etiqueta del email y su campo de texto */}
            <View style={styles.inputGroup}>
              {/* Letrerito pequeñito que dice EMAIL */}
              <Text style={styles.label}>EMAIL</Text>
              {/* Le ponemos un fondito como de cristal transparente usando rgba */}
              <View style={styles.glassInputContainer}>
                {/* El campo donde la persona teclea configurado para que no ponga mayúsculas solas y que muestre el teclado con arroba */}
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setEmail(text)}
                  value={email}
                  placeholder="usuario@ejemplo.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  autoCapitalize={'none'}
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Agrupamos la etiqueta del password y su campo */}
            <View style={styles.inputGroup}>
              {/* Letrerito que dice PASSWORD */}
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.glassInputContainer}>
                {/* El campo de contraseña configurado con secureTextEntry en true para que salgan puntitos en vez de letras */}
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setPassword(text)}
                  value={password}
                  secureTextEntry={true}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  autoCapitalize={'none'}
                />
              </View>
            </View>

            {/* Bloque del botón principal */}
            {/* Ponemos el botón de entrar que se bloquea solito si la variable loading está encendida */}
            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={signInWithEmail}
              disabled={loading}
            >
              {/* Le pintamos un degradado neón brillante al botón de azul eléctrico a celeste */}
              <LinearGradient
                colors={[Colors.dark.tint, '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.neonButton}
              >
                {/* Si estamos procesando mostramos la ruedita de carga oscura, si no mostramos el texto de ENTRAR */}
                {loading ? (
                  <ActivityIndicator color="#020617" />
                ) : (
                  <Text style={styles.buttonText}>ENTRAR</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Bloque del separador visual */}
            {/* Creamos esa típica línea decorativa que tiene una "O" en medio separando las formas de loguearse */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>O</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Bloque del botón de Google */}
            {/* Creamos un botón blanco elegante para Google que invoca a la súper función de OAuth */}
            <TouchableOpacity
              style={styles.googleButtonWrapper}
              onPress={signInWithGoogle}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.googleButton}>
                {/* Ponemos una G rojita para simular el logo clásico de Google */}
                <Text style={styles.googleButtonIcon}>G</Text>
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </View>
            </TouchableOpacity>

            {/* Bloque del enlace a registrarse */}
            {/* Si el compa es nuevo lo invitamos a ir a la pantalla de registro con un link directo */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>¿NO TIENES CUENTA? </Text>
              <ExpoLink href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>CREA UNA AHORA</Text>
                </TouchableOpacity>
              </ExpoLink>
            </View>
          </View>
        </Animated.View>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// SECCION DE ESTILOS CSS
// Aquí definimos todas las reglas de diseño como si fuera CSS para dejar la pantalla hermosa y futurista
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    color: '#FFF',
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  logoBold: {
    color: Colors.dark.tint,
    fontWeight: '900',
    textShadowColor: Colors.dark.tint,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    letterSpacing: 4,
    fontWeight: '700',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  glassInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#FFF',
  },
  buttonWrapper: {
    marginTop: 8,
    borderRadius: 16,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  neonButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  separatorText: {
    color: '#64748B',
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: 'bold',
  },
  googleButtonWrapper: {
    borderRadius: 16,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  googleButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleButtonIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EA4335', // Google Red
  },
  googleButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    letterSpacing: 1,
  },
  link: {
    color: Colors.light.tint, // Magenta neón
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
    textShadowColor: Colors.light.tint,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la constante supabase.auth.signInWithPassword? pasa que el botón de entrar funcionará visualmente pero nunca mandará los datos a la base de datos dejando al usuario en la pantalla de inicio eternamente
// para solucionarlo debes volver a implementar la llamada a la base de datos pasando el email y la contraseña capturados
// ¿qué pasa si quitas la función signInWithGoogle completa? pasa que el botón de continuar con Google simplemente dejará de hacer clics o lanzará un error interno impidiendo que la gente se registre rápido con su cuenta de gmail
// para solucionarlo restaura todo el bloque del WebBrowser con su manejo de tokens y redirectUri
// ¿qué pasa si borras la llamada WebBrowser.maybeCompleteAuthSession() de la raíz? pasa que la aplicación se quedará atascada en el navegador después de que el usuario meta su clave en Google y nunca sabrá cómo regresar a la app nativa
// para solucionarlo simplemente pon esa línea suelta en el encabezado del archivo para que el listener se quede activo escuchando la redirección
