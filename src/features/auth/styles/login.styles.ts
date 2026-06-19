// SECCION DE IMPORTACIONES
// Importamos React Native para los estilos
import { StyleSheet, Platform } from 'react-native';
// Importamos los colores globales del tema
import { Colors } from '@/shared/theme/theme';

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

export default styles;
