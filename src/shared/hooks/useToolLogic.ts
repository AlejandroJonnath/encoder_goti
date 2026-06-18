// SECCION DE IMPORTACIONES
// Para que el usuario pueda escoger documentos de su celular
import * as DocumentPicker from "expo-document-picker";
// El gestor de estados de React
import { useState } from "react";
// El sistema de alertas personalizadas del proyecto
import { useCustomAlert } from "@/shared/context/AlertContext";

// Sección: Hook para la pantalla genérica de herramientas
// Funciones: useToolLogic expone selección de archivo procesamiento simulado y control de estados

// FUNCION: useToolLogic
// Hook utilitario reutilizable para cualquier herramienta de la app que necesite seleccionar y procesar archivos
export function useToolLogic() {
  // Sacamos la función de alertas para mostrar mensajes al usuario
  const { showAlert } = useCustomAlert();
  // El resultado completo de la selección de documento
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(
    null,
  );
  // Indica si estamos en medio de un procesamiento
  const [processing, setProcessing] = useState(false);
  // Indica si el procesamiento ya terminó con éxito
  const [completed, setCompleted] = useState(false);

  // FUNCION: pickDocument
  // Abre el selector de archivos aceptando PDFs, Word e imágenes
  async function pickDocument() {
    // Zona segura para manejar errores de acceso a archivos
    try {
      // Abrimos el selector de archivos con todos los tipos que acepta la herramienta
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          // PDFs normales
          "application/pdf",
          // Documentos de Word antiguo
          "application/msword",
          // Documentos de Word moderno
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          // Cualquier tipo de imagen
          "image/*",
        ],
        // Copiamos al caché para poder leer el archivo libremente
        copyToCacheDirectory: true,
      });
      // Si el usuario eligió un archivo y no canceló
      if (!result.canceled) {
        // Guardamos el resultado en el estado
        setFile(result);
        // Reseteamos el indicador de completado para que se pueda procesar de nuevo
        setCompleted(false);
      }
    // Si el sistema lanza un error al abrir el selector
    } catch (err) {
      showAlert("Error", "No se pudo seleccionar el archivo", "error");
    }
  }

  // FUNCION: processFile
  // Simula el procesamiento del archivo con un temporizador de 3 segundos
  async function processFile() {
    // Si no hay archivo o el usuario canceló la selección no hacemos nada
    if (!file || file.canceled) return;
    // Activamos la rueda de carga
    setProcessing(true);
    // Simulamos un proceso de 3 segundos con setTimeout
    setTimeout(() => {
      // Cuando terminan los 3 segundos apagamos la carga
      setProcessing(false);
      // Marcamos como completado para que la UI cambie de vista
      setCompleted(true);
      // Y celebramos con una alerta verde
      showAlert("¡Éxito!", "El archivo ha sido procesado correctamente.", "success");
    }, 3000);
  }

  // Devolvemos todo lo que necesita la pantalla para funcionar
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
// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas pickDocument? pasa que el botón de seleccionar archivo no podrá abrir el explorador y el usuario nunca podrá elegir qué archivo procesar
// para solucionarlo debes volver a conectar DocumentPicker.getDocumentAsync con los tipos de archivo y el copyToCacheDirectory dentro de un try catch
// ¿qué pasa si quitas el estado completed? pasa que después de procesar el archivo la pantalla nunca sabrá que terminó y no cambiará su estado visual de procesando a completado
// para solucionarlo debes volver a agregar el useState de completed y actualizarlo dentro del setTimeout de processFile
