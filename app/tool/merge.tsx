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
import { useMergeLogic } from "../../logic/useMergeLogic";
import styles from "../../styles/merge.styles";

// Sección: Pantalla para Unir Múltiples PDFs
// (Maneja la selección de múltiples archivos PDF los sube en paralelo y los combina en un único archivo utilizando la API)

// Función MergeScreen: Pantalla interactiva para la herramienta de unir PDF
// (Gestiona la lista de archivos seleccionados el procesamiento la descarga y el reinicio de la herramienta)
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
  } = useMergeLogic();

  // (Devuelve los componentes visuales de la interfaz)
  return (
    <View style={styles.container}>
      {/* (Configuración dinámica del encabezado con color azul específico para esta herramienta) */}
      <Stack.Screen
        options={{ headerTitle: "Unir PDFs", headerTintColor: "#4285F4" }}
      />

      {/* (Contenedor que alinea el contenido centralmente) */}
      <View style={styles.content}>
        {/* (Si el arreglo de archivos está vacío se muestra el botón grande de selección inicial) */}
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
            {/* (Caja blanca que envuelve la lista de archivos) */}
            <View style={styles.listContainer}>
              {/* (Componente FlatList que renderiza los archivos de forma eficiente) */}
              <FlatList
                data={files}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.fileRow}>
                    {/* (Icono de archivo pequeño al lado del nombre) */}
                    <FileText color="#4285F4" size={24} />
                    {/* (Nombre del archivo que se acorta si es muy largo) */}
                    <Text style={styles.fileName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {/* (Botón de la papelera para eliminar este elemento de la lista) */}
                    <TouchableOpacity onPress={() => removeFile(index)}>
                      {/* (Icono de papelera color rojo) */}
                      <Trash2 color="#E5322D" size={24} />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {/* (Si no se ha completado el proceso y no está cargando permite añadir más archivos) */}
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

            {/* (Si el proceso de unión finalizó con éxito) */}
            {completed ? (
              <View style={styles.completedBox}>
                {/* (Check verde de éxito) */}
                <CheckCircle size={48} color="#34A853" />
                {/* (Texto confirmando la unión) */}
                <Text style={styles.completedText}>¡PDFs Unidos!</Text>
                {/* (Botón azul para compartir el archivo resultante) */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#4285F4" }]}
                  onPress={shareFile}
                >
                  {/* (Icono de descargar) */}
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  {/* (Texto del botón compartir) */}
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
