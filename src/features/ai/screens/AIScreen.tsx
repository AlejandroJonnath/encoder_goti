import { Stack } from "expo-router";
import { BrainCircuit, FileText, UploadCloud } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAIProcessing } from "@/features/ai/hooks/useAIProcessing";
import styles from "@/features/ai/styles/ai.styles";

// Sección: Herramienta de Resumen con Inteligencia Artificial

export default function AIScreen() {
  const {
    file,
    processing,
    summary,
    pickDocument,
    processSummary,
    setFile,
    setSummary,
  } = useAIProcessing();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Resumen IA (Gemini)",
          headerTintColor: "#9C27B0",
        }}
      />

      {!file ? (
        <View style={styles.centerContent}>
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: "#9C27B0" }]}
            onPress={pickDocument}
          >
            <UploadCloud size={64} color="#9C27B0" />
            <Text style={[styles.uploadText, { color: "#9C27B0" }]}>
              Selecciona un PDF a resumir
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.fileInfoBox}>
            <FileText size={32} color="#9C27B0" style={{ marginBottom: 8 }} />
            <Text style={styles.fileName}>{file.name}</Text>
          </View>

          {!summary && !processing && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#9C27B0" }]}
              onPress={processSummary}
            >
              <BrainCircuit color="#fff" size={24} style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>
                Generar Resumen Inteligente
              </Text>
            </TouchableOpacity>
          )}

          {processing && (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#9C27B0" size="large" />
              <Text style={styles.loadingText}>
                La IA está leyendo y analizando...
              </Text>
            </View>
          )}

          {summary && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Resumen Generado:</Text>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          )}

          {!processing && (
            <TouchableOpacity
              onPress={() => {
                setFile(null);
                setSummary(null);
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Elegir otro documento</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}
