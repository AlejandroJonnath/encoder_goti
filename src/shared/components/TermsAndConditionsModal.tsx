// SECCION DE IMPORTACIONES
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from 'react-native';

// Altura real de la pantalla para calcular el tamaño del modal
const SCREEN_HEIGHT = Dimensions.get('window').height;
// Fondo degradado oscuro
import { LinearGradient } from 'expo-linear-gradient';
// Icono de escudo legal
import { ShieldCheck, X, CheckCircle2 } from 'lucide-react-native';
// Animación de entrada
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

// Sección: Modal de Términos y Condiciones que aparece después del login
// Funciones: onAccept se llama cuando el usuario pulsa Aceptar, onReject cuando pulsa Rechazar (hace signOut y vuelve al login)

interface Props {
  // Controla la visibilidad del modal
  visible: boolean;
  // Función que ejecuta la pantalla padre al aceptar los términos
  onAccept: () => Promise<void> | void;
  // Función que ejecuta la pantalla padre al rechazar (hace signOut y redirige al login)
  onReject: () => Promise<void> | void;
}

// FUNCION: TermsAndConditionsModal
// Modal pantalla completa que muestra los términos legales y requiere aceptación explícita para continuar
export function TermsAndConditionsModal({ visible, onAccept, onReject }: Props) {
  // Si la acción de aceptar/rechazar está en proceso
  const [loading, setLoading] = useState(false);
  // Si el usuario llegó hasta el final del scroll (para habilitar el botón de aceptar)
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  // Referencia al ScrollView para poder controlar el scroll programáticamente
  const scrollRef = useRef<ScrollView>(null);

  // FUNCION: handleAccept
  // Registra la aceptación y notifica al padre
  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept();
    } finally {
      setLoading(false);
    }
  };

  // FUNCION: handleReject
  // Cierra la sesión y redirige al login
  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject();
    } finally {
      setLoading(false);
    }
  };

  // FUNCION: handleScroll
  // Detecta si el usuario llegó al final del contenido para habilitar el botón de aceptar
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    // Si la distancia desde el top + la altura visible llega al 90% del contenido total, habilita el botón
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 60;
    if (isNearBottom && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
    }
  };

  return (
    // El modal ocupa toda la pantalla con fondo semitransparente oscuro
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      {/* Fondo degradado oscuro que cubre toda la pantalla */}
      <LinearGradient
        colors={['rgba(2,6,23,0.97)', 'rgba(15,23,42,0.99)']}
        style={styles.overlay}
      >
        {/* La tarjeta central con altura fija en píxeles para que el ScrollView tenga espacio real */}
        <Animated.View
          entering={FadeInUp.duration(500).springify()}
          style={[styles.card, { height: SCREEN_HEIGHT * 0.9 }]}
        >

          {/* Encabezado del modal con icono y título */}
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
            style={styles.header}
          >
            {/* Círculo del icono de escudo */}
            <View style={styles.iconWrap}>
              <ShieldCheck size={30} color="#8B5CF6" />
            </View>

            {/* Título y subtítulo del encabezado */}
            <View style={styles.headerText}>
              <Text style={styles.title}>Términos y Condiciones</Text>
              <Text style={styles.subtitle}>
                Por favor lee y acepta para continuar usando EncoderGoti
              </Text>
            </View>
          </LinearGradient>

          {/* Indicador de que debe hacer scroll para leer todo */}
          {!hasScrolledToEnd && (
            <Animated.View entering={FadeInDown.duration(400).delay(800)} style={styles.scrollHint}>
              <Text style={styles.scrollHintText}>↓ Desplázate para leer el contenido completo</Text>
            </Animated.View>
          )}

          {/* Contenido legal scrolleable */}
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* ─────────────── 1. POLÍTICA DE PRIVACIDAD ─────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionBadge} />
                <Text style={styles.sectionTitle}>1. Política de Privacidad</Text>
              </View>

              <Text style={styles.body}>
                En <Text style={styles.highlight}>EncoderGoti</Text>, tu privacidad es una prioridad fundamental. Esta política describe cómo tratamos la información que nos confías al usar nuestra plataforma.
              </Text>

              <Text style={styles.subTitle}>1.1 Deslinde de Responsabilidad Legal</Text>
              <Text style={styles.body}>
                La plataforma EncoderGoti actúa exclusivamente como una herramienta de procesamiento y gestión de documentos. <Text style={styles.highlight}>No asumimos responsabilidad alguna</Text> por la veracidad, exactitud, autenticidad o validez legal del contenido cargado, generado o manipulado por los usuarios.
              </Text>
              <Text style={styles.body}>
                Cualquier información, documento, dato o resultado producido a través de la plataforma se entiende como de carácter estrictamente informativo y operativo. <Text style={styles.warning}>No constituye asesoría legal, financiera, médica ni de ninguna índole formal o vinculante.</Text>
              </Text>

              <Text style={styles.subTitle}>1.2 Uso Bajo Propia Responsabilidad</Text>
              <Text style={styles.body}>
                El usuario acepta que el uso de la plataforma y de sus resultados es bajo su exclusiva responsabilidad. EncoderGoti, sus desarrolladores, colaboradores y administradores quedan expresamente exentos de cualquier reclamo, demanda, litigio o consecuencia legal derivada de:
              </Text>
              {[
                'El uso inadecuado, doloso o negligente de la plataforma por parte del usuario.',
                'La inexactitud o falsedad de documentos o información suministrada por el usuario.',
                'Decisiones tomadas con base en los resultados generados por la plataforma.',
                'Pérdida de datos por fallos ajenos a nuestro control (red, dispositivo, fuerza mayor).',
              ].map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}

              <Text style={styles.subTitle}>1.3 Indemnidad</Text>
              <Text style={styles.body}>
                Al aceptar estos términos, el usuario se compromete a mantener indemne a EncoderGoti y a sus representantes frente a cualquier reclamación, daño, perjuicio, pérdida, costo o gasto (incluyendo honorarios legales razonables) que surja del uso de la plataforma o de la violación de estos Términos y Condiciones.
              </Text>
            </View>

            {/* ─────────────── 2. POLÍTICA DE RECOLECCIÓN DE DATOS ─────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionBadge, { backgroundColor: '#06B6D4' }]} />
                <Text style={styles.sectionTitle}>2. Política de Recolección y Tratamiento de Datos</Text>
              </View>

              <Text style={styles.subTitle}>2.1 Datos que Recolectamos</Text>
              <Text style={styles.body}>
                Para el correcto funcionamiento de la plataforma, recolectamos y almacenamos la siguiente información:
              </Text>
              {[
                'Dirección de correo electrónico (para autenticación y comunicaciones de la cuenta).',
                'Nombre completo o nombre de usuario (para identificación dentro del sistema).',
                'Registros de actividad de sesión como fecha de ingreso, acciones realizadas y rol asignado.',
                'Archivos y documentos cargados para procesamiento, codificación o gestión dentro de la plataforma.',
                'Metadatos técnicos como tipo de dispositivo, sistema operativo y versión de la app.',
              ].map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}

              <Text style={styles.subTitle}>2.2 Finalidad del Tratamiento de Datos</Text>
              <Text style={styles.body}>
                Los datos recolectados son utilizados <Text style={styles.highlight}>exclusivamente</Text> para las siguientes finalidades:
              </Text>
              {[
                'Autenticación segura y control de acceso basado en roles (cliente / administrador).',
                'Personalización de la experiencia de usuario dentro de la plataforma.',
                'Ejecución y entrega de los servicios de procesamiento y gestión de documentos.',
                'Mejora continua de la plataforma mediante análisis anónimos de uso.',
                'Cumplimiento de obligaciones legales o requerimientos de autoridades competentes cuando corresponda.',
              ].map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}

              <Text style={styles.subTitle}>2.3 No Comercialización de Datos</Text>
              <Text style={styles.body}>
                <Text style={styles.highlight}>EncoderGoti NO vende, arrienda, intercambia ni transfiere</Text> tus datos personales ni los documentos que procesas a entidades de publicidad, brokers de datos u otros terceros sin tu consentimiento explícito. El acceso a los datos está estrictamente limitado al equipo técnico autorizado con fines operativos y de soporte.
              </Text>

              <Text style={styles.subTitle}>2.4 Seguridad de los Datos</Text>
              <Text style={styles.body}>
                Implementamos medidas técnicas y organizativas adecuadas para proteger tu información contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye cifrado en tránsito (HTTPS/TLS) y en reposo, así como control de acceso estricto por roles.
              </Text>
            </View>

            {/* ─────────────── 3. USO DE INTELIGENCIA ARTIFICIAL ─────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionBadge, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.sectionTitle}>3. Uso de Inteligencia Artificial</Text>
              </View>

              <Text style={styles.body}>
                EncoderGoti integra servicios de <Text style={styles.highlight}>Inteligencia Artificial (IA)</Text> de terceros para potenciar sus funcionalidades de análisis y procesamiento inteligente de texto y documentos.
              </Text>

              <Text style={styles.subTitle}>3.1 Groq AI</Text>
              <Text style={styles.body}>
                La plataforma utiliza la infraestructura de modelos de lenguaje acelerados por hardware de <Text style={styles.highlight}>Groq, Inc.</Text> para las siguientes funcionalidades:
              </Text>
              {[
                'Análisis y comprensión avanzada de texto dentro de documentos cargados.',
                'Extracción inteligente de información clave (campos, datos estructurados).',
                'Resumen automático y síntesis de contenidos extensos.',
                'Optimización, reescritura y mejora del lenguaje en documentos generados.',
                'Respuestas asistidas basadas en el contexto del contenido procesado.',
              ].map((item, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}

              <Text style={styles.body}>
                Las solicitudes enviadas a Groq se procesan en tiempo real con el único propósito de retornar el resultado solicitado. <Text style={styles.highlight}>No autorizamos ni consentimos el uso de tus datos o documentos para el entrenamiento de modelos de IA públicos</Text> por parte de proveedores externos.
              </Text>
              <Text style={styles.body}>
                Al usar las funciones de IA de la plataforma, el usuario acepta que el contenido procesado puede ser transmitido a los servidores de Groq bajo las condiciones de su propia política de privacidad: <Text style={styles.link}>groq.com/privacy</Text>
              </Text>
            </View>

            {/* ─────────────── 4. SERVICIOS DE TERCEROS ─────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionBadge, { backgroundColor: '#10B981' }]} />
                <Text style={styles.sectionTitle}>4. Servicios de Terceros</Text>
              </View>

              <Text style={styles.body}>
                Para operar de forma segura, escalable y confiable, EncoderGoti hace uso de los siguientes proveedores de servicios externos:
              </Text>

              <Text style={styles.subTitle}>4.1 Supabase (Base de Datos y Autenticación)</Text>
              <Text style={styles.body}>
                Utilizamos <Text style={styles.highlight}>Supabase</Text> como proveedor de base de datos en la nube y sistema de autenticación segura. Supabase almacena y gestiona los perfiles de usuario, credenciales cifradas y registros de datos bajo estándares de seguridad de nivel empresarial (cifrado AES-256, tokens JWT). Supabase opera bajo su propia política de privacidad y seguridad disponible en <Text style={styles.link}>supabase.com/privacy</Text>.
              </Text>

              <Text style={styles.subTitle}>4.2 DocuSeal (Gestión de Documentos y Firma Digital)</Text>
              <Text style={styles.body}>
                La plataforma puede integrar servicios de <Text style={styles.highlight}>DocuSeal</Text> para la gestión de flujos de documentos electrónicos y firma digital. Los documentos procesados a través de DocuSeal operan bajo sus propias condiciones de privacidad y seguridad. Los datos son transmitidos mediante conexiones cifradas y son tratados con el mismo nivel de confidencialidad descrito en esta política.
              </Text>

              <Text style={styles.subTitle}>4.3 Responsabilidad sobre Terceros</Text>
              <Text style={styles.body}>
                EncoderGoti actúa como intermediario en el uso de los servicios de terceros descritos. Si bien seleccionamos proveedores con altos estándares de seguridad y privacidad, <Text style={styles.warning}>no asumimos responsabilidad directa por fallos, brechas o cambios en las políticas de dichos proveedores externos.</Text> En caso de incidentes, se notificará a los usuarios afectados a la brevedad.
              </Text>
            </View>

            {/* ─────────────── 5. MODIFICACIONES ─────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionBadge, { backgroundColor: '#EC4899' }]} />
                <Text style={styles.sectionTitle}>5. Modificaciones a los Términos</Text>
              </View>
              <Text style={styles.body}>
                EncoderGoti se reserva el derecho de actualizar estos Términos y Condiciones en cualquier momento. Los cambios materiales serán notificados a través de la aplicación. El uso continuado de la plataforma tras las modificaciones implica la aceptación de los nuevos términos.
              </Text>
              <Text style={styles.body}>
                Para consultas, comentarios o ejercicio de derechos sobre tus datos personales, puedes comunicarte con nuestro equipo a través de los canales oficiales de EncoderGoti.
              </Text>
            </View>

            {/* Marca de fin del documento */}
            <View style={styles.endMark}>
              <CheckCircle2 size={20} color="#8B5CF6" />
              <Text style={styles.endMarkText}>Fin del documento — Última actualización: Septiembre 2026</Text>
            </View>
          </ScrollView>

          {/* Indicador si no ha scrolleado al final */}
          {!hasScrolledToEnd && (
            <View style={styles.scrollNotice}>
              <Text style={styles.scrollNoticeText}>
                Lee el documento completo para habilitar el botón de aceptar
              </Text>
            </View>
          )}

          {/* Botones de acción en la parte inferior */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.actions}>
            {/* Botón de Rechazar */}
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={handleReject}
              disabled={loading}
            >
              <X size={16} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.rejectText}>Rechazar</Text>
            </TouchableOpacity>

            {/* Botón de Aceptar (se activa solo al llegar al final del scroll) */}
            <TouchableOpacity
              style={[
                styles.acceptBtn,
                !hasScrolledToEnd && styles.acceptBtnDisabled,
              ]}
              onPress={handleAccept}
              disabled={loading || !hasScrolledToEnd}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <CheckCircle2 size={16} color={hasScrolledToEnd ? '#FFF' : 'rgba(255,255,255,0.4)'} style={{ marginRight: 6 }} />
                  <Text style={[styles.acceptText, !hasScrolledToEnd && styles.acceptTextDisabled]}>
                    Aceptar y Continuar
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

        </Animated.View>
      </LinearGradient>
    </Modal>
  );
}

