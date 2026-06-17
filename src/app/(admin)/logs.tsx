import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, RefreshControl,
  Platform, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/shared/services/supabase';
import { insertLog } from '@/shared/utils/logger';
import Animated, { FadeInDown, FadeInUp, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { ClipboardList, AlertTriangle, ShieldCheck, UploadCloud, Activity, ChevronLeft, ChevronRight, Play } from 'lucide-react-native';

const ADMIN_COLOR = '#8B5CF6';
const PAGE_SIZE = 5;
const TOTAL_LOGS = 20;

type Log = {
  id: string;
  log_type: 'error' | 'admin_activity' | 'file_upload';
  message: string;
  created_at: string;
  user_id?: string | null;
};

const LOG_CONFIG = {
  error: { color: '#EF4444', label: 'ERROR', icon: (c: string) => <AlertTriangle size={18} color={c} /> },
  admin_activity: { color: '#3B82F6', label: 'ADMIN', icon: (c: string) => <ShieldCheck size={18} color={c} /> },
  file_upload: { color: '#10B981', label: 'SUBIDA', icon: (c: string) => <UploadCloud size={18} color={c} /> },
};

export default function LogsScreen() {
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [page, setPage] = useState(0); // 0-indexed
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(TOTAL_LOGS);

      if (!error && data) {
        setAllLogs(data as Log[]);
        setPage(0); // Volver a la primera página al refrescar
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const generateMockLogs = async () => {
    setRefreshing(true);
    await insertLog('admin_activity', 'El sistema ha sido inicializado por el administrador.');
    await insertLog('error', 'Fallo al procesar el documento "balance_2025.pdf".');
    await insertLog('file_upload', 'Se subió exitosamente "reporte_ventas.pdf"');
    await fetchLogs();
    setRefreshing(false);
  };

  // Paginación local
  const totalPages = Math.ceil(allLogs.length / PAGE_SIZE);
  const currentLogs = allLogs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={styles.badge}>
                <ClipboardList size={14} color={ADMIN_COLOR} />
                <Text style={styles.badgeText}>REGISTRO DE ACTIVIDAD</Text>
              </View>
              <TouchableOpacity style={styles.mockBtn} onPress={generateMockLogs} disabled={refreshing}>
                <Play size={12} color="#10B981" />
                <Text style={styles.mockBtnText}>Generar Prueba</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>
              Logs{'\n'}<Text style={styles.titleHighlight}>del Sistema</Text>
            </Text>
            <Text style={styles.subtitle}>
              {allLogs.length} registros · Mostrando {Math.min(PAGE_SIZE, currentLogs.length)} por página
            </Text>
          </View>
        </Animated.View>

        {/* Leyenda de colores */}
        <Animated.View entering={FadeInUp.duration(600).springify().delay(100)}>
          <View style={styles.legend}>
            {Object.entries(LOG_CONFIG).map(([type, cfg]) => (
              <View key={type} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
                <Text style={styles.legendText}>{cfg.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Lista de logs (página actual) */}
        <Animated.View entering={FadeInUp.duration(600).springify().delay(200)}>
          <View style={styles.logsList}>
            {loading ? (
              <Text style={styles.emptyText}>Cargando registros...</Text>
            ) : currentLogs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Activity size={40} color="#334155" />
                <Text style={styles.emptyText}>No hay registros aún</Text>
                <Text style={styles.emptySubtext}>Los eventos del sistema aparecerán aquí</Text>
              </View>
            ) : (
              currentLogs.map((log, index) => {
                const cfg = LOG_CONFIG[log.log_type] || LOG_CONFIG.error;
                return (
                  <Animated.View
                    key={log.id}
                    entering={FadeInUp.duration(400).springify().delay(index * 50)}
                  >
                    <View style={styles.logCard}>
                      {/* Línea lateral de color */}
                      <View style={[styles.colorBar, { backgroundColor: cfg.color }]} />

                      {/* Icono */}
                      <View style={[styles.iconWrap, { backgroundColor: `${cfg.color}18`, borderColor: `${cfg.color}35` }]}>
                        {cfg.icon(cfg.color)}
                      </View>

                      {/* Contenido */}
                      <View style={styles.logContent}>
                        <View style={styles.logTopRow}>
                          <View style={[styles.typeBadge, { backgroundColor: `${cfg.color}18` }]}>
                            <Text style={[styles.typeText, { color: cfg.color }]}>{cfg.label}</Text>
                          </View>
                          <Text style={styles.dateText}>{formatDate(log.created_at)}</Text>
                        </View>
                        <Text style={styles.messageText}>{log.message}</Text>
                      </View>
                    </View>
                  </Animated.View>
                );
              })
            )}
          </View>
        </Animated.View>

        {/* Controles de paginación */}
        {totalPages > 1 && (
          <Animated.View entering={FadeInUp.duration(600).springify().delay(300)}>
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, !canPrev && styles.pageBtnDisabled]}
                onPress={() => canPrev && setPage(p => p - 1)}
                disabled={!canPrev}
              >
                <ChevronLeft size={20} color={canPrev ? '#FFF' : '#475569'} />
              </TouchableOpacity>

              <View style={styles.pageInfo}>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.pageDot, i === page && styles.pageDotActive]}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.pageBtn, !canNext && styles.pageBtnDisabled]}
                onPress={() => canNext && setPage(p => p + 1)}
                disabled={!canNext}
              >
                <ChevronRight size={20} color={canNext ? '#FFF' : '#475569'} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {totalPages > 0 && (
          <Text style={styles.pageCounter}>
            Página {page + 1} de {totalPages} · {allLogs.length} registros totales
          </Text>
        )}

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
  header: { marginBottom: 20 },
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
  mockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 6,
  },
  mockBtnText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  badgeText: {
    color: '#8B5CF6',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginLeft: 6,
  },
  title: {
    fontSize: 34,
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  titleHighlight: { color: '#8B5CF6' },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
  },
  legend: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  logsList: { gap: 10, marginBottom: 24 },
  emptyContainer: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { color: '#475569', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { color: '#334155', fontSize: 13, textAlign: 'center' },
  logCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    alignItems: 'center',
    gap: 12,
    paddingRight: 16,
    paddingVertical: 14,
  },
  colorBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 4,
    flexShrink: 0,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  logContent: { flex: 1 },
  logTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  dateText: { fontSize: 11, color: '#475569' },
  messageText: { fontSize: 13, color: '#CBD5E1', lineHeight: 18 },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pageBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  pageBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  pageInfo: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  pageDotActive: {
    backgroundColor: ADMIN_COLOR,
    width: 20,
    borderRadius: 4,
  },
  pageCounter: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 12,
    marginBottom: 8,
  },
});
