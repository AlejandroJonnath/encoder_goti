// SECCION DE IMPORTACIONES
// Importamos React
import React from 'react';
// Importamos todas las piezas de Lego de React Native para armar la interfaz visual como textos, botones y el teclado adaptativo
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
// Importamos herramientas de navegación de expo-router para poder mandar al usuario a la pantalla de login cuando termine
import { Link as ExpoLink } from 'expo-router';
// Importamos el gradiente lineal para hacer fondos espectaculares que no sean simples colores aburridos
import { LinearGradient } from 'expo-linear-gradient';
// Importamos herramientas de animación para que los formularios entren volando a la pantalla suavemente
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
// Importamos nuestros colores de marca para mantener la estética ciberpunk y futurista
import { Colors } from '@/shared/theme/theme';
// Importamos nuestro gancho de registro que ahora maneja toda la lógica pesada
import { useRegister } from '@/features/auth/hooks/useRegister';
// Importamos los estilos desde su archivo propio
import styles from '@/features/auth/styles/register.styles';

// SECCION PRINCIPAL DE LA PANTALLA
// FUNCION: RegisterScreen
// Este es el componente gigante que dibuja la pantalla de crear cuenta nueva desde cero
export default function RegisterScreen() {
  // Extraemos todas las variables y funciones desde nuestro custom hook
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    signUpWithEmail,
    signUpWithGoogle
  } = useRegister();

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

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si eliminas KeyboardAvoidingView del fondo? pasa que cuando los usuarios con celulares pequeños intenten escribir su contraseña el teclado les tapará todo el formulario y nunca podrán ver el botón de registro
// para solucionarlo envuelve todo el contenido principal de nuevo asegurándote de usar padding para ios y height para android
