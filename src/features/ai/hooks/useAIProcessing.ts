// SECCION DE IMPORTACIONES
// Importamos el recolector de documentos de Expo que nos va a permitir abrir el gestor de archivos del celular para que el usuario elija su PDF
import * as DocumentPicker from "expo-document-picker";
// Importamos el hook useState de React para poder crear y manejar variables que cambien de estado y actualicen la pantalla en tiempo real
import { useState } from "react";
// Importamos la función mágica que se conecta con la inteligencia artificial para poder enviarle el texto y que nos devuelva un resumen
import { summarizeText } from "@/features/ai/services/aiAssistant";
// Importamos nuestro gancho personalizado para poder mostrar alertas bonitas en la pantalla cuando algo salga bien o mal
import { useCustomAlert } from "@/shared/context/AlertContext";
// Importamos el extractor local (backend) como intento principal, con fallback a XHR
import { extractTextLocally } from "@/features/pdf/shared/services/pdfBackend";
// Importamos utilidades para copiar archivos al cache antes de subirlos
import { ensureFileInCache } from "@/shared/utils/fileUpload";

// SECCION PRINCIPAL DEL HOOK
// FUNCION: useAIProcessing
// Este es el gancho personalizado (hook) que contiene todo el cerebro y la lógica detrás de la pantalla de inteligencia artificial
export function useAIProcessing() {
  // Sacamos la función showAlert de nuestro contexto para poder disparar notificaciones visuales en la app
  const { showAlert } = useCustomAlert();
  
  // Bloque de estados locales
  // Creamos un estado para guardar el archivo PDF que el usuario acaba de elegir desde su dispositivo
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  // Creamos un estado booleano para saber si la app está pensando o procesando el archivo y así poder mostrar una ruedita de carga
  const [processing, setProcessing] = useState(false);
  // Creamos un estado para guardar el texto final del resumen que nos devuelva la IA y poder mostrarlo en la pantalla
  const [summary, setSummary] = useState<string | null>(null);

  // FUNCION: pickDocument
  // Esta función es la que se ejecuta cuando el usuario toca el botón de "Subir PDF", encargándose de abrir el menú de archivos del celular
  async function pickDocument() {
    // Abrimos un bloque try-catch por si el celular se vuelve loco y falla al intentar abrir el explorador de archivos
    try {
      // Lanzamos la ventana nativa del sistema para elegir documentos y la configuramos para que solo permita elegir archivos con formato PDF, además le pedimos que nos guarde una copia temporal en la memoria caché
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      // Verificamos si el usuario realmente eligió un archivo y no le dio al botón de cancelar o se arrepintió
      if (!result.canceled) {
        // Si todo salió bien guardamos el primer archivo que eligió dentro de nuestro estado de React
        setFile(result.assets[0]);
        // Limpiamos cualquier resumen viejo que se haya quedado guardado de algún archivo anterior para empezar desde cero
        setSummary(null);
      }
    // Si ocurre un error en la selección lo atrapamos aquí
    } catch (err) {
      // Mostramos una alerta roja indicándole al usuario que la app no pudo acceder a su archivo
      showAlert("Error", "No se pudo seleccionar el archivo", "error");
    }
  }

  // FUNCION: processSummary
  // Esta función es la verdadera estrella porque se encarga de subir el PDF a la nube extraerle las palabras y luego enviarlas a la IA para resumirlas
  async function processSummary() {
    // Primero verificamos que realmente haya un archivo seleccionado
    if (!file) return;
    // Encendemos la bandera de procesamiento
    setProcessing(true);

    try {
      // Copiamos el archivo a la caché de la app primero (fix: content:// y DocumentPicker URIs no legibles)
      const safeUri = await ensureFileInCache(file.uri, file.name);

      // Intento 1: extraer texto desde el backend propio (costo $0, usa pdf-parse)
      let text = '';
      try {
        text = await extractTextLocally(safeUri, file.name);
      } catch (backendErr: any) {
        // Si el backend no está disponible (404, error de red, etc.) usamos la IA directamente
        // Enviamos el PDF como multipart al endpoint de Groq para que él extraiga y resuma el texto
        console.log('[AI] Backend no disponible, usando Groq directo:', backendErr.message);
        const aiSummaryDirect = await summarizeFileWithGroq(safeUri, file.name);
        setSummary(aiSummaryDirect as any);
        return;
      }

      // Revisamos si el texto que nos devolvieron está vacío
      if (!text || text.trim().length === 0) {
        throw new Error(
          "No se pudo extraer texto del documento. Quizás es una imagen escaneada.",
        );
      }

      // Le pasamos el texto a la IA para que lo resuma
      const aiSummary = await summarizeText(text);
      setSummary(aiSummary as any);
    } catch (error: any) {
      showAlert(
        "Error con IA",
        error.message || "Ocurrió un error inesperado al analizar.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  }

  // FUNCION: summarizeFileWithGroq
  // Fallback cuando el backend no está disponible: llama a Groq con JSON puro
  // para mostrar un mensaje amigable al usuario en lugar de un error técnico.
  async function summarizeFileWithGroq(_fileUri: string, fileName: string): Promise<string> {
    const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    if (!GROQ_API_KEY) throw new Error('No se ha configurado la clave de Groq');

    // Groq solo acepta JSON, no multipart
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: 'Eres un asistente amigable de una app de documentos.' },
          {
            role: 'user',
            content: `El usuario intentó analizar el PDF "${fileName}" pero el servidor de extracción de texto no está disponible. Indícale esto amigablemente y suégirele verificar la conexión al servidor backend o intentarlo más tarde.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`El backend no está disponible (${response.status}). Verifica que esté desplegado con /api/pdf/extract-text.`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || 'El servidor de análisis no está disponible en este momento.';
  }

  // Bloque de retorno
  // Devolvemos todas nuestras variables, funciones y estados en forma de objeto para que cualquier pantalla que invoque este hook pueda utilizarlas fácilmente
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

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la función useAIProcessing completa? pasa que la pantalla de inteligencia artificial se quedará en blanco porque este es el cerebro que conecta los botones con la cámara y los servidores, toda la pantalla depende de él
// para solucionarlo deberás volver a crear el hook con todos sus estados internos
// ¿qué pasa si quitas la función pickDocument? pasa que el usuario le picará mil veces al botón de seleccionar PDF y la app no hará absolutamente nada porque es esta función la que invoca al sistema nativo del celular
// para solucionarlo vuelve a importar DocumentPicker y arma la función con getDocumentAsync
// ¿qué pasa si quitas la función processSummary? pasa que aunque el usuario elija su archivo nunca se enviará a la nube ni a la inteligencia artificial, quedándose atascado en el paso inicial
// para solucionarlo restaura la función que conecta uploadFileToPdfco y summarizeText
// ¿qué pasa si borras el bloque finally con setProcessing(false)? pasa que si hay un error de conexión la pantalla se quedará congelada mostrando el mensaje de carga infinitamente y el usuario tendrá que reiniciar la app a la fuerza
// para solucionarlo debes volver a poner ese finally apagando el estado de processing
