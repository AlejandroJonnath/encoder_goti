import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '@/shared/services/supabase';
import { Link as ExpoLink } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Colors } from '@/shared/theme/theme';
import { useCustomAlert } from '@/shared/context/AlertContext';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showAlert } = useCustomAlert();

  async function signInWithEmail() {
    if (!email || !password) {
      showAlert('Campos vacíos', 'Por favor ingresa tu correo y contraseña.', 'warning');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        showAlert(
          'Cuenta sin confirmar',
          'Esta cuenta fue creada antes de que se desactivara la confirmación de email.\n\nPor favor elimínala desde Supabase → Authentication → Users y regístrate de nuevo.',
          'warning'
        );
      } else if (error.message.toLowerCase().includes('invalid login credentials')) {
        showAlert('Credenciales incorrectas', 'El correo o la contraseña no son correctos.', 'error');
      } else {
        showAlert('Error', error.message, 'error');
      }
    }
    setLoading(false);
  }

  async function signInWithGoogle() {
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
          // Supabase devuelve tokens en el fragmento (#) de la URL, no en query params
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
              // Si no hay token en la URL, refrescar la sesión manualmente
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
            <Text style={styles.subtitle}>INICIA SESIÓN</Text>
          </View>
        </Animated.View>

        {/* Animated Form */}
        <Animated.View entering={FadeInUp.duration(1000).springify().delay(200)}>
          <View style={styles.formContainer}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.glassInputContainer}>
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
                  autoCapitalize={'none'}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={signInWithEmail}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.dark.tint, '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.neonButton}
              >
                {loading ? (
                  <ActivityIndicator color="#020617" />
                ) : (
                  <Text style={styles.buttonText}>ENTRAR</Text>
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
              onPress={signInWithGoogle}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.googleButton}>
                <Text style={styles.googleButtonIcon}>G</Text>
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </View>
            </TouchableOpacity>

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
