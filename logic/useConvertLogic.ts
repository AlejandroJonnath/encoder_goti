import * as DocumentPicker from "expo-document-picker";
import { documentDirectory, downloadAsync } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert } from "react-native";
import { uploadFileToPdfco } from "../lib/pdfco";
// Some environments may not export convertPdfTo as a named export; fall back to require at runtime
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { convertPdfTo } = require("../lib/pdfco");

// Sección: Hook con la lógica para la pantalla dinámica de conversión
// Funciones: useConvertLogic expone estados y funciones para elegir un archivo subirlo pedir la conversión y descargar el resultado

export function useConvertLogic() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resultUri, setResultUri] = useState<string | null>(null);

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setFile(result.assets[0]);
        setCompleted(false);
        setResultUri(null);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  }

  async function processConversion(convertType: string) {
    if (!file) return;
    setProcessing(true);
    try {
      const uploadedUrl = await uploadFileToPdfco(file.uri, file.name);
      // convertPdfTo puede lanzar dependiendo del tipo
      const convertedUrl = await convertPdfTo(uploadedUrl, convertType);
      const downloadRes = await downloadAsync(
        convertedUrl,
        documentDirectory + "converted_" + Date.now(),
      );
      setResultUri(downloadRes.uri);
      setCompleted(true);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Ocurrió un error");
    } finally {
      setProcessing(false);
    }
  }

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
    processConversion,
    shareFile,
    setFile,
    setCompleted,
  };
}

// si quitas useConvertLogic la pantalla de conversión dinámica perderá su motor de subida y descarga
