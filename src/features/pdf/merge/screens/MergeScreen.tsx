import { Stack } from "expo-router";
import {
  CheckCircle,
  Download,
  FileText,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePdfMerger } from "@/features/pdf/merge/hooks/usePdfMerger";
import styles from "@/features/pdf/merge/styles/merge.styles";

// Sección: Pantalla para Unir Múltiples PDFs

export default function MergeScreen() {
  const {
    files,
    processing,
    completed,
    resultUri,
    pickDocument,
    removeFile,
    processMerge,
    shareFile,
    setFiles,
    setCompleted,
  } = usePdfMerger();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ headerTitle: "Unir PDFs", headerTintColor: "#4285F4" }}
      />

      <View style={styles.content}>
        {files.length === 0 ? (
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: "#4285F4" }]}
            onPress={pickDocument}
          >
            <UploadCloud size={64} color="#4285F4" />
            <Text style={[styles.uploadText, { color: "#4285F4" }]}>
              Selecciona 2 o más PDFs
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileContainer}>
            <View style={styles.listContainer}>
              <FlatList
                data={files}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.fileRow}>
                    <FileText color="#4285F4" size={24} />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <TouchableOpacity onPress={() => removeFile(index)}>
                      <Trash2 color="#E5322D" size={24} />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {!processing && !completed && (
                <TouchableOpacity
                  style={styles.addMoreButton}
                  onPress={pickDocument}
                >
                  <Plus color="#4285F4" size={20} />
                  <Text style={styles.addMoreText}>Añadir más archivos</Text>
                </TouchableOpacity>
              )}
            </View>

            {completed ? (
              <View style={styles.completedBox}>
                <CheckCircle size={48} color="#34A853" />
                <Text style={styles.completedText}>¡PDFs Unidos!</Text>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#4285F4" }]}
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
                style={[styles.actionButton, { backgroundColor: "#4285F4" }]}
                onPress={processMerge}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Unir Archivos</Text>
                )}
              </TouchableOpacity>
            )}

            {!processing && (
              <TouchableOpacity
                onPress={() => {
                  setFiles([]);
                  setCompleted(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Empezar de nuevo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
