import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionAuth } from '@/features/auth/hooks/useSessionAuth';
import { supabase } from '@/shared/services/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/shared/theme/theme';
import { LogOut, User as UserIcon } from 'lucide-react-native';
import { useCustomAlert } from '@/shared/context/AlertContext';

export default function ProfileScreen() {
  const { user } = useSessionAuth();
  const { showAlert } = useCustomAlert();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showAlert('Error', error.message, 'error');
    }
  }

  return (
    <LinearGradient
      colors={['#0F172A', '#020617']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <Text style={styles.title}>MI PERFIL</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(200).springify()} style={styles.content}>
          
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[Colors.dark.tint, Colors.light.tint]}
              style={styles.avatarRing}
            >
              <View style={styles.avatarInner}>
                <UserIcon size={48} color="#F8FAFC" />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.infoCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut color="#EF4444" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
          </TouchableOpacity>

        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#020617',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 24,
    borderRadius: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  label: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  value: {
    fontSize: 18,
    color: '#F8FAFC',
    fontWeight: '700',
  },
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
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
