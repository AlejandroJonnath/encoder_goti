import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/shared/services/supabase';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Users, FileText, ShieldCheck, UserCheck } from 'lucide-react-native';

const ADMIN_COLOR = '#8B5CF6';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    clients: 0,
    admins: 0,
    totalDocs: 0,
  });

  const fetchStats = async () => {
    try {
      // Contar todos los usuarios con su rol
      const { data: profiles } = await supabase
        .from('profiles')
        .select('role');

      if (profiles) {
        const clients = profiles.filter(p => p.role === 'client' || p.role === null).length;
        const admins = profiles.filter(p => p.role === 'admin').length;
        setStats(prev => ({
          ...prev,
          totalUsers: profiles.length,
          clients,
          admins,
        }));
      }

      // Contar documentos
      const { count: docCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      if (docCount !== null) {
        setStats(prev => ({ ...prev, totalDocs: docCount }));
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ADMIN_COLOR} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <ShieldCheck size={14} color={ADMIN_COLOR} />
              <Text style={styles.badgeText}>PANEL ADMINISTRATIVO</Text>
            </View>
            <Text style={styles.title}>
              Dashboard{'\n'}<Text style={styles.titleHighlight}>General</Text>
            </Text>
            <Text style={styles.subtitle}>Vista general del sistema EncoderGoti</Text>
          </View>
        </Animated.View>

        {/* Stats grid */}
        <Animated.View entering={FadeInUp.duration(700).springify().delay(100)}>
          <View style={styles.grid}>

          {/* Total usuarios */}
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.12)', 'rgba(139, 92, 246, 0.04)']}
            style={[styles.card, styles.cardWide]}
          >
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
              <Users size={24} color={ADMIN_COLOR} />
            </View>
            <Text style={styles.cardNumber}>{stats.totalUsers}</Text>
            <Text style={styles.cardLabel}>Usuarios Totales</Text>
          </LinearGradient>

          {/* Clientes */}
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.04)']}
            style={styles.card}
          >
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <UserCheck size={20} color="#10B981" />
            </View>
            <Text style={styles.cardNumber}>{stats.clients}</Text>
            <Text style={styles.cardLabel}>Clientes</Text>
          </LinearGradient>

          {/* Admins */}
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.12)', 'rgba(245, 158, 11, 0.04)']}
            style={styles.card}
          >
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <ShieldCheck size={20} color="#F59E0B" />
            </View>
            <Text style={styles.cardNumber}>{stats.admins}</Text>
            <Text style={styles.cardLabel}>Admins</Text>
          </LinearGradient>

          {/* Documentos */}
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.12)', 'rgba(59, 130, 246, 0.04)']}
            style={[styles.card, styles.cardWide]}
          >
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <FileText size={24} color="#3B82F6" />
            </View>
            <Text style={styles.cardNumber}>{stats.totalDocs}</Text>
            <Text style={styles.cardLabel}>Documentos Procesados</Text>
          </LinearGradient>

          </View>
        </Animated.View>

        {/* Desglose de usuarios */}
        <Animated.View entering={FadeInUp.duration(700).springify().delay(250)}>
          <View style={styles.breakdown}>
            <Text style={styles.breakdownTitle}>Distribución de Usuarios</Text>

          {/* Barra de progreso visual */}
          <View style={styles.barContainer}>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: stats.totalUsers > 0
                      ? `${(stats.clients / stats.totalUsers) * 100}%`
                      : '0%',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Clientes ({stats.clients})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Admins ({stats.admins})</Text>
            </View>
          </View>
        </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
  },
  header: { marginBottom: 32 },
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
  badgeText: {
    color: '#8B5CF6',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginLeft: 6,
  },
  title: {
    fontSize: 36,
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  titleHighlight: { color: '#8B5CF6' },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardWide: {
    minWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  breakdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
  },
  barContainer: { marginBottom: 16 },
  barBackground: {
    height: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 10,
  },
  legendRow: { flexDirection: 'row', gap: 24 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: '#94A3B8', fontSize: 13 },
});
