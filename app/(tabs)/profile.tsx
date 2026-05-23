import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

// Sección: Este archivo maneja la pestaña que muestra los detalles de la cuenta actual donde el usuario puede ver su correo registrado y cerrar su sesión de forma segura

// Funciones: ProfileScreen sirve como un espacio personal mínimo para consultar datos y como la única puerta de salida para desloguearse de la app

// Exportamos nuestra pantalla personal
export default function ProfileScreen() {
  // Jalamos los datos del usuario logueado en este mismo instante usando nuestro hook inteligente
  const { user } = useAuth();

  // Función asíncrona dedicada a expulsar o desloguear al usuario
  async function handleLogout() {
    // Ordenamos a Supabase borrar las credenciales locales de este teléfono
    const { error } = await supabase.auth.signOut();
    // Si algo raro pasara al momento de intentar cerrar la sesión
    if (error) {
      // Le enseñamos un popup para que se entere que ocurrió
      Alert.alert('Error', error.message);
    }
    // Ojo: Si esto funciona perfectamente el layout raíz detecta que el usuario se fue a nulo y manda a la app automáticamente hacia el panel de login
  }

  // Pintamos el visual de la pantalla personal
  return (
    // SafeAreaView impide que nuestro texto se superponga con la isla de cámaras o batería de los teléfonos modernos
    <SafeAreaView style={styles.container}>
      {/* Contenedor del título */}
      <View style={styles.header}>
        {/* Nombre de la página en grande */}
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      {/* Bloque principal donde está toda la chicha de esta pantalla */}
      <View style={styles.content}>
        {/* Tarjeta bonita con información estática del usuario */}
        <View style={styles.infoCard}>
          {/* Pequeña etiqueta descriptiva */}
          <Text style={styles.label}>Correo Electrónico</Text>
          {/* Aquí inyectamos el correo del usuario que agarramos arriba (el signo de interrogación es por si falla y llega nulo no truene toda la app) */}
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        {/* Botón rectangular en la parte inferior para presionar salir */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          {/* Letras del botón en azul para denotar interactividad pero menos fuerte que un botón relleno */}
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Comenzamos con el bloque de estilos
const styles = StyleSheet.create({
  // Caja de fondo grisácea general
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Rectángulo blanco con separación
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  // Letras del título
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  // Envoltura o márgenes internos del resto del contenido
  content: {
    padding: 24,
  },
  // Tarjetita blanca con la información personal levantada de fondo para que resalte
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  // Etiqueta tenue gris
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  // Letras un poco más visibles para el correo final del cliente
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  // Botón delineado y sin relleno (solo blanco con un pequeño borde azul oscuro)
  logoutButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  // Letras gruesas y del mismo tono de su delineado para dar coherencia
  logoutText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// si quitas ProfileScreen pasa que el usuario será un prisionero eterno de tu app sin poder cerrar sesión en su móvil ni ver el correo actual con el que ingresó
