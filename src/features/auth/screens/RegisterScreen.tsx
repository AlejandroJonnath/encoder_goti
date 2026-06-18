// SECCION DE IMPORTACIONES
// Importamos React y el hook useState para controlar lo que el usuario escribe en las cajitas de texto
import React, { useState } from 'react';
// Importamos todas las piezas de Lego de React Native para armar la interfaz visual como textos, botones y el teclado adaptativo
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
// Traemos nuestra conexión maestra de Supabase para poder registrar a los usuarios nuevos en la base de datos
import { supabase } from '@/shared/services/supabase';
// Importamos herramientas de navegación de expo-router para poder mandar al usuario a la pantalla de login cuando termine
import { Link as ExpoLink, useRouter } from 'expo-router';
// Importamos el gradiente lineal para hacer fondos espectaculares que no sean simples colores aburridos
import { LinearGradient } from 'expo-linear-gradient';
// Importamos herramientas de animación para que los formularios entren volando a la pantalla suavemente
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
// Importamos WebBrowser para poder abrir la ventanita mágica de Google donde la gente mete su contraseña
import * as WebBrowser from 'expo-web-browser';
// Importamos esta utilidad para crear el caminito de regreso desde Google hacia nuestra aplicación
import { makeRedirectUri } from 'expo-auth-session';
// Importamos nuestros colores de marca para mantener la estética ciberpunk y futurista
import { Colors } from '@/shared/theme/theme';
// Importamos el gancho de alertas para avisarle al usuario si la riega llenando el formulario o si todo sale bien
import { useCustomAlert } from '@/shared/context/AlertContext';

// Bloque de configuración del navegador
// Lanzamos esta función para que si el usuario regresa de Google la aplicación sepa cómo recibirlo y cerrar la pestaña
WebBrowser.maybeCompleteAuthSession();

// SECCION PRINCIPAL DE LA PANTALLA
// FUNCION: RegisterScreen
// Este es el componente gigante que dibuja la pantalla de crear cuenta nueva desde cero
export default function RegisterScreen() {
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

  // Bloque de renderizado
  // Mandamos a dibujar la pantalla completa devolviendo un arbolote de componentes
  return (
    // Fondo bonito degradado usando colores súper oscuros de azul y negro
    <LinearGradient
      colors={['#0F172A', '#020617']}
      style={styles.gradientContainer}
    >
      {/* Vista especial que hace que todo el formulario se suba solito cuando el teclado del celular aparece */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

        {/* Bloque del encabezado animado */}
        {/* Usamos Animated para que el logo aterrice suavemente desde arriba */}
        <Animated.View entering={FadeInDown.duration(800).springify()}>
          <View style={styles.headerContainer}>
            {/* Logo de la app combinando texto normal y negrita */}
            <Text style={styles.logo}>Encoder<Text style={styles.logoBold}>Goti</Text></Text>
            {/* Subtítulo para que sepa que está creando cuenta */}
            <Text style={styles.subtitle}>CREA UNA CUENTA NUEVA</Text>
          </View>
        </Animated.View>

        {/* Bloque del formulario animado */}
        {/* El formulario completo entra desde abajo despacito un poco después que el título */}
        <Animated.View entering={FadeInUp.duration(1000).springify().delay(200)}>
          <View style={styles.formContainer}>

            {/* Grupo del campo de nombre */}
            <View style={styles.inputGroup}>
              {/* Etiqueta pequeñita */}
              <Text style={styles.label}>NOMBRE COMPLETO</Text>
              {/* Cajan de cristal translúcido para el input */}
              <View style={styles.glassInputContainer}>
                {/* Cuadro de texto donde el compa escribe su nombre con auto mayúsculas por cada palabra */}
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setFullName(text)}
                  value={fullName}
                  placeholder="Juan Pérez"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Grupo del campo de email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.glassInputContainer}>
                {/* Cuadro para el correo configurado para sacar el teclado con arroba directo */}
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setEmail(text)}
                  value={email}
                  placeholder="usuario@ejemplo.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Grupo del campo de contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.glassInputContainer}>
                {/* Cuadro de la clave con secureTextEntry para esconder los caracteres como puntitos */}
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setPassword(text)}
                  value={password}
                  secureTextEntry={true}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Bloque del botón principal de registrarse */}
            {/* Este botón ejecuta nuestra función grandota de registro si lo tocan y se bloquea si ya estamos cargando */}
            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={signUpWithEmail}
              disabled={loading}
            >
              {/* Le metemos un degradado de magenta a morado oscuro para que resalte muchísimo */}
              <LinearGradient
                colors={[Colors.light.tint, '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.neonButton}
              >
                {/* Si estamos procesando mostramos ruedita si no el texto de REGISTRARSE en grande */}
                {loading ? (
                  <ActivityIndicator color="#020617" />
                ) : (
                  <Text style={styles.buttonText}>REGISTRARSE</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Bloque separador */}
            {/* Las rayitas con la letra O en el medio para separar métodos de ingreso */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>O</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Bloque del botón de Google */}
            {/* El clásico botón blanco para iniciar rapidísimo con la cuenta del celular sin llenar datos */}
            <TouchableOpacity
              style={styles.googleButtonWrapper}
              onPress={signUpWithGoogle}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.googleButton}>
                {/* Letra G roja simulando a Google */}
                <Text style={styles.googleButtonIcon}>G</Text>
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </View>
            </TouchableOpacity>

            {/* Bloque de pie de página */}
            {/* Un pequeño texto por si el usuario se equivocó de pantalla y en realidad ya tenía cuenta */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>¿YA TIENES CUENTA? </Text>
              {/* Enlace directo usando ExpoLink para devolverlo a LoginScreen sin recargar toda la app */}
              <ExpoLink href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>INICIA SESIÓN</Text>
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
// Aquí preparamos todos los estilos que le darán el look and feel profesional a cada componente
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
    shadowColor: Colors.light.tint,
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
    color: Colors.dark.tint,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
    textShadowColor: Colors.dark.tint,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la consulta a la tabla profiles en signUpWithEmail? pasa que dos usuarios diferentes podrían registrarse usando exactamente el mismo nombre real generando confusión infinita en la base de datos
// para solucionarlo debes volver a implementar la verificación previa en la base de datos con ilike antes de dejar pasar el registro
// ¿qué pasa si borras las validaciones de !trimmedName o password.length? pasa que los usuarios podrán crear cuentas fantasmas sin datos o con contraseñas tan ridículas como a que serían hackeadas en 2 segundos
// para solucionarlo reescribe los if iniciales en tu función de registro devolviendo alertas claras si no cumplen las reglas
// ¿qué pasa si eliminas KeyboardAvoidingView del fondo? pasa que cuando los usuarios con celulares pequeños intenten escribir su contraseña el teclado les tapará todo el formulario y nunca podrán ver el botón de registro
// para solucionarlo envuelve todo el contenido principal de nuevo asegurándote de usar padding para ios y height para android
