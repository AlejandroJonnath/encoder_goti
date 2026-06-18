// SECCION DE IMPORTACIONES
// Importamos Stack renacido como ExpoStack para toquetear la barra del celular
import { Stack as ExpoStack } from "expo-router";
// Nos traemos una carretada de iconos para dejar nuestra interfaz guapetona
import {
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  FileSignature,
  FileText,
  FolderLock,
  Key,
  Lock,
  UploadCloud,
} from "lucide-react-native";
// Traemos React junto al rey de los estados locales
import React, { useState } from "react";
// Sacamos todas las piezas de lego nativas necesarias para pintar cosas en pantalla
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Importamos esto para no tapar la cámara frontal de los iPhone con nuestro código
import { SafeAreaView } from "react-native-safe-area-context";
// Paquete adicional para esa barrita arrastrable bonita
import Slider from "@react-native-community/slider";
// Nos conectamos a nuestra caja de magia oscura que hace los cálculos de firma
import { usePdfSignature } from "@/features/pdf/sign/hooks/usePdfSignature";

// Sección: Pantalla de Firma Electrónica Criptográfica Real de Ecuador (.p12 / .pfx)

// FUNCION: SignScreen
// Este es el mamotreto principal que verán los usuarios al intentar firmar un contrato
export default function SignScreen() {
  // Sacamos cada maldito control o pedazo de dato de nuestra lógica externa
  const {
    pdfFile,
    p12File,
    p12Password,
    signerName,
    issuerName,
    serialNumber,
    isValidCert,
    posX,
    posY,
    scaleWidth,
    pageNumber,
    totalPages,
    processing,
    completed,
    resultUri,
    setP12Password,
    setPosX,
    setPosY,
    setScaleWidth,
    setPageNumber,
    pickPdf,
    pickP12File,
    loadAndValidateP12,
    executeSignature,
    shareFile,
    setCompleted,
    setPdfFile,
    setP12File,
    setIsValidCert,
  } = usePdfSignature();

  // Bandera local simple para ocultar o mostrar asteriscos en la contraseña
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Árbol gigantesco de componentes
  return (
    // Área que esquiva esquinas de celulares
    <SafeAreaView style={styles.container}>
      {/* Pintamos nuestro título y el colorcillo que manda en la cabecera */}
      <ExpoStack.Screen
        options={{
          headerTitle: "Firma Electrónica",
          headerTintColor: "#1E3A8A",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      {/* Usamos scrollview porque esta chingadera es muy larga y no cabrá en pantallas chicas */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Bifurcación 1 */}
        {/* ¿Todavía no escogen PDF base? */}
        {!pdfFile ? (
          // Centramos todo a la fuerza
          <View style={styles.centerContainer}>
            {/* El botón enoooorme para iniciar todo */}
            <TouchableOpacity style={styles.uploadCard} onPress={pickPdf}>
              {/* Nube con esteroides */}
              <UploadCloud size={80} color="#1E3A8A" style={{ marginBottom: 16 }} />
              {/* Instrucción gorda */}
              <Text style={styles.uploadTitle}>Seleccionar Documento PDF</Text>
              {/* Instrucción delgadita */}
              <Text style={styles.uploadSubtitle}>Elige el archivo que deseas firmar criptográficamente</Text>
              {/* Una simple pastillita visual para darle elegancia */}
              <View style={styles.badgeBlue}>
                <Text style={styles.badgeTextBlue}>Documento PDF</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : completed ? (
          // Bifurcación 2
          // ¿Ya ganamos y terminó el proceso con éxito?
          <View style={styles.completedContainer}>
            {/* Super tarjeta de victoria */}
            <View style={styles.successCard}>
              {/* Fondo suavecito verde para el logo */}
              <View style={styles.successIconCircle}>
                <CheckCircle size={72} color="#10B981" />
              </View>
              {/* Letras de festejo */}
              <Text style={styles.successTitle}>¡Documento Firmado!</Text>
              <Text style={styles.successSubtitle}>
                El PDF ha sido firmado y validado criptográficamente usando tu firma electrónica digital real (.p12).
              </Text>

              {/* El desglose de quién chingados firmó este papel */}
              <View style={styles.metadataBox}>
                <Text style={styles.metaLabel}>Información del Certificado Firmado:</Text>
                {/* Mostramos el nombre robado del certificado */}
                <Text style={styles.metaText}><Text style={{ fontWeight: "bold" }}>Firmante (CN):</Text> {signerName}</Text>
                {/* Y la compañía */}
                <Text style={styles.metaText}><Text style={{ fontWeight: "bold" }}>Emisor (CA):</Text> {issuerName}</Text>
                {/* Su huella */}
                <Text style={styles.metaText}><Text style={{ fontWeight: "bold" }}>Nº Serie:</Text> {serialNumber || "N/A"}</Text>
              </View>

              {/* El botón para compartir en whatsapp u otras apps */}
              <TouchableOpacity style={styles.primaryActionButton} onPress={shareFile}>
                <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                <Text style={styles.primaryActionText}>Compartir / Guardar PDF</Text>
              </TouchableOpacity>

              {/* Si quieren otra vuelta en la feria reseteamos todo */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setPdfFile(null);
                  setP12File(null);
                  setP12Password("");
                  setCompleted(false);
                  setIsValidCert(false);
                }}
              >
                <Text style={styles.secondaryButtonText}>Firmar otro documento</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Bifurcación 3
          // El menú perrón lleno de configuraciones
          <View style={styles.formContainer}>
            {/* Header del documento recordando cuál vamos a rayar */}
            <View style={styles.pdfHeaderCard}>
              <FileText size={32} color="#1E3A8A" style={{ marginRight: 12 }} />
              {/* El bloque flexible para que quepa el nombre largo */}
              <View style={{ flex: 1 }}>
                {/* Nombre de archivo topado a un renglón */}
                <Text style={styles.pdfName} numberOfLines={1}>{pdfFile.name}</Text>
                {/* Info de relleno que le avisa cuántas hojas va a manchar */}
                <Text style={styles.pdfPagesCount}>
                  Documento cargado • {totalPages} {totalPages === 1 ? "página" : "páginas"}
                </Text>
              </View>
            </View>

            {/* Zona 1: Meterle candela a la firma */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>1. Firma Electrónica (.p12 / .pfx)</Text>

              {/* Si no han seleccionado la cajita de su certificado */}
              {!p12File ? (
                // Les aventamos el botón de subida pequeño
                <TouchableOpacity style={styles.p12UploadBox} onPress={pickP12File}>
                  <FolderLock size={36} color="#1E3A8A" style={{ marginBottom: 8 }} />
                  <Text style={styles.p12UploadText}>Seleccionar archivo .p12 o .pfx</Text>
                  <Text style={styles.p12UploadSubtitle}>Tu llave privada nunca sale del celular</Text>
                </TouchableOpacity>
              ) : (
                // Si ya seleccionaron firma mostramos mini controles
                <View>
                  {/* Etiqueta enseñando qué subieron */}
                  <View style={styles.p12FileHeader}>
                    <Key size={24} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={styles.p12FileName} numberOfLines={1}>{p12File.name}</Text>
                    {/* Opción de arrepentirse */}
                    <TouchableOpacity style={styles.p12ChangeButton} onPress={pickP12File}>
                      <Text style={styles.p12ChangeText}>Cambiar</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Si el certificado no se ha testeado todavía */}
                  {!isValidCert ? (
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.inputLabel}>Contraseña de la firma:</Text>
                      <View style={styles.inputContainer}>
                        {/* El candado a la izquierda */}
                        <Lock size={18} color="#6B7280" style={{ marginRight: 8 }} />
                        {/* La caja de texto */}
                        <TextInput
                          style={styles.input}
                          value={p12Password}
                          onChangeText={setP12Password}
                          placeholder="Ingresa tu contraseña"
                          // Lo ponemos chueco o derecho según el ojito
                          secureTextEntry={secureTextEntry}
                          // Para que no se le jodan las mayúsculas solitas
                          autoCapitalize="none"
                        />
                        {/* El ojito mirón */}
                        <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                          {secureTextEntry ? (
                            <EyeOff size={18} color="#6B7280" />
                          ) : (
                            <Eye size={18} color="#6B7280" />
                          )}
                        </TouchableOpacity>
                      </View>
                      {/* Botónazo que dispara a nuestro validador */}
                      <TouchableOpacity
                        style={styles.validateButton}
                        onPress={loadAndValidateP12}
                        disabled={processing}
                      >
                        {processing ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.validateButtonText}>Validar y Descifrar Firma</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // Si todo funcionó chingón mostramos placa verde
                    <View style={styles.p12SuccessBadge}>
                      <CheckCircle size={18} color="#10B981" style={{ marginRight: 6 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.p12SuccessText}>Firma descifrada con éxito</Text>
                        <Text style={styles.p12SignerText} numberOfLines={1}>Propietario: {signerName}</Text>
                        <Text style={styles.p12IssuerText} numberOfLines={1}>Autoridad: {issuerName}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Zona 2: Movimiento y precisión quirurgica */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>2. Ajustar Ubicación en la Página</Text>
              <Text style={styles.sectionDescription}>
                Coloca y escala el sello digital libremente. Se estampará como texto transparente y elegante, sin marcos ni recuadros.
              </Text>

              {/* Contenedor del rectángulo blanco que finge ser una página */}
              <View style={styles.previewPageWrapper}>
                <View style={styles.previewPage}>
                  <Text style={styles.previewPageText}>Página {pageNumber}</Text>
                  {/* El sellito falso volador */}
                  <View
                    style={[
                      styles.previewSignatureStamp,
                      {
                        // Matemáticas turbias para que el porcentaje coincida más o menos visualmente
                        left: `${posX * 0.75}%` as any,
                        bottom: `${posY * 0.75}%` as any,
                        width: scaleWidth * 0.6,
                      },
                    ]}
                  >
                    <Text style={styles.stampHeader}>FIRMADO DIGITALMENTE</Text>
                    <Text style={styles.stampText} numberOfLines={1}>
                      {/* Usamos tu nombre real si existe o Juan Pérez de comodín */}
                      {signerName || "Juan Pérez"}
                    </Text>
                    <Text style={styles.stampHash}>EC-SECURE-STAMP</Text>
                  </View>
                </View>
              </View>

              {/* Un mapeo mágico que recorre 4 objetos y arma 4 barritas arrastrables (sliders) */}
              {[
                // Primero: La hoja a la que le vas a pegar la estampa
                { label: "Página a firmar:", value: `${pageNumber} de ${totalPages}`, min: 1, max: totalPages, step: 1, val: pageNumber, setter: setPageNumber },
                // Segundo: Qué tan lejos del borde izquierdo andas
                { label: "Posición Horizontal (X):", value: `${posX}%`, min: 0, max: 100, step: 1, val: posX, setter: setPosX },
                // Tercero: Qué tan lejos del borde de abajo andas
                { label: "Posición Vertical (Y):", value: `${posY}%`, min: 0, max: 100, step: 1, val: posY, setter: setPosY },
                // Cuarto: La gordura o estirada de la firma final
                { label: "Escala / Ancho de Firma:", value: `${scaleWidth}px`, min: 100, max: 250, step: 5, val: scaleWidth, setter: setScaleWidth },
              ].map(({ label, value, min, max, step, val, setter }) => (
                <View style={styles.controlRow} key={label}>
                  {/* Caja de nombre y valor del lado derecho */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={styles.controlLabel}>{label}</Text>
                    <Text style={styles.controlValue}>{value}</Text>
                  </View>
                  {/* El riel de la barrita chida comunitaria de react native */}
                  <Slider
                    minimumValue={min}
                    maximumValue={max}
                    step={step}
                    value={val}
                    onValueChange={setter}
                    minimumTrackTintColor="#1E3A8A"
                    maximumTrackTintColor="#D1D5DB"
                    thumbTintColor="#1E3A8A"
                  />
                </View>
              ))}
            </View>

            {/* El momento de la verdad, apretar el botón nuclear */}
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={executeSignature}
              // Lo apagas si está trabajando o si el wey ni siquiera comprobó su clave
              disabled={processing || !isValidCert}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <FileSignature color="#fff" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.primaryActionText}>Estampar Firma Criptográfica</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Mensajito soplón que le dice que no puede usar el botón nuclear porque no validó su clave */}
            {!isValidCert && p12File && (
              <Text style={styles.warningValidateText}>
                *Debes validar la contraseña de tu firma electrónica antes de estamparla.
              </Text>
            )}

            {/* Si te equivocaste de archivo pdf te lo borro de la existencia */}
            <TouchableOpacity
              style={styles.cancelButtonLink}
              onPress={() => {
                setPdfFile(null);
                setP12File(null);
                setIsValidCert(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cambiar Documento PDF</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// SECCION DE ESTILOS
// Aquí hay un mar gigante de objetos CSS de React Native
const styles = StyleSheet.create({
  // Gris perla de fondo que usa Tailwind a cada rato
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  // Un padding para no pegarnos a los bordes
  scrollContent: { padding: 16, flexGrow: 1 },
  // Alineamos nuestro contenedor inicial exactamente en el ombligo de la pantalla
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 48 },
  // Le metemos sombra estilo iOS, bordes mamones redondeados y raya punteada para que de ganas de apretar
  uploadCard: { width: "100%", backgroundColor: "#fff", borderRadius: 24, padding: 32, alignItems: "center", borderWidth: 2, borderColor: "#E5E7EB", borderStyle: "dashed", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  // Título principal con un azul rey oscuro
  uploadTitle: { fontSize: 20, fontWeight: "bold", color: "#1E3A8A", marginBottom: 8, textAlign: "center" },
  // Letra pálida de subtitulo
  uploadSubtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  // Pill azul super de moda
  badgeBlue: { backgroundColor: "#EFF6FF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  // Color contrastante para que se lea la pill
  badgeTextBlue: { fontSize: 12, color: "#1E3A8A", fontWeight: "600" },
  // Bloque para alargar todo el formulario
  formContainer: { width: "100%" },
  // Tarjetita horizontal inicial para confirmar el pdf
  pdfHeaderCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  // Nombre azul fuerte
  pdfName: { fontSize: 16, fontWeight: "bold", color: "#1E3A8A" },
  // Paginador chiquito
  pdfPagesCount: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  // Tarjeta general para separar las dos fases con su respectiva sombra sutil
  sectionCard: { backgroundColor: "#fff", padding: 20, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  // Títulos negros gordos de cada sección
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: "#1F2937", marginBottom: 12 },
  // El parrafito explicando por qué debes meter ahí tu firma
  sectionDescription: { fontSize: 13, color: "#6B7280", marginBottom: 16, lineHeight: 18 },
  // Cuadrito para subir el certificado de seguridad
  p12UploadBox: { width: "100%", height: 120, backgroundColor: "#F9FAFB", borderRadius: 12, borderWidth: 1, borderColor: "#D1D5DB", borderStyle: "dashed", justifyContent: "center", alignItems: "center" },
  // Textito azul informando que ahí se sube
  p12UploadText: { fontSize: 14, fontWeight: "bold", color: "#1E3A8A" },
  // Textito en gris pálido para darte paz mental
  p12UploadSubtitle: { fontSize: 11, color: "#6B7280", marginTop: 4 },
  // Cabecera verde moco feliz para cuando ya subiste tu archivo seguro
  p12FileHeader: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0FDF4", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#BBF7D0" },
  // Verde oscuro para que se note en el verde claro
  p12FileName: { flex: 1, fontSize: 13, fontWeight: "bold", color: "#166534" },
  // Botoncito blanco aburrido para resetear tu archivo
  p12ChangeButton: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#D1D5DB", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  // Letritas negras
  p12ChangeText: { fontSize: 11, color: "#374151", fontWeight: "600" },
  // El parche azul confirmatorio de que tu clave sirvió
  p12SuccessBadge: { flexDirection: "row", backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", padding: 12, borderRadius: 8, marginTop: 12 },
  // Textote principal en azul profundo
  p12SuccessText: { fontSize: 13, fontWeight: "bold", color: "#1E40AF" },
  // Detalles menores en negro y gris
  p12SignerText: { fontSize: 12, color: "#374151", marginTop: 4 },
  p12IssuerText: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  // Labels genéricos para cajitas de texto
  inputLabel: { fontSize: 12, fontWeight: "600", color: "#4B5563", marginBottom: 4, marginTop: 10 },
  // El huequito donde tipeas con su respectivo borde redondeado
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, paddingHorizontal: 12, height: 44 },
  // Tu texto oscuro de adentro
  input: { flex: 1, color: "#1F2937", fontSize: 13 },
  // Botón azul primario para validar la contraseña
  validateButton: { width: "100%", height: 44, backgroundColor: "#1E3A8A", borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 12 },
  // Letras blancas gruesas
  validateButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  // El falso escritorio gris de atrás de la hoja virtual
  previewPageWrapper: { width: "100%", backgroundColor: "#F3F4F6", borderRadius: 12, padding: 16, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  // La hoja virtual blanca con su sombrita imitando papel real
  previewPage: { width: 160, height: 220, backgroundColor: "#fff", borderRadius: 4, borderWidth: 1, borderColor: "#D1D5DB", position: "relative", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, justifyContent: "center", alignItems: "center" },
  // Letritas pálidas de qué pagina es
  previewPageText: { fontSize: 12, color: "#9CA3AF", fontWeight: "bold" },
  // La caja voladora y transparente que imita la posición final de tu estampa
  previewSignatureStamp: { position: "absolute", height: 42, borderRadius: 2, padding: 2, justifyContent: "center", alignItems: "flex-start", borderWidth: 0, backgroundColor: "transparent" },
  // Título microscópico azulado del sello falso
  stampHeader: { fontSize: 3.5, fontWeight: "bold", color: "#1E3A8A" },
  // Tu nombre falso microscópico en negro
  stampText: { fontSize: 4, fontWeight: "600", color: "#111827", marginVertical: 1 },
  // El serial microscópico en verde
  stampHash: { fontSize: 3, color: "#059669", fontWeight: "bold" },
  // Agrupador para los controles arrastrables
  controlRow: { marginBottom: 16 },
  // Label de la izquierda
  controlLabel: { fontSize: 13, fontWeight: "600", color: "#4B5563" },
  // Valor numérico de la derecha
  controlValue: { fontSize: 13, fontWeight: "bold", color: "#1E3A8A" },
  // El botón gigante de ataque
  primaryActionButton: { width: "100%", height: 56, backgroundColor: "#1E3A8A", borderRadius: 12, justifyContent: "center", alignItems: "center", flexDirection: "row", shadowColor: "#1E3A8A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginTop: 8 },
  // Texto blanco grueso
  primaryActionText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  // El texto rojo feo de que la cagaste
  warningValidateText: { fontSize: 11, color: "#EF4444", textAlign: "center", marginTop: 10, fontWeight: "600" },
  // Botón invisible que solo tiene texto para irte pa atrás
  cancelButtonLink: { width: "100%", height: 48, justifyContent: "center", alignItems: "center", marginTop: 12 },
  // Letra gris desanimada para rendirte
  cancelButtonText: { color: "#6B7280", fontSize: 14, fontWeight: "500" },
  // Pantalla central de los campeones
  completedContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 16 },
  // La tarjetota enorme de que ganaste el partido
  successCard: { width: "100%", backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
  // El fondo verde del chequecito de victoria
  successIconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#ECFDF5", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  // Verde esmeralda poderoso
  successTitle: { fontSize: 22, fontWeight: "bold", color: "#065F46", marginBottom: 8 },
  // Letritas calmadas dando contexto de la victoria
  successSubtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 20 },
  // Cuadro informativo con los datos que robaste de tu certificado
  metadataBox: { width: "100%", backgroundColor: "#F9FAFB", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 24 },
  // El encabezado del informe
  metaLabel: { fontSize: 13, fontWeight: "bold", color: "#374151", marginBottom: 8 },
  // Los pedazos de info en gris
  metaText: { fontSize: 13, color: "#4B5563", marginBottom: 4 },
  // El botón segundón blanco grisáceo
  secondaryButton: { width: "100%", height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#D1D5DB", marginTop: 12 },
  // Y su respectivo texto oscurito pero no negro
  secondaryButtonText: { color: "#374151", fontSize: 14, fontWeight: "600" },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la condición de disabled={processing || !isValidCert} del botón de executeSignature? pasa que el usuario impaciente apretará cincuenta veces el botón mientras procesa o, peor aún, intentará mandar archivos defectuosos al backend saltándose tu candado
// para solucionarlo debes reincorporar siempre la directiva disabled a tu TouchableOpacity amarrada a tus estados booleanos de seguridad
// ¿qué pasa si borras el bloque de if (!isValidCert) y dejas solo el botón grande? pasa que en la interfaz ya no aparecerá la opción de escribir la contraseña de tu archivo P12, lo cual significa que nadie en el mundo podrá jamás abrir su certificado ni firmar absolutamente nada y la app quedará de adorno
// para solucionarlo debes volver a pintar la cajita de contraseña con secureTextEntry en true y reconectar su botón azul "Validar y Descifrar"

