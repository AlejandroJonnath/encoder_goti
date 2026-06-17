import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { supabase } from '@/shared/services/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Props {
  visible: boolean;
  userId: string;
  onCompleted: (newName: string) => void;
}

export function CompleteProfileModal({ visible, userId, onCompleted }: Props) {
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }

    // 1) Debe empezar con una letra (incluye tildes y ñ)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmedName)) {
      setErrorMsg('El nombre debe empezar con una letra.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      // 2) Verificar si el nombre ya existe en la base de datos
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('full_name', trimmedName)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        setErrorMsg('No puedes poner este nombre de usuario. Ya está en uso.');
        setSaving(false);
        return;
      }

      // 3) Guardar el nuevo nombre
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: trimmedName })
        .eq('id', userId);

      if (error) throw error;
      onCompleted(trimmedName);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setErrorMsg('Hubo un error al guardar tu nombre. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={['rgba(2,6,23,0.95)', 'rgba(15,23,42,0.98)']} style={StyleSheet.absoluteFill} />
        
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.card}>
          <View style={styles.iconWrap}>
            <User size={32} color="#8B5CF6" />
          </View>
          
          <Text style={styles.title}>¡Bienvenido a EncoderGoti!</Text>
          <Text style={styles.subtitle}>
            Para continuar, por favor ingresa tu nombre completo para configurar tu cuenta.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor="#64748B"
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                setErrorMsg('');
              }}
              autoCapitalize="words"
            />
            {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !fullName.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving || !fullName.trim()}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Guardar y Continuar</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  saveBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
