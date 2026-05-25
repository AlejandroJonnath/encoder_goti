import { Stack } from "expo-router";
import { CheckCircle, Download, File, Minimize } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useCompressLogic } from "../../logic/useCompressLogic";
import styles from "../../styles/compress.styles";

// Sección: Pantalla para Comprimir Documentos PDF
// (Proporciona la interfaz para seleccionar un PDF enviarlo a PDF.co para optimizar su tamaño y descargarlo/compartirlo al finalizar)

// Función CompressScreen: Controla la herramienta de compresión de PDF
// (Gestiona los estados de selección subida compresión descarga y compartición del archivo)
export default function CompressScreen() {
  const {
    file,
    processing,
    completed,
    resultUri,
    pickDocument,
    processCompress,
    shareFile,
    setFile,
  } = useCompressLogic();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ headerTitle: "Comprimir PDF", headerTintColor: "#34A853" }}
      />

      <View style={styles.content}>
        {!file || file.canceled ? (
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: "#34A853" }]}
            onPress={pickDocument}
          >
            <Minimize size={64} color="#34A853" style={{ marginBottom: 16 }} />
            <Text style={[styles.uploadText, { color: "#34A853" }]}>
              Selecciona el PDF a comprimir
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileContainer}>
            <View style={styles.fileInfoBox}>
              <File size={48} color="#34A853" />
              <Text style={styles.fileName}>{file.assets[0].name}</Text>
              <Text style={styles.fileSize}>
                {(file.assets[0].size! / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>

            {completed ? (
              <View style={styles.completedBox}>
                <CheckCircle size={48} color="#34A853" />
                <Text style={styles.completedText}>¡Compresión Exitosa!</Text>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#34A853" }]}
                  onPress={shareFile}
                >
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>
                    Compartir / Guardar PDF
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#34A853" }]}
                onPress={processCompress}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Comprimir PDF</Text>
                )}
              </TouchableOpacity>
            )}

            {!processing && (
              <TouchableOpacity
                onPress={() => {
                  setFile(null);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Elegir otro archivo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
