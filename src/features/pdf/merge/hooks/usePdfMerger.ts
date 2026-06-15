import * as DocumentPicker from "expo-document-picker";
import { documentDirectory, downloadAsync } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { useCustomAlert } from "@/shared/context/AlertContext";
// Sección: Hook que contiene la lógica para unir múltiples PDFs
// Funciones: usePdfMerger expone estados y funciones para seleccionar archivos subirlos unirlos descargar y compartir

export function usePdfMerger() {
  const { showAlert } = useCustomAlert();
  const [files, setFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resultUri, setResultUri] = useState<string | null>(null);

  // Función: pickDocument permite seleccionar múltiples PDFs y añadirlos a la lista
  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled) {
        setFiles((prev) => [...prev, ...result.assets]);
        setCompleted(false);
        setResultUri(null);
      }
    } catch (err) {
      showAlert("Error", "No se pudieron seleccionar los archivos", "error");
    }
  }

  // Función: removeFile elimina un archivo por índice de la lista
  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Función: processMerge sube todos los archivos a nuestro backend, los une y descarga el resultado
  async function processMerge() {
    if (files.length < 2) {
      showAlert("Aviso", "Necesitas al menos 2 PDFs para unirlos.", "warning");
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("pdfs", {
          uri: file.uri,
          name: file.name,
          type: "application/pdf"
        } as any);
      });

      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${backendUrl}/api/pdf/merge`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Error en el servidor al unir los PDFs");
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error("No se recibió la URL del archivo unido");
      }

      // Usamos el nombre del primer archivo como base del resultado
      const baseName = files[0].name.replace(/\.pdf$/i, "");
      const mergedName = `${baseName}_unido.pdf`;
      const downloadRes = await downloadAsync(
        data.url,
        documentDirectory + mergedName,
      );

      setResultUri(downloadRes.uri);
      setCompleted(true);
    } catch (error: any) {
      showAlert("Error al Unir", error.message || "Ocurrió un error", "error");
    } finally {
      setProcessing(false);
    }
  }

  // Función: shareFile abre la hoja de compartir con el PDF final
  async function shareFile() {
    if (resultUri && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(resultUri);
    }
  }

  return {
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
  };
}
