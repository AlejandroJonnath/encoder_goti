import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '@/shared/services/supabase';
import { Link as ExpoLink, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Colors } from '@/shared/theme/theme';
import { useCustomAlert } from '@/shared/context/AlertContext';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showAlert } = useCustomAlert();

  async function signUpWithEmail() {
    const trimmedName = fullName.trim();
    if (!trimmedName || !email || !password) {
      showAlert('Campos vacíos', 'Por favor completa todos los campos.', 'warning');
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmedName)) {
      showAlert('Nombre inválido', 'El nombre debe empezar con una letra.', 'warning');
      return;
    }
    if (password.length < 6) {
      showAlert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // 1) Validar si el nombre ya está en uso
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('full_name', trimmedName)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        showAlert('Nombre duplicado', 'Ese nombre de usuario ya está en uso.', 'warning');
        setLoading(false);
        return;
      }

      // 2) Crear cuenta
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: trimmedName,
          }
        }
      });

      if (signUpError) throw signUpError;

      // 3) Intentar login automático
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) {
        showAlert(
          '¡Cuenta creada!',
          'Tu cuenta fue creada. Por favor inicia sesión manualmente.',
          'success'
        );
        router.replace('/(auth)/login');
      }

    } catch (error: any) {
      showAlert('Error', error.message || 'Ocurrió un error al registrarse.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithGoogle() {
    setLoading(true);
    try {
      const redirectUri = makeRedirectUri({ scheme: 'encodergoti' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

        if (res.type === 'success' && res.url) {
          const returnUrl = res.url;
          const fragmentString = returnUrl.includes('#') ? returnUrl.split('#')[1] : returnUrl.split('?')[1];

          if (fragmentString) {
            const params = new URLSearchParams(fragmentString);
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');

            if (access_token) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token: refresh_token ?? '',
              });
              if (sessionError) throw sessionError;
            } else {
              await supabase.auth.refreshSession();
            }
          }
        }
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'Error con Google Auth', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={['#0F172A', '#020617']}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

        {/* Animated Header */}
        <Animated.View entering={FadeInDown.duration(800).springify()}>
          <View style={styles.headerContainer}>
            <Text style={styles.logo}>Encoder<Text style={styles.logoBold}>Goti</Text></Text>
            <Text style={styles.subtitle}>CREA UNA CUENTA NUEVA</Text>
          </View>
        </Animated.View>

        {/* Animated Form */}
        <Animated.View entering={FadeInUp.duration(1000).springify().delay(200)}>
          <View style={styles.formContainer}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOMBRE COMPLETO</Text>
              <View style={styles.glassInputContainer}>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.glassInputContainer}>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.glassInputContainer}>
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

            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={signUpWithEmail}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.light.tint, '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.neonButton}
              >
                {loading ? (
                  <ActivityIndicator color="#020617" />
                ) : (
                  <Text style={styles.buttonText}>REGISTRARSE</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>O</Text>
              <View style={styles.separatorLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButtonWrapper}
              onPress={signUpWithGoogle}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.googleButton}>
                <Text style={styles.googleButtonIcon}>G</Text>
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿YA TIENES CUENTA? </Text>
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
