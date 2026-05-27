import { Stack as ExpoStack } from "expo-router";
import {
  CheckCircle,
  Download,
  FileSignature,
  UploadCloud,
  FileText,
  Key,
  FolderLock,
  Lock,
  Eye,
  EyeOff
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { useSignLogic } from "../../logic/useSignLogic";

// Sección: Pantalla de Firma Electrónica Criptográfica Real de Ecuador (.p12 / .pfx)
// (Permite subir un PDF, cargar un certificado digital real, ingresar su contraseña, posicionarlo libremente de forma limpia y transparente y firmarlo localmente)

export default function SignScreen() {
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
  } = useSignLogic();

  const [secureTextEntry, setSecureTextEntry] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStack.Screen
        options={{
          headerTitle: "Firma Electrónica",
          headerTintColor: "#1E3A8A",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!pdfFile ? (
          // Paso 1: Subir el PDF a firmar
          <View style={styles.centerContainer}>
            <TouchableOpacity style={styles.uploadCard} onPress={pickPdf}>
              <UploadCloud size={80} color="#1E3A8A" style={{ marginBottom: 16 }} />
              <Text style={styles.uploadTitle}>Seleccionar Documento PDF</Text>
              <Text style={styles.uploadSubtitle}>Elige el archivo que deseas firmar criptográficamente</Text>
              <View style={styles.badgeBlue}>
                <Text style={styles.badgeTextBlue}>Documento PDF</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : completed ? (
          // Paso Final: Firma Real Completada con Éxito
          <View style={styles.completedContainer}>
            <View style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <CheckCircle size={72} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>¡Documento Firmado!</Text>
              <Text style={styles.successSubtitle}>
                El PDF ha sido firmado y validado criptográficamente usando tu firma electrónica digital real (.p12).
              </Text>

              <View style={styles.metadataBox}>
                <Text style={styles.metaLabel}>Información del Certificado Firmado:</Text>
                <Text style={styles.metaText}><Text style={{ fontWeight: "bold" }}>Firmante (CN):</Text> {signerName}</Text>
                <Text style={styles.metaText}><Text style={{ fontWeight: "bold" }}>Emisor (CA):</Text> {issuerName}</Text>
                <Text style={styles.metaText}><Text style={{ fontWeight: "bold" }}>Nº Serie:</Text> {serialNumber || "N/A"}</Text>
                <Text style={styles.metaText}><Text style={{ fontWeight: "bold" }}>Presentación:</Text> Sello Limpio y Transparente (Sin recuadros)</Text>
              </View>

              <TouchableOpacity style={styles.primaryActionButton} onPress={shareFile}>
                <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                <Text style={styles.primaryActionText}>Compartir / Guardar PDF</Text>
              </TouchableOpacity>

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
          // Paso 2: Carga de firma .p12 y Posicionamiento Libre
          <View style={styles.formContainer}>
            {/* Cabecera del PDF */}
            <View style={styles.pdfHeaderCard}>
              <FileText size={32} color="#1E3A8A" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pdfName} numberOfLines={1}>
                  {pdfFile.name}
                </Text>
                <Text style={styles.pdfPagesCount}>
                  Documento cargado • {totalPages} {totalPages === 1 ? "página" : "páginas"}
                </Text>
              </View>
            </View>

            {/* Cargar Firma Electrónica (.p12 / .pfx) */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>1. Firma Electrónica (.p12 / .pfx)</Text>
              
              {!p12File ? (
                <TouchableOpacity style={styles.p12UploadBox} onPress={pickP12File}>
                  <FolderLock size={36} color="#1E3A8A" style={{ marginBottom: 8 }} />
                  <Text style={styles.p12UploadText}>Seleccionar archivo .p12 o .pfx</Text>
                  <Text style={styles.p12UploadSubtitle}>Tu llave privada nunca sale del celular</Text>
                </TouchableOpacity>
              ) : (
                <View>
                  <View style={styles.p12FileHeader}>
                    <Key size={24} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={styles.p12FileName} numberOfLines={1}>
                      {p12File.name}
                    </Text>
                    <TouchableOpacity style={styles.p12ChangeButton} onPress={pickP12File}>
                      <Text style={styles.p12ChangeText}>Cambiar</Text>
                    </TouchableOpacity>
                  </View>

                  {!isValidCert ? (
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.inputLabel}>Contraseña de la firma:</Text>
                      <View style={styles.inputContainer}>
                        <Lock size={18} color="#6B7280" style={{ marginRight: 8 }} />
                        <TextInput
                          style={styles.input}
                          value={p12Password}
                          onChangeText={setP12Password}
                          placeholder="Ingresa tu contraseña"
                          secureTextEntry={secureTextEntry}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                          {secureTextEntry ? (
                            <EyeOff size={18} color="#6B7280" />
                          ) : (
                            <Eye size={18} color="#6B7280" />
                          )}
                        </TouchableOpacity>
                      </View>

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
                    <View style={styles.p12SuccessBadge}>
                      <CheckCircle size={18} color="#10B981" style={{ marginRight: 6 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.p12SuccessText}>Firma descifrada con éxito</Text>
                        <Text style={styles.p12SignerText} numberOfLines={1}>
                          Propietario: {signerName}
                        </Text>
                        <Text style={styles.p12IssuerText} numberOfLines={1}>
                          Autoridad: {issuerName}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Ajustar Ubicación de la Firma (Borderless Preview) */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>2. Ajustar Ubicación en la Página</Text>
              <Text style={styles.sectionDescription}>
                Coloca y escala el sello digital libremente. Se estampará como texto transparente y elegante, sin marcos ni recuadros.
              </Text>

              {/* Contenedor Visual de Previsualización (Sin bordes en la firma) */}
              <View style={styles.previewPageWrapper}>
                <View style={styles.previewPage}>
                  <Text style={styles.previewPageText}>Página {pageNumber}</Text>
                  
                  {/* Caja de Firma Dinámica Totalmente Limpia (Sin bordes ni contorno) */}
                  <View
                    style={[
                      styles.previewSignatureStamp,
                      {
                        left: `${posX * 0.75}%`,
                        bottom: `${posY * 0.75}%`,
                        width: scaleWidth * 0.6,
                      },
                    ]}
                  >
                    <Text style={styles.stampHeader}>FIRMADO DIGITALMENTE</Text>
                    <Text style={styles.stampText} numberOfLines={1}>
                      {signerName || "Juan Pérez"}
                    </Text>
                    <Text style={styles.stampHash}>EC-SECURE-STAMP</Text>
                  </View>
                </View>
              </View>

              {/* Sliders de Posicionamiento */}
              <View style={styles.controlRow}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={styles.controlLabel}>Página a firmar:</Text>
                  <Text style={styles.controlValue}>{pageNumber} de {totalPages}</Text>
                </View>
                <Slider
                  minimumValue={1}
                  maximumValue={totalPages}
                  step={1}
                  value={pageNumber}
                  onValueChange={setPageNumber}
                  minimumTrackTintColor="#1E3A8A"
                  maximumTrackTintColor="#D1D5DB"
                  thumbTintColor="#1E3A8A"
                />
              </View>

              <View style={styles.controlRow}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={styles.controlLabel}>Posición Horizontal (X):</Text>
                  <Text style={styles.controlValue}>{posX}%</Text>
                </View>
                <Slider
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={posX}
                  onValueChange={setPosX}
                  minimumTrackTintColor="#1E3A8A"
                  maximumTrackTintColor="#D1D5DB"
                  thumbTintColor="#1E3A8A"
                />
              </View>

              <View style={styles.controlRow}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={styles.controlLabel}>Posición Vertical (Y):</Text>
                  <Text style={styles.controlValue}>{posY}%</Text>
                </View>
                <Slider
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={posY}
                  onValueChange={setPosY}
                  minimumTrackTintColor="#1E3A8A"
                  maximumTrackTintColor="#D1D5DB"
                  thumbTintColor="#1E3A8A"
                />
              </View>

              <View style={styles.controlRow}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={styles.controlLabel}>Escala / Ancho de Firma:</Text>
                  <Text style={styles.controlValue}>{scaleWidth}px</Text>
                </View>
                <Slider
                  minimumValue={100}
                  maximumValue={250}
                  step={5}
                  value={scaleWidth}
                  onValueChange={setScaleWidth}
                  minimumTrackTintColor="#1E3A8A"
                  maximumTrackTintColor="#D1D5DB"
                  thumbTintColor="#1E3A8A"
                />
              </View>
            </View>

            {/* Acciones principales */}
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={executeSignature}
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

            {!isValidCert && p12File && (
              <Text style={styles.warningValidateText}>
                *Debes validar la contraseña de tu firma electrónica antes de estamparla.
              </Text>
            )}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  uploadCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 8,
    textAlign: "center",
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  badgeBlue: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeTextBlue: {
    fontSize: 12,
    color: "#1E3A8A",
    fontWeight: "600",
  },
  formContainer: {
    width: "100%",
  },
  pdfHeaderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pdfName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  pdfPagesCount: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 18,
  },
  p12UploadBox: {
    width: "100%",
    height: 120,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  p12UploadText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  p12UploadSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  p12FileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  p12FileName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "bold",
    color: "#166534",
  },
  p12ChangeButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  p12ChangeText: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "600",
  },
  p12SuccessBadge: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  p12SuccessText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  p12SignerText: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
  },
  p12IssuerText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    color: "#1F2937",
    fontSize: 13,
  },
  validateButton: {
    width: "100%",
    height: 44,
    backgroundColor: "#1E3A8A",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  validateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  previewPageWrapper: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  previewPage: {
    width: 160,
    height: 220,
    backgroundColor: "#fff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  previewPageText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "bold",
  },
  previewSignatureStamp: {
    position: "absolute",
    height: 42,
    borderRadius: 2,
    padding: 2,
    justifyContent: "center",
    alignItems: "flex-start", // Alineado a la izquierda
    borderWidth: 0, // ¡SIN BORDES!
    backgroundColor: "transparent", // ¡SIN FONDO!
  },
  stampHeader: {
    fontSize: 3.5,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  stampText: {
    fontSize: 4,
    fontWeight: "600",
    color: "#111827",
    marginVertical: 1,
  },
  stampHash: {
    fontSize: 3,
    color: "#059669",
    fontWeight: "bold",
  },
  controlRow: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  controlValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  primaryActionButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#1E3A8A",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  primaryActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  warningValidateText: {
    fontSize: 11,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
  },
  cancelButtonLink: {
    width: "100%",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  successCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  metadataBox: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 4,
  },
  secondaryButton: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
});
