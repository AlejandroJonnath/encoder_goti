import { Stack, useLocalSearchParams } from "expo-router";
import { CheckCircle, Download, File, UploadCloud } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useToolLogic } from "@/shared/hooks/useToolLogic";
import styles from "@/shared/styles/tool.styles";

// Sección: Pantalla genérica para herramientas de PDF
// (Maneja la selección de archivos y muestra la interfaz principal para herramientas que aún no tienen una pantalla específica o se manejan de forma dinámica)

// (Objeto que contiene los detalles de cada herramienta según su ID incluyendo el título el color de la interfaz y el endpoint de la API)
const toolDetails: Record<
  string,
  { title: string; color: string; endpoint: string }
> = {
  // (Configuración para la herramienta de conversión)
  convert: {
    title: "Convertir a PDF",
    color: "#E5322D",
    endpoint: "/pdf/convert/from/doc",
  },
  // (Configuración para la herramienta de compresión)
  compress: {
    title: "Comprimir PDF",
    color: "#34A853",
    endpoint: "/pdf/optimize",
  },
  // (Configuración para la herramienta de unión de PDFs)
  merge: { title: "Unir PDF", color: "#4285F4", endpoint: "/pdf/merge" },
  // (Configuración para la herramienta de firmas)
  sign: { title: "Firmar PDF", color: "#FBBC05", endpoint: "/pdf/edit/add" },
  // (Configuración para la herramienta de inteligencia artificial)
  ai: { title: "Resumen IA", color: "#9C27B0", endpoint: "custom_ai" },
};

// Función ToolScreen: Muestra la interfaz de la herramienta seleccionada dinámicamente
// (Permite seleccionar un archivo muestra su información y simula un procesamiento con estados de carga y finalización)
export default function ToolScreen() {
  // (Obtiene el parámetro id de la URL actual para saber qué herramienta mostrar)
  const { id } = useLocalSearchParams();
  // (Busca los detalles de la herramienta usando el id obtenido si no existe asigna un valor por defecto)
  const tool = toolDetails[id as string] || {
    title: "Herramienta",
    color: "#333",
  };

  const { file, processing, completed, pickDocument, processFile, setFile } =
    useToolLogic();

  // (Retorna la estructura visual de la pantalla)
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ headerTitle: tool.title, headerTintColor: tool.color }}
      />

      <View style={styles.content}>
        {!file || file.canceled ? (
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: tool.color }]}
            onPress={pickDocument}
          >
            <UploadCloud size={64} color={tool.color} />
            <Text style={[styles.uploadText, { color: tool.color }]}>
              Selecciona un archivo
            </Text>
            <Text style={styles.uploadSubtext}>o toca aquí para explorar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileContainer}>
            <View style={styles.fileInfoBox}>
              <File size={48} color={tool.color} />
              <Text style={styles.fileName}>{file.assets[0].name}</Text>
              <Text style={styles.fileSize}>
                {(file.assets[0].size! / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>

            {completed ? (
              <View style={styles.completedBox}>
                <CheckCircle size={48} color="#34A853" />
                <Text style={styles.completedText}>
                  ¡Procesamiento Completado!
                </Text>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: tool.color }]}
                >
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>Descargar Archivo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: tool.color }]}
                onPress={processFile}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Procesar Archivo</Text>
                )}
              </TouchableOpacity>
            )}

            {!processing && !completed && (
              <TouchableOpacity
                onPress={() => setFile(null)}
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

// si quitas la función ToolScreen los usuarios no podrán interactuar con la herramienta dinámica y la aplicación mostrará una pantalla en blanco o un error de navegación
// si quitas la función pickDocument no se podrá abrir el explorador de archivos del teléfono y la herramienta quedará inservible
// si quitas la función processFile la aplicación no simulará o ejecutará el trabajo con el archivo y el usuario quedará estancado sin resultados
