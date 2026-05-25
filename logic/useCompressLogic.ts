import * as DocumentPicker from "expo-document-picker";
import { documentDirectory, downloadAsync } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert } from "react-native";
import { compressPdf, uploadFileToPdfco } from "../lib/pdfco";

// Sección: Hook que contiene toda la lógica de la pantalla de compresión
// Funciones: useCompressLogic expone el estado y las funciones necesarias para seleccionar subir comprimir descargar y compartir un PDF

export function useCompressLogic() {
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

  // Función: processCompress sube el archivo a PDF.co solicita compresión y descarga el resultado
  async function processCompress() {
    if (!file || file.canceled) return;
    setProcessing(true);
    try {
      const asset = file.assets[0];
      const uploadedUrl = await uploadFileToPdfco(asset.uri, asset.name);
      const compressedUrl = await compressPdf(uploadedUrl);

      const downloadRes = await downloadAsync(
        compressedUrl,
        documentDirectory + "compressed_" + Date.now() + ".pdf",
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

// si quitas la función CompressScreen el usuario no podrá acceder a la función de reducir tamaño de PDF
// si quitas la función pickDocument el usuario no podrá subir el archivo que quiere comprimir
// si quitas la función processCompress el documento seleccionado nunca será procesado ni reducido de tamaño
// si quitas la función shareFile el usuario no podrá extraer de la app el documento ya comprimido para enviarlo o guardarlo
