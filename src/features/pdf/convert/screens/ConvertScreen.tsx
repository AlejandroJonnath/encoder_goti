import { Stack, useLocalSearchParams } from "expo-router";
import {
  CheckCircle,
  Download,
  FileType,
  RefreshCw,
  UploadCloud,
} from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { usePdfConversion } from "@/features/pdf/convert/hooks/usePdfConversion";
import styles from "@/features/pdf/convert/styles/convert.styles";

// Mapeo constante que define colores y nombres amigables según el tipo de conversión
const TYPE_MAP: Record<string, { label: string; color: string }> = {
  "to-word": { label: "PDF a Word", color: "#2B579A" },
  "to-excel": { label: "PDF a Excel", color: "#217346" },
  "to-jpg": { label: "PDF a JPG", color: "#E53935" },
  "to-png": { label: "PDF a PNG", color: "#8E24AA" },
  "word-to-pdf": { label: "Word a PDF", color: "#2B579A" },
  "img-to-pdf": { label: "Imagen a PDF", color: "#E53935" },
  "word": { label: "Word a PDF", color: "#2B579A" },
  "excel": { label: "Excel a PDF", color: "#217346" },
  "ppt": { label: "PowerPoint a PDF", color: "#D24726" },
  "jpg": { label: "JPG a PDF", color: "#F4B400" },
  "png": { label: "PNG a PDF", color: "#E5322D" },
  "html": { label: "HTML a PDF", color: "#E34F26" },
  "txt": { label: "TXT a PDF", color: "#757575" },
};

// Función ConvertScreen: Pantalla dinámica que muta según la herramienta
export default function ConvertScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const config = TYPE_MAP[type || "to-word"] || {
    label: "Convertir",
    color: "#555",
  };

  const {
    file,
    processing,
    completed,
    resultUri,
    pickDocument,
    processConversion,
    shareFile,
    setFile,
    setCompleted,
  } = usePdfConversion();

  function handleProcess() {
    let destinationType = "pdf";

    if (type === "to-word") destinationType = "doc";
    else if (type === "to-excel") destinationType = "xls";
    else if (type === "to-jpg") destinationType = "jpg";
    else if (type === "to-png") destinationType = "png";
    else if (
      type === "word" ||
      type === "excel" ||
      type === "ppt" ||
      type === "jpg" ||
      type === "png" ||
      type === "html" ||
      type === "txt" ||
      type === "word-to-pdf" ||
      type === "img-to-pdf"
    ) {
      destinationType = "pdf";
    }

    processConversion(destinationType);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ headerTitle: config.label, headerTintColor: config.color }}
      />

      <View style={styles.content}>
        {!file ? (
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: config.color }]}
            onPress={() => pickDocument(type)}
          >
            <UploadCloud size={64} color={config.color} />
            <Text style={[styles.uploadText, { color: config.color }]}>
              Seleccionar Archivo
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileContainer}>
            <View style={styles.fileInfoBox}>
              <FileType
                size={48}
                color={config.color}
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
            </View>

            {completed ? (
              <View style={styles.fileInfoBox}>
                <CheckCircle size={48} color="#34A853" />
                <Text
                  style={[
                    styles.fileName,
                    { color: "#34A853", fontSize: 16, marginTop: 8 },
                  ]}
                >
                  ¡Convertido con Éxito!
                </Text>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: config.color }]}
                  onPress={shareFile}
                >
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>
                    Compartir / Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: config.color }]}
                onPress={handleProcess}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <RefreshCw color="#fff" size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.actionButtonText}>Convertir Archivo</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {!processing && (
              <TouchableOpacity
                onPress={() => {
                  setFile(null);
                  setCompleted(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancelar y elegir otro</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
