// SECCION DE IMPORTACIONES
// Importamos React
import React from 'react';
// Importamos un montón de componentes nativos de React Native para armar la interfaz visual como vistas, textos, entradas de teclado y la ruedita de carga
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
// Importamos el componente Link de expo-router pero le cambiamos el nombre a ExpoLink para que no choque con otras cosas y nos sirva para navegar a otras pantallas
import { Link as ExpoLink } from 'expo-router';
// Importamos LinearGradient para poder pintar fondos con degradados bonitos en lugar de colores sólidos aburridos
import { LinearGradient } from 'expo-linear-gradient';
// Importamos la librería de reanimated para poder hacer animaciones fluidas cuando aparecen los elementos en pantalla
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
// Importamos nuestra paleta de colores personalizada desde el tema global de la aplicación
import { Colors } from '@/shared/theme/theme';
// Importamos nuestro gancho que ahora tiene toda la lógica
import { useLogin } from '@/features/auth/hooks/useLogin';
// Importamos los estilos desde su archivo propio
import styles from '@/features/auth/styles/login.styles';

// SECCION PRINCIPAL DE LA PANTALLA
// FUNCION: LoginScreen
// Este es el componente que dibuja toda la pantalla completa de inicio de sesión con correo y contraseña o con Google
export default function LoginScreen() {
  // Extraemos las variables y funciones que manejan el comportamiento usando nuestro custom hook
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    signInWithEmail,
    signInWithGoogle
  } = useLogin();

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
