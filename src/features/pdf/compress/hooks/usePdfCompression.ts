import * as DocumentPicker from "expo-document-picker";
import { documentDirectory, downloadAsync } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert } from "react-native";

// Sección: Hook que contiene toda la lógica de la pantalla de compresión
// Funciones: usePdfCompression expone el estado y las funciones necesarias para seleccionar subir comprimir descargar y compartir un PDF

export function usePdfCompression() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resultUri, setResultUri] = useState<string | null>(null);

  // Función: pickDocument abre el selector nativo y guarda el archivo seleccionado
  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFile(result);
        setCompleted(false);
        setResultUri(null);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  }

  // Función: processCompress sube el archivo a nuestro backend local y descarga el resultado comprimido
  async function processCompress() {
    if (!file || file.canceled) return;
    setProcessing(true);
    try {
      const asset = file.assets[0];
      const formData = new FormData();
      formData.append("pdf", {
        uri: asset.uri,
        name: asset.name,
        type: "application/pdf"
      } as any);

      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${backendUrl}/api/pdf/compress`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Error en el servidor al comprimir el PDF");
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error("No se recibió la URL del archivo comprimido");
      }

      // Descargamos el archivo desde la URL generada por nuestro backend
      // Conservamos el nombre original del archivo
      const originalName = asset.name.endsWith(".pdf") ? asset.name : asset.name + ".pdf";
      const downloadRes = await downloadAsync(
        data.url,
        documentDirectory + originalName,
      );

      setResultUri(downloadRes.uri);
      setCompleted(true);
    } catch (error: any) {
      Alert.alert(
        "Error al Comprimir",
        error.message || "Ocurrió un error inesperado",
      );
    } finally {
      setProcessing(false);
    }
  }

  // Función: shareFile abre la hoja nativa de compartir si existe el archivo descargado
  async function shareFile() {
    if (resultUri && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(resultUri);
    }
  }

  return {
    file,
    processing,
    completed,
    resultUri,
    pickDocument,
    processCompress,
    shareFile,
    setFile,
  };
}
