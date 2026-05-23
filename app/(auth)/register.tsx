import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Link as ExpoLink, useRouter } from 'expo-router';

// Sección: Este archivo maneja la pantalla donde los usuarios nuevos pueden inscribirse y crear su cuenta ingresando un correo y una contraseña segura

// Funciones: RegisterScreen sirve para registrar usuarios en la base de datos verificar que las contraseñas sean válidas y meterlos directo a la aplicación sin pasos extra

// Exportamos nuestro componente de registro
export default function RegisterScreen() {
  // Inicializamos el enrutador para poder mandarlos a otras pantallas cuando terminen
  const router = useRouter();
  // Estado para agarrar el correo que van tipeando
  const [email, setEmail] = useState('');
  // Estado para la contraseña
  const [password, setPassword] = useState('');
  // Estado para el indicador de que la app se quedó pensando (la rueda giratoria)
  const [loading, setLoading] = useState(false);

  // Función asíncrona para intentar guardar los datos del nuevo usuario en Supabase
  async function signUpWithEmail() {
    // Si no escribieron nada en algún campo rebotamos la petición
    if (!email || !password) {
      // Mostramos ventana de error
      Alert.alert('Campos vacíos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }
    // Si intentan usar una contraseña débil de menos de 6 caracteres
    if (password.length < 6) {
      // Les advertimos que debe ser más larga por seguridad
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Encendemos el ícono de carga para bloquear el botón
    setLoading(true);
    try {
      // Paso 1: Registrar la cuenta en la base de datos de Supabase
      const { error: signUpError } = await supabase.auth.signUp({
        // Quitamos espacios extra
        email: email.trim(),
        // Enviamos contraseña
        password: password,
      });

      // Si nos lanzan un error lo atrapamos en el "catch"
      if (signUpError) throw signUpError;

      // Paso 2: Hacer login inmediatamente con las mismas credenciales
      // Esto evita el error "email not confirmed" ya que confirmamos
      // que Supabase tiene desactivada la confirmación de email.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        // Mismos datos que usamos arriba
        email: email.trim(),
        password: password,
      });

      // Si algo salió mal en el login automático posterior al registro
      if (signInError) {
        // Si falla el auto-login mandamos al login manual
        Alert.alert(
          '¡Cuenta creada!',
          'Tu cuenta fue creada. Por favor inicia sesión manualmente.'
        );
        // Lo pateamos a la pantalla de login para que lo intente a mano
        router.replace('/(auth)/login');
      }
      // Si signInWithPassword tiene éxito el hook useAuth detecta la sesión
      // y el _layout.tsx redirige automáticamente a /(tabs)

    // Atrapamos errores generales de conexión o fallas que hayamos tirado arriba
    } catch (error: any) {
      // Mostramos el mensaje en un popup para que el usuario entienda qué pasó
      Alert.alert('Error', error.message || 'Ocurrió un error al registrarse.');
    } finally {
      // Ya sea que funcionó o falló siempre apagamos el indicador de carga al terminar
      setLoading(false);
    }
  }

  // Estructura visual principal
  return (
    // Componente especial para que el teclado virtual no se coma nuestros botones
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Cabecera superior visual */}
      <View style={styles.headerContainer}>
        {/* El logo combinado de la app */}
        <Text style={styles.logo}>Encoder <Text style={styles.logoBold}>Goti</Text></Text>
        {/* Un mensajito sutil indicando de qué trata esta pantalla */}
        <Text style={styles.subtitle}>Crea una cuenta nueva</Text>
      </View>

      {/* Contenedor principal de las cajas de texto */}
      <View style={styles.formContainer}>
        {/* Título arriba de la caja de email */}
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          // Estilo general
          style={styles.input}
          // Función al teclear letras
          onChangeText={(text) => setEmail(text)}
          // Lo ligamos a nuestro estado local
          value={email}
          // Ejemplo fantasma
          placeholder="email@address.com"
          // Todo en minúsculas forzadas
          autoCapitalize={'none'}
          // Teclado con símbolo arroba
          keyboardType="email-address"
        />

        {/* Título arriba de la caja de clave */}
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          // Mismo estilo
          style={styles.input}
          // Guardamos lo tipeado en su variable respectiva
          onChangeText={(text) => setPassword(text)}
          // Lo ligamos
          value={password}
          // Ocultamos los caracteres
          secureTextEntry={true}
          // Ejemplo en estrellitas
          placeholder="********"
          // Desactivamos auto mayúscula inicial
          autoCapitalize={'none'}
        />

        {/* Botón táctil para enviar información al servidor */}
        <TouchableOpacity style={styles.button} onPress={signUpWithEmail} disabled={loading}>
          {/* Mostramos ruedita giratoria si está cargando de lo contrario enseñamos la palabra "Registrarse" */}
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarse</Text>}
        </TouchableOpacity>

        {/* Celdita debajo de todo con enlaces extras */}
        <View style={styles.footer}>
          {/* Texto pasivo */}
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          {/* Botón camuflado como texto azul que redirige a login */}
          <ExpoLink href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Inicia sesión</Text>
            </TouchableOpacity>
          </ExpoLink>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Empezamos los estilos locales
const styles = StyleSheet.create({
  // Caja de fondo que toma toda el área
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },
  // Contenedor que centra los textos de arriba
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  // Fuente principal del logo
  logo: {
    fontSize: 32,
    color: '#333',
  },
  // Palabra resaltada del logo
  logoBold: {
    fontWeight: 'bold',
    color: '#1E3A8A', // Azul marino profesional
  },
  // Subtítulo gris
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  // Tamaño completo del formulario
  formContainer: {
    width: '100%',
  },
  // Letritas encima de los inputs
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  // Diseño de la caja para escribir
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  // Botón azulón gordo
  button: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  // Color interior del botón
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Parte de abajo
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  // Color del párrafo
  footerText: {
    color: '#666',
  },
  // Color tipo hipervínculo
  link: {
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
});

// si quitas RegisterScreen pasa que nadie en el mundo podrá crear una nueva cuenta y tu app no podrá captar ningún cliente o usuario nuevo
