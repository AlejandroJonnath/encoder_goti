import * as DocumentPicker from "expo-document-picker";
import { documentDirectory, downloadAsync } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert } from "react-native";
import { mergePdfs, uploadFileToPdfco } from "../lib/pdfco";

// Sección: Hook que contiene la lógica para unir múltiples PDFs
// Funciones: useMergeLogic expone estados y funciones para seleccionar archivos subirlos unirlos descargar y compartir

export function useMergeLogic() {
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
      Alert.alert("Error", "No se pudieron seleccionar los archivos");
    }
  }

  // Función: removeFile elimina un archivo por índice de la lista
  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Función: processMerge sube todos los archivos los une y descarga el resultado
  async function processMerge() {
    if (files.length < 2) {
      Alert.alert("Aviso", "Necesitas al menos 2 PDFs para unirlos.");
      return;
    }

    setProcessing(true);
    try {
      const uploadPromises = files.map((file) =>
        uploadFileToPdfco(file.uri, file.name),
      );
      const uploadedUrls = await Promise.all(uploadPromises);

      const mergedUrl = await mergePdfs(uploadedUrls, "merged_document.pdf");

      const downloadRes = await downloadAsync(
        mergedUrl,
        documentDirectory + "merged_" + Date.now() + ".pdf",
      );

      setResultUri(downloadRes.uri);
      setCompleted(true);
    } catch (error: any) {
      Alert.alert("Error al Unir", error.message || "Ocurrió un error");
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

// si quitas la función MergeScreen el usuario perderá acceso a la herramienta de unir PDFs
// si quitas la función pickDocument no se podrán seleccionar archivos por ende la herramienta no servirá
// si quitas la función removeFile si un usuario se equivoca al elegir un archivo no podrá quitarlo de la lista
// si quitas la función processMerge los archivos nunca se enviarán a la API para fusionarse
