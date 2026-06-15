import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { useCustomAlert } from "@/shared/context/AlertContext";

// Sección: Hook para la pantalla genérica de herramientas
// Funciones: useToolLogic expone selección de archivo procesamiento simulado y control de estados

export function useToolLogic() {
  const { showAlert } = useCustomAlert();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/*",
        ],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setFile(result);
        setCompleted(false);
      }
    } catch (err) {
      showAlert("Error", "No se pudo seleccionar el archivo", "error");
    }
  }

  async function processFile() {
    if (!file || file.canceled) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
      showAlert("¡Éxito!", "El archivo ha sido procesado correctamente.", "success");
    }, 3000);
  }

  return {
    file,
    processing,
    completed,
    pickDocument,
    processFile,
    setFile,
    setCompleted,
  };
}

// si quitas la función ToolScreen los usuarios no podrán interactuar con la herramienta dinámica
