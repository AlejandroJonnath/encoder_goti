// SECCION DE IMPORTACIONES
// React es el motor que hace posible todo lo que ves en pantalla
import React from 'react';
// Sacamos las piezas de construcción nativas del celular
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
// Para respetar el notch o muesca del celular
import { SafeAreaView } from 'react-native-safe-area-context';
// Nuestro gancho que sabe quién está logueado
import { useSessionAuth } from '@/features/auth/hooks/useSessionAuth';
// La conexión real a nuestra base de datos en la nube
import { supabase } from '@/shared/services/supabase';
// Para hacer ese fondo degradado oscuro elegante
import { LinearGradient } from 'expo-linear-gradient';
// Animated nos permite agregar animaciones de entrada bonitas
import Animated, { FadeInDown } from 'react-native-reanimated';
// La paleta de colores de toda la app
import { Colors } from '@/shared/theme/theme';
// Traemos el icono de salida y el de usuario de la librería de iconos
import { LogOut, User as UserIcon } from 'lucide-react-native';
// El sistema de alertas personalizadas del proyecto
import { useCustomAlert } from '@/shared/context/AlertContext';

// Sección: Pantalla de Perfil de Usuario con animaciones y cierre de sesión

// FUNCION: ProfileScreen
// Es la tarjeta de presentación del usuario; muestra su correo y el botón de salir
export default function ProfileScreen() {
  // Sacamos el objeto del usuario actualmente autenticado
  const { user } = useSessionAuth();
  // Sacamos la función para lanzar alertas bonitas
  const { showAlert } = useCustomAlert();

  // FUNCION: handleLogout
  // Le da la patada a Supabase para que destruya la sesión activa
  async function handleLogout() {
    // Le pedimos a supabase que cierre la sesión del usuario
    const { error } = await supabase.auth.signOut();
    // Si algo salió mal se lo decimos con una alerta roja
    if (error) {
      showAlert('Error', error.message, 'error');
    }
  }

  // Pintamos la pantalla
  return (
    // El degradado de fondo oscuro que cae de arriba hacia abajo
    <LinearGradient
      colors={['#0F172A', '#020617']}
      style={styles.gradientContainer}
    >
      {/* El área segura para no pisar el notch del teléfono */}
      <SafeAreaView style={styles.container}>
        {/* El título que entra volando desde abajo en 600ms */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <Text style={styles.title}>MI PERFIL</Text>
        </Animated.View>

        {/* El contenido principal entra un poco después con retraso de 200ms para que se vea bonito */}
        <Animated.View entering={FadeInDown.duration(800).delay(200).springify()} style={styles.content}>
          
          {/* Contenedor del círculo avatar con sombra de color cian */}
          <View style={styles.avatarContainer}>
            {/* El anillo de gradiente colorido alrededor del avatar */}
            <LinearGradient
              colors={[Colors.dark.tint, Colors.light.tint]}
              style={styles.avatarRing}
            >
              {/* El fondo oscuro interior del círculo donde vive el icono */}
              <View style={styles.avatarInner}>
                {/* El icono de persona por defecto ya que no hay foto */}
                <UserIcon size={48} color="#F8FAFC" />
              </View>
            </LinearGradient>
          </View>

          {/* La tarjetita oscura donde mostramos el correo */}
          <View style={styles.infoCard}>
            {/* Capa de vidrio esmerilado sobre la tarjeta para darle profundidad */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']}
              style={StyleSheet.absoluteFill}
            />
            {/* La etiqueta pequeña en gris pálido */}
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            {/* El correo real del usuario logueado */}
            <Text style={styles.value}>{user?.email}</Text>
          </View>

          {/* El botón rojo translúcido para salir de la sesión */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            {/* Icono de puerta con flecha saliendo */}
            <LogOut color="#EF4444" size={20} style={{ marginRight: 8 }} />
            {/* Texto en mayúsculas negritas rojas */}
            <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
          </TouchableOpacity>

        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// SECCION DE ESTILOS
const styles = StyleSheet.create({
  // El contenedor del fondo que ocupa toda la pantalla para el gradiente
  gradientContainer: {
    flex: 1,
  },
  // El área principal que respeta los bordes del celular
  container: {
    flex: 1,
  },
  // El encabezado centrado con padding
  header: {
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  // El título blanco en negritas condensadas con espaciado de letras
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    // Usamos fuente condensada según el sistema operativo porque en iOS y Android se llaman diferente
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  // El bloque que centra verticalmente el avatar y la tarjeta
  content: {
    padding: 24,
    alignItems: 'center',
  },
  // El contenedor del aro del avatar con sombra resplandeciente
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
    // La sombra agarra el color principal del tema oscuro para brillar con ese cian
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  // El aro exterior del avatar con el gradiente de colores
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // El círculo negro de adentro que hace que el aro se vea como un anillo
  avatarInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#020617',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // La tarjeta oscura semitransparente que muestra el correo
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 24,
    borderRadius: 20,
    marginBottom: 40,
    borderWidth: 1,
    // Borde blanco fantasmal muy sutil
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Para que el gradiente interno no se salga de los bordes redondeados
    overflow: 'hidden',
  },
  // La etiqueta gris pequeñita en mayúsculas espaciadas
  label: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  // El correo del usuario en blanco grande
  value: {
    fontSize: 18,
    color: '#F8FAFC',
    fontWeight: '700',
  },
  // El botón de cierre de sesión con fondo rojo muy tenue y borde rojo fantasmal
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // El texto del botón de salida en rojo chillón y negritas
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la función handleLogout? pasa que el botón de cerrar sesión quedará pintado pero no hará nada y el usuario quedará atrapado en la app para siempre sin poder salir
// para solucionarlo vuelve a conectar supabase.auth.signOut() dentro de una función async que también capture errores y los muestre con showAlert
// ¿qué pasa si borras el LinearGradient exterior del fondo? pasa que el fondo de toda la pantalla se pondrá blanco o transparente dependiendo del sistema operativo arruinando el diseño oscuro elegante
// para solucionarlo debes volver a envolver toda la pantalla en el LinearGradient con los colores originales '#0F172A' y '#020617'
