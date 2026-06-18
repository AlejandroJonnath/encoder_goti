// SECCION DE IMPORTACIONES
// Importamos el recolector de documentos de Expo que nos va a permitir abrir el gestor de archivos del celular para que el usuario elija su PDF
import * as DocumentPicker from "expo-document-picker";
// Importamos el hook useState de React para poder crear y manejar variables que cambien de estado y actualicen la pantalla en tiempo real
import { useState } from "react";
// Importamos la función mágica que se conecta con la inteligencia artificial para poder enviarle el texto y que nos devuelva un resumen
import { summarizeText } from "@/features/ai/services/aiAssistant";
// Importamos nuestro gancho personalizado para poder mostrar alertas bonitas en la pantalla cuando algo salga bien o mal
import { useCustomAlert } from "@/shared/context/AlertContext";
// Importamos las herramientas que nos permiten extraer el texto crudo de los PDFs y subirlos a la nube usando la API de pdfco
import { extractTextFromPdf, uploadFileToPdfco } from "@/features/pdf/shared/services/pdfco";

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
    // Primero verificamos que realmente haya un archivo seleccionado, si no hay archivo no hacemos absolutamente nada y salimos de la función
    if (!file) return;
    // Encendemos la bandera de procesamiento para que la pantalla sepa que tiene que mostrar el cartelito de carga
    setProcessing(true);
    
    // Bloque principal de llamadas a la API
    // Envolvemos el proceso en un try porque al hablar con servidores externos pueden pasar mil cosas malas como que se caiga el internet
    try {
      // Mandamos el archivo PDF hacia los servidores de PDF.co usando su ruta interna y su nombre original, y esperamos a que nos devuelvan el enlace público
      const uploadedUrl = await uploadFileToPdfco(file.uri, file.name);
      // Usamos el enlace público que nos acaban de dar para pedirle al servidor que lea el PDF por dentro y nos saque todo el texto plano
      const text = await extractTextFromPdf(uploadedUrl);

      // Revisamos si el texto que nos devolvieron está vacío o no tiene nada útil
      if (!text || text.trim().length === 0) {
        // Si está vacío lanzamos un error a propósito asumiendo que el PDF es en realidad una imagen o fue escaneado sin texto seleccionable
        throw new Error(
          "No se pudo extraer texto del documento. Quizás es una imagen escaneada.",
        );
      }

      // Si todo salió bien hasta aquí le pasamos nuestro texto gigante a la función del asistente de IA para que nos lo resuma
      const aiSummary = await summarizeText(text);
      // Guardamos la respuesta resumida que nos dio la IA dentro de nuestro estado para que la pantalla se actualice y lo muestre
      setSummary(aiSummary as any);
    // Si algún servidor falla o nuestro error manual de archivo escaneado se dispara caemos en este bloque catch
    } catch (error: any) {
      // Usamos nuestra función de alertas para mostrar el mensaje de error en la pantalla y le decimos al usuario por qué falló
      showAlert(
        "Error con IA",
        error.message || "Ocurrió un error inesperado al analizar.",
        "error"
      );
    // Este bloque finally siempre se va a ejecutar pase lo que pase, ya sea que todo haya sido un éxito o haya explotado en mil pedazos
    } finally {
      // Apagamos la bandera de procesamiento para que la ruedita de carga desaparezca de la pantalla del usuario
      setProcessing(false);
    }
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
