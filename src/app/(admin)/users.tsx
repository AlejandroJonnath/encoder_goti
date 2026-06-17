import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, RefreshControl,
  Platform, TouchableOpacity, Alert, ActivityIndicator,
  TextInput, Modal, KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/shared/services/supabase';
import { insertLog } from '@/shared/utils/logger';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Users, ShieldCheck, UserCheck, Edit2, Trash2, X, Check } from 'lucide-react-native';

const ADMIN_COLOR = '#8B5CF6';

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  created_at: string;
};

export default function UsersScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal de edición
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'client'>('client');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) setProfiles(data as Profile[]);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const openEditModal = (profile: Profile) => {
    setSelectedUser(profile);
    setEditName(profile.full_name || '');
    setEditRole((profile.role as 'admin' | 'client') || 'client');
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setEditName('');
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editName,
        role: editRole
      })
      .eq('id', selectedUser.id);

    if (!error) {
      setProfiles(prev =>
        prev.map(p => p.id === selectedUser.id ? { ...p, full_name: editName, role: editRole } : p)
      );
      closeEditModal();
      await insertLog('admin_activity', `Perfil editado: ${selectedUser.email} (Rol: ${editRole})`);
    } else {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    }
    setSaving(false);
  };

  const confirmDelete = (profile: Profile) => {
    Alert.alert(
      'Eliminar Perfil',
      `¿Estás seguro de eliminar el perfil de ${profile.email}? (Esto no elimina su cuenta de autenticación por seguridad, solo sus datos de perfil).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('profiles')
              .delete()
              .eq('id', profile.id);

            if (!error) {
              setProfiles(prev => prev.filter(p => p.id !== profile.id));
              closeEditModal();
              await insertLog('admin_activity', `Perfil eliminado de perfiles: ${profile.email}`);
            } else {
              Alert.alert('Error', 'No se pudo eliminar el perfil.');
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (email) return email[0].toUpperCase();
    return '?';
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ADMIN_COLOR} />}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Users size={14} color={ADMIN_COLOR} />
              <Text style={styles.badgeText}>GESTIÓN DE USUARIOS</Text>
            </View>
            <Text style={styles.title}>
              Cuentas{'\n'}<Text style={styles.titleHighlight}>Registradas</Text>
            </Text>
            <Text style={styles.subtitle}>{profiles.length} usuarios en total · Toca un usuario para editar</Text>
          </View>
        </Animated.View>

        {loading ? (
          <ActivityIndicator color={ADMIN_COLOR} size="large" style={{ marginTop: 40 }} />
        ) : (
          profiles.map((profile, index) => (
            <Animated.View
              key={profile.id}
              entering={FadeInUp.duration(500).springify().delay(index * 60)}
            >
              <View>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => openEditModal(profile)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={profile.role === 'admin'
                      ? ['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)']
                      : ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.1)']}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>
                      {getInitials(profile.full_name, profile.email)}
                    </Text>
                  </LinearGradient>

                  <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{profile.full_name || 'Sin nombre'}</Text>
                    <Text style={styles.email} numberOfLines={1}>{profile.email || 'Sin email'}</Text>
                    <Text style={styles.date}>{formatDate(profile.created_at)}</Text>
                  </View>

                  <View style={styles.right}>
                    <View style={[styles.roleBadge, profile.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeClient]}>
                      {profile.role === 'admin' ? <ShieldCheck size={12} color="#8B5CF6" /> : <UserCheck size={12} color="#10B981" />}
                      <Text style={[styles.roleText, { color: profile.role === 'admin' ? '#8B5CF6' : '#10B981' }]}>
                        {profile.role === 'admin' ? 'Admin' : 'Cliente'}
                      </Text>
                    </View>
                    <Edit2 size={16} color="#64748B" style={{ marginTop: 6 }} />
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* MODAL DE EDICIÓN (CRUD) */}
      <Modal visible={!!selectedUser} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Usuario</Text>
              <TouchableOpacity onPress={closeEditModal} style={styles.closeBtn}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Correo Electrónico (No editable)</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={selectedUser?.email || ''}
                editable={false}
              />

              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Ej. Juan Pérez"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Rol en el sistema</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[styles.roleOption, editRole === 'client' && styles.roleOptionClientActive]}
                  onPress={() => setEditRole('client')}
                >
                  <UserCheck size={18} color={editRole === 'client' ? '#10B981' : '#64748B'} />
                  <Text style={[styles.roleOptionText, editRole === 'client' && { color: '#10B981' }]}>Cliente</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleOption, editRole === 'admin' && styles.roleOptionAdminActive]}
                  onPress={() => setEditRole('admin')}
                >
                  <ShieldCheck size={18} color={editRole === 'admin' ? '#8B5CF6' : '#64748B'} />
                  <Text style={[styles.roleOptionText, editRole === 'admin' && { color: '#8B5CF6' }]}>Administrador</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => selectedUser && confirmDelete(selectedUser)}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={saveUserChanges} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Check size={18} color="#FFF" />
                    <Text style={styles.saveBtnText}>Guardar Cambios</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
  },
  header: { marginBottom: 28 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  badgeText: { color: '#8B5CF6', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginLeft: 6 },
  title: { fontSize: 34, color: '#FFF', fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed', letterSpacing: -0.5, lineHeight: 38 },
  titleHighlight: { color: '#8B5CF6' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 14,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '700', color: '#F1F5F9', marginBottom: 2 },
  email: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  date: { fontSize: 11, color: '#475569' },
  right: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  roleBadgeAdmin: { backgroundColor: 'rgba(139, 92, 246, 0.15)', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)' },
  roleBadgeClient: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  roleText: { fontSize: 11, fontWeight: '700' },
  
  // Modal styles
  modalBg: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  closeBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  modalBody: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 8, letterSpacing: 0.5 },
  input: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, color: '#FFF', padding: 16, fontSize: 15, marginBottom: 20 },
  inputDisabled: { opacity: 0.5, color: '#94A3B8' },
  roleSelector: { flexDirection: 'row', gap: 12 },
  roleOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' },
  roleOptionText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  roleOptionClientActive: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  roleOptionAdminActive: { borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.1)' },
  modalFooter: { flexDirection: 'row', gap: 12 },
  deleteBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', justifyContent: 'center', alignItems: 'center' },
  saveBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: ADMIN_COLOR, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
