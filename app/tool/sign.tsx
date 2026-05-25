import { Stack as ExpoStack } from "expo-router";
import {
  CheckCircle,
  Download,
  FileSignature,
  ImageIcon,
  UploadCloud,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSignLogic } from "../../logic/useSignLogic";
import styles from "../../styles/sign.styles";

// Sección: Pantalla para Estampar Firma en Documentos PDF
// (Permite subir un PDF tomar o subir una foto de una firma e incrustarla en una de las esquinas o el centro de la primera página del documento)

// (Define un tipo específico para las cinco posiciones posibles de la firma)
type Position =
  | "top-left"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-right";

// Función SignScreen: Controla toda la interfaz y flujo de firmado local
// (Gestiona la selección del PDF la imagen de la firma su posición y usa pdf-lib para incrustarla sin necesidad de internet)
export default function SignScreen() {
  const {
    pdfFile,
    signatureImage,
    position,
    processing,
    completed,
    resultUri,
    pickPdf,
    pickSignature,
    processSign,
    shareFile,
    setPdfFile,
    setSignatureImage,
    setPosition,
    setCompleted,
  } = useSignLogic();
  // Componente interno PositionButton: Crea los botones para elegir dónde va la firma
  const PositionButton = ({ pos, label }: { pos: Position; label: string }) => (
    <TouchableOpacity
      style={[styles.posButton, position === pos && styles.posButtonActive]}
      onPress={() => setPosition(pos)}
    >
      <Text
        style={[
          styles.posButtonText,
          position === pos && styles.posButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // (Devuelve la estructura visual general)
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* (Configuración del encabezado de navegación con color naranja cálido) */}
      <ExpoStack.Screen
        options={{ headerTitle: "Firmar PDF", headerTintColor: "#FBBC05" }}
      />

      {/* (Contenedor que centra el contenido en toda la vista disponible) */}
      <View style={styles.content}>
        {/* (Si todavía no se ha elegido el documento base) */}
        {!pdfFile ? (
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: "#FBBC05" }]}
            onPress={pickPdf}
          >
            <UploadCloud size={64} color="#FBBC05" />
            <Text style={[styles.uploadText, { color: "#FBBC05" }]}>
              Paso 1: Selecciona el PDF
            </Text>
          </TouchableOpacity>
        ) : !signatureImage ? (
          <View style={{ width: "100%", alignItems: "center" }}>
            {/* (Mensaje confirmando que el PDF ya está listo) */}
            <Text style={styles.fileName}>
              PDF Seleccionado: {pdfFile.name}
            </Text>
            {/* (Botón punteado para tomar o elegir foto de la galería) */}
            <TouchableOpacity
              style={[
                styles.uploadBox,
                { borderColor: "#FBBC05", marginTop: 24 },
              ]}
              onPress={pickSignature}
            >
              {/* (Icono representativo de imagen) */}
              <ImageIcon size={64} color="#FBBC05" />
              {/* (Texto guía de paso 2) */}
              <Text style={[styles.uploadText, { color: "#FBBC05" }]}>
                Paso 2: Foto de tu Firma
              </Text>
              {/* (Subtítulo aclarando la función de recorte nativa) */}
              <Text style={styles.uploadSubtext}>
                (Podrás recortarla y ajustarla)
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.fileContainer}>
            {/* (Caja blanca superior con resumen de información) */}
            <View style={styles.fileInfoBox}>
              {/* (Icono decorativo de firma) */}
              <FileSignature
                size={48}
                color="#FBBC05"
                style={{ marginBottom: 12 }}
              />
              {/* (Muestra el nombre del documento cortándolo si es largo) */}
              <Text style={styles.fileName} numberOfLines={1}>
                Documento: {pdfFile.name}
              </Text>
              {/* (Muestra una previsualización de la firma recortada cargándola desde el estado temporal) */}
              <Image
                source={{ uri: signatureImage.uri }}
                style={styles.previewImage}
                resizeMode="contain"
              />

              {/* (Título del menú de posiciones) */}
              <Text style={styles.posTitle}>¿Dónde ubicar la firma?</Text>
              {/* (Contenedor flex wrap para que los botones se acomoden solos) */}
              <View style={styles.posGrid}>
                {/* (Botones que usan el subcomponente interno creado arriba) */}
                <PositionButton pos="top-left" label="Arriba Izq" />
                <PositionButton pos="top-right" label="Arriba Der" />
                <PositionButton pos="center" label="Centro" />
                <PositionButton pos="bottom-left" label="Abajo Izq" />
                <PositionButton pos="bottom-right" label="Abajo Der" />
              </View>
            </View>

            {/* (Si ya la firma fue estampada en el pdf se muestra la caja verde) */}
            {completed ? (
              <View style={styles.completedBox}>
                {/* (Icono de palomita verde) */}
                <CheckCircle size={48} color="#34A853" />
                {/* (Mensaje de victoria) */}
                <Text style={styles.completedText}>
                  ¡Firma Añadida con Éxito!
                </Text>
                {/* (Botón naranja para exportar el archivo listo) */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#FBBC05" }]}
                  onPress={shareFile}
                >
                  {/* (Icono pequeño de bajada) */}
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  {/* (Texto para compartir guardar) */}
                  <Text style={styles.actionButtonText}>
                    Compartir / Guardar PDF
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#FBBC05" }]}
                onPress={processSign}
                disabled={processing}
              >
                {/* (Condicional que muestra el spinner o el texto estampar firma) */}
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Estampar Firma</Text>
                )}
              </TouchableOpacity>
            )}

            {/* (Si no se está trabajando se muestra botón de cancelar general) */}
            {!processing && (
              <TouchableOpacity
                onPress={() => {
                  setPdfFile(null);
                  setSignatureImage(null);
                  setCompleted(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>
                  Cancelar y empezar de nuevo
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
