import * as DocumentPicker from "expo-document-picker";
import { documentDirectory, downloadAsync } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { uploadFileToPdfco } from "@/features/pdf/shared/services/pdfco";
import { useCustomAlert } from "@/shared/context/AlertContext";
// Some environments may not export convertPdfTo as a named export; fall back to require at runtime
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { convertPdfTo } = require("@/features/pdf/shared/services/pdfco");

// Sección: Hook con la lógica para la pantalla dinámica de conversión
// Funciones: usePdfConversion expone estados y funciones para elegir un archivo subirlo pedir la conversión y descargar el resultado

export function usePdfConversion() {
  const { showAlert } = useCustomAlert();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resultUri, setResultUri] = useState<string | null>(null);

  async function pickDocument(conversionType?: string) {
    try {
      let allowedTypes: string | string[] = "*/*";

      if (conversionType) {
        switch (conversionType) {
          case "word":
          case "word-to-pdf":
            allowedTypes = [
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              ".doc", ".docx"
            ];
            break;
          case "excel":
          case "to-excel":
            if (conversionType === "to-excel") {
              allowedTypes = ["application/pdf", ".pdf"];
            } else {
              allowedTypes = [
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".xls", ".xlsx"
              ];
            }
            break;
          case "ppt":
            allowedTypes = [
              "application/vnd.ms-powerpoint",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              ".ppt", ".pptx"
            ];
            break;
          case "jpg":
          case "img-to-pdf":
            allowedTypes = ["image/jpeg", "image/jpg", ".jpg", ".jpeg"];
            break;
          case "png":
            allowedTypes = ["image/png", ".png"];
            break;
          case "html":
            allowedTypes = ["text/html", ".html", ".htm"];
            break;
          case "txt":
            allowedTypes = ["text/plain", ".txt"];
            break;
          case "to-word":
          case "to-jpg":
          case "to-png":
            allowedTypes = ["application/pdf", ".pdf"];
            break;
          default:
            allowedTypes = "*/*";
        }
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setFile(result.assets[0]);
        setCompleted(false);
        setResultUri(null);
      }
    } catch (err) {
      showAlert("Error", "No se pudo seleccionar el archivo", "error");
    }
  }

  async function processConversion(convertType: string) {
    if (!file) return;
    setProcessing(true);
    try {
      const uploadedUrl = await uploadFileToPdfco(file.uri, file.name);
      const convertedUrl = await convertPdfTo(uploadedUrl, convertType);

      let ext = ".pdf";
      if (convertType === "doc") ext = ".doc";
      else if (convertType === "xls") ext = ".xlsx";
      else if (convertType === "jpg") ext = ".jpg";
      else if (convertType === "png") ext = ".png";

      let originalName = "converted_" + Date.now();
      if (file && file.name) {
        const lastDotIndex = file.name.lastIndexOf(".");
        if (lastDotIndex !== -1) {
          originalName = file.name.substring(0, lastDotIndex);
        } else {
          originalName = file.name;
        }
      }

      const downloadRes = await downloadAsync(
        convertedUrl,
        documentDirectory + originalName + ext,
      );
      setResultUri(downloadRes.uri);
      setCompleted(true);
    } catch (error: any) {
      showAlert("Error", error.message || "Ocurrió un error", "error");
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
