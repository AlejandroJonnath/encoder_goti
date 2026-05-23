import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Link as ExpoLink } from 'expo-router';

// Sección: Este archivo contiene la pantalla donde los usuarios existentes pueden iniciar sesión usando su correo y contraseña

// Funciones: LoginScreen sirve para capturar los datos del usuario validarlos contactar a nuestra base de datos (Supabase) y darle acceso a la aplicación principal

// Exportamos nuestra pantalla de login
export default function LoginScreen() {
  // Creamos un estado para guardar el correo que el usuario va escribiendo
  const [email, setEmail] = useState('');
  // Creamos un estado para guardar la contraseña escrita
  const [password, setPassword] = useState('');
  // Creamos un estado para saber si estamos cargando los datos y mostrar la bolita girando
  const [loading, setLoading] = useState(false);

  // Esta función asíncrona se dispara cuando le dan al botón de entrar
  async function signInWithEmail() {
    // Primero verificamos que el usuario no haya dejado los campos vacíos por error
    if (!email || !password) {
      // Si están vacíos mostramos una alerta en pantalla
      Alert.alert('Campos vacíos', 'Por favor ingresa tu correo y contraseña.');
      // Detenemos la función para no enviar nada al servidor
      return;
    }

    // Prendemos el indicador de carga para que la app parezca que está trabajando
    setLoading(true);
    
    // Le pedimos a Supabase que intente iniciar sesión con los datos provistos
    const { error } = await supabase.auth.signInWithPassword({
      // Le quitamos los espacios en blanco al inicio o final del correo
      email: email.trim(),
      // Le pasamos la contraseña tal cual
      password: password,
    });

    // Revisamos si ocurrió algún error en el proceso de inicio de sesión
    if (error) {
      // Si el error es de email no confirmado dar instrucción clara
      if (error.message.toLowerCase().includes('email not confirmed')) {
        // Mostramos alerta especial explicando cómo arreglar el problema de la base de datos
        Alert.alert(
          'Cuenta sin confirmar',
          'Esta cuenta fue creada antes de que se desactivara la confirmación de email.\n\nPor favor elimínala desde Supabase → Authentication → Users y regístrate de nuevo.'
        );
      // Si las credenciales simplemente son inválidas (mala contraseña o mal correo)
      } else if (error.message.toLowerCase().includes('invalid login credentials')) {
        // Le avisamos que se equivocó
        Alert.alert('Credenciales incorrectas', 'El correo o la contraseña no son correctos.');
      // Para cualquier otro error extraño o del servidor
      } else {
        // Mostramos el mensaje directo que nos mandó Supabase
        Alert.alert('Error', error.message);
      }
    }
    // Si no hay error el hook useAuth detecta la sesión y redirige automáticamente
    // Por último apagamos el estado de carga
    setLoading(false);
  }

  // Renderizamos el diseño visual de la pantalla
  return (
    // Envolvemos todo en un KeyboardAvoidingView para que el teclado no tape los botones cuando se abre
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Contenedor del título y logo superior */}
      <View style={styles.headerContainer}>
        {/* Mostramos nuestro logo de texto con dos grosores de fuente distintos */}
        <Text style={styles.logo}>Encoder <Text style={styles.logoBold}>Goti</Text></Text>
        {/* Un pequeño subtítulo motivacional */}
        <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
      </View>

      {/* Contenedor para el formulario completo */}
      <View style={styles.formContainer}>
        {/* Etiqueta del primer campo de texto */}
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          // Estilo de caja con bordes
          style={styles.input}
          // Actualizamos nuestra variable cada vez que escriben una letra
          onChangeText={(text) => setEmail(text)}
          // Lo amarramos a nuestro estado
          value={email}
          // Texto gris de fondo de ayuda
          placeholder="email@address.com"
          // Impedimos que la primera letra se ponga en mayúscula (los correos van en minúscula)
          autoCapitalize={'none'}
          // Forzamos al teclado a que muestre la arroba (@) de forma rápida
          keyboardType="email-address"
        />

        {/* Etiqueta del segundo campo de texto */}
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          // Estilo de caja
          style={styles.input}
          // Actualizamos la variable de contraseña
          onChangeText={(text) => setPassword(text)}
          // Amarramos el estado
          value={password}
          // Convertimos las letras en puntitos ocultos para que nadie espíe
          secureTextEntry={true}
          // Ejemplo de contraseña
          placeholder="********"
          // Nada de mayúsculas automáticas
          autoCapitalize={'none'}
        />

        {/* El botón gigante para enviar todo */}
        <TouchableOpacity style={styles.button} onPress={signInWithEmail} disabled={loading}>
          {/* Si estamos en proceso mostramos un trompo cargando si no mostramos el texto */}
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Iniciar Sesión</Text>}
        </TouchableOpacity>

        {/* Sección inferior con el enlace hacia registro */}
        <View style={styles.footer}>
          {/* Texto normal */}
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          {/* Enlace enrutador de Expo que te manda a la pantalla de crear cuenta */}
          <ExpoLink href="/(auth)/register" asChild>
            {/* Hacemos que sea un botón tocable */}
            <TouchableOpacity>
              {/* Le ponemos color azul de enlace */}
              <Text style={styles.link}>Regístrate</Text>
            </TouchableOpacity>
          </ExpoLink>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Empezamos los estilos
const styles = StyleSheet.create({
  // Caja que ocupa toda la pantalla con fondo blanco
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },
  // Centramos el encabezado
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  // Letras gigantes del logo
  logo: {
    fontSize: 32,
    color: '#333',
  },
  // Palabra resaltada en el logo
  logoBold: {
    fontWeight: 'bold',
    color: '#1E3A8A', // Azul marino profesional
  },
  // Textito pequeño abajo del logo
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  // Contenedor que empuja los bordes
  formContainer: {
    width: '100%',
  },
  // Letras de las etiquetas encima de las cajas
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  // Cajas para escribir
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  // Botón grueso
  button: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  // Letras blancas dentro del botón
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Acomodo horizontal para la parte de abajo
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  // Color del texto gris
  footerText: {
    color: '#666',
  },
  // Color del enlace en azul
  link: {
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
});

// si quitas LoginScreen pasa que los usuarios que ya crearon cuenta nunca más podrán entrar y la app se volverá inútil para la gente que cerró sesión