// SECCION DE ESTILOS
const styles = StyleSheet.create({
  // El fondo oscuro que cubre toda la pantalla
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  // La tarjeta principal del modal — la altura real se inyecta como inline style
  card: {
    width: '100%',
    backgroundColor: '#0D1526',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
    // Obligamos a que los hijos (header, scroll, actions) se apilen verticalmente
    flexDirection: 'column',
  },
  // El encabezado con degradado morado tenue
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
    gap: 14,
  },
  // El círculo del icono de escudo
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  // Contenedor del texto del header
  headerText: {
    flex: 1,
  },
  // El título grande del modal
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  // El subtítulo gris explicativo del header
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  // El aviso de que hay que bajar el scroll
  scrollHint: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  // El texto del aviso de scroll
  scrollHintText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
  // El ScrollView que contiene todo el texto legal
  scrollView: {
    flex: 1,
  },
  // El padding interno del scroll
  scrollContent: {
    padding: 20,
    paddingBottom: 8,
  },
  // Cada sección del documento legal
  section: {
    marginBottom: 28,
  },
  // Fila que contiene el badge de color y el título de la sección
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  // El cuadradito de color que identifica cada sección visualmente
  sectionBadge: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
  },
  // El título de cada sección en blanco y bold
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F1F5F9',
    flex: 1,
  },
  // Los subtítulos dentro de cada sección
  subTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 14,
    marginBottom: 6,
  },
  // El texto de cuerpo del documento
  body: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 21,
    marginBottom: 8,
  },
  // Texto destacado en color claro
  highlight: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  // Texto de advertencia en amarillo
  warning: {
    color: '#FBBF24',
    fontWeight: '600',
  },
  // Texto de enlace en morado
  link: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  // Fila de viñeta con punto y texto
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 4,
  },
  // El punto de la viñeta
  bullet: {
    color: '#8B5CF6',
    fontSize: 14,
    lineHeight: 21,
    marginRight: 8,
    fontWeight: '700',
  },
  // El texto de la viñeta
  bulletText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 21,
    flex: 1,
  },
  // La marca de fin del documento
  endMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    marginTop: 8,
  },
  // El texto de la marca de fin
  endMarkText: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
  },
  // Aviso de que debe leer el documento completo
  scrollNotice: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  // Texto del aviso de lectura obligatoria
  scrollNoticeText: {
    fontSize: 11,
    color: '#F87171',
    fontWeight: '500',
  },
  // Contenedor de los dos botones de acción
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  // Botón de rechazar (rojo translúcido)
  rejectBtn: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  // Texto del botón rechazar
  rejectText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  // Botón de aceptar (morado sólido cuando está habilitado)
  acceptBtn: {
    flex: 2,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
  },
  // Estado deshabilitado del botón aceptar (opaco)
  acceptBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
  },
  // Texto del botón aceptar habilitado
  acceptText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // Texto del botón aceptar cuando está deshabilitado (más opaco)
  acceptTextDisabled: {
    color: 'rgba(255,255,255,0.35)',
  },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas handleAccept? pasa que el botón de aceptar no ejecuta nada y el usuario nunca puede guardar su aceptación ni acceder a la app
// para solucionarlo vuelve a agregar la función que llama a onAccept y gestiona el estado loading
// ¿qué pasa si quitas handleScroll? pasa que el botón de aceptar nunca se habilita porque hasScrolledToEnd permanece en false
// para solucionarlo vuelve a agregar el manejador que calcula si el scroll llegó al 90% del contenido total
