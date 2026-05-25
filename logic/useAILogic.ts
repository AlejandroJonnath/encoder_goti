import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Alert } from "react-native";
import { summarizeText } from "../lib/ai";
import { extractTextFromPdf, uploadFileToPdfco } from "../lib/pdfco";

// Sección: Hook que contiene la lógica para la pantalla de IA
// Funciones: useAILogic expone estados y funciones para seleccionar un PDF extraer texto y solicitar un resumen a la IA

export function useAILogic() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  // Función: pickDocument abre el selector para elegir un PDF
  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFile(result.assets[0]);
        setSummary(null);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  }

  // Función: processSummary sube el PDF extrae texto y pide el resumen a la IA
  async function processSummary() {
    if (!file) return;
    setProcessing(true);
    try {
      const uploadedUrl = await uploadFileToPdfco(file.uri, file.name);
      const text = await extractTextFromPdf(uploadedUrl);

      if (!text || text.trim().length === 0) {
        throw new Error(
          "No se pudo extraer texto del documento. Quizás es una imagen escaneada.",
        );
      }

      const aiSummary = await summarizeText(text);
      setSummary(aiSummary as any);
    } catch (error: any) {
      Alert.alert(
        "Error con IA",
        error.message || "Ocurrió un error inesperado al analizar.",
      );
    } finally {
      setProcessing(false);
    }
  }

  return {
    file,
    processing,
    summary,
    pickDocument,
    processSummary,
    setFile,
    setSummary,
  };
}

// si quitas la función AIScreen los usuarios perderán el acceso a la herramienta de resumen
// si quitas la función pickDocument será imposible seleccionar un PDF para resumir
// si quitas la función processSummary el archivo nunca será procesado por PDF.co ni enviado a la inteligencia artificial
