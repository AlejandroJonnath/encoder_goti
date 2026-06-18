// SECCION DE IMPORTACIONES
// Importamos la herramienta nativa para que el celular nos deje explorar nuestros archivos
import * as DocumentPicker from "expo-document-picker";
// Importamos las utilidades para saber dónde guardar archivos descargados y la función para descargarlos
import { documentDirectory, downloadAsync } from "expo-file-system/legacy";
// Traemos la librería que nos permite usar la hoja de compartir de android o ios
import * as Sharing from "expo-sharing";
// Importamos useState de React para ir guardando el estado de nuestra pantalla de conversión
import { useState } from "react";
// Importamos nuestro servicio especial que sube el archivo a pdfco para procesarlo
import { uploadFileToPdfco } from "@/features/pdf/shared/services/pdfco";
// Traemos la función para disparar las alertas flotantes bonitas
import { useCustomAlert } from "@/shared/context/AlertContext";
// Some environments may not export convertPdfTo as a named export; fall back to require at runtime
// eslint-disable-next-line @typescript-eslint/no-var-requires
// Importamos usando require tradicional por un problema técnico con la librería en algunos entornos
const { convertPdfTo } = require("@/features/pdf/shared/services/pdfco");

// SECCION PRINCIPAL DEL HOOK
// FUNCION: usePdfConversion
// Exportamos la función cerebro que controla todas las conversiones de la app
export function usePdfConversion() {
  // Sacamos la herramienta de alertas
  const { showAlert } = useCustomAlert();
  // Estado para el archivo actual seleccionado
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  // Estado para controlar cuándo prender la ruedita morada o verde
  const [processing, setProcessing] = useState(false);
  // Estado para mostrar la palomita cuando el archivo ya está convertido
  const [completed, setCompleted] = useState(false);
  // Estado para guardar la ruta del archivo ya transformado y descargado
  const [resultUri, setResultUri] = useState<string | null>(null);

  // FUNCION: pickDocument
  // Abre el selector de archivos pero mágicamente solo te deja elegir los archivos correctos según lo que vayas a convertir
  async function pickDocument(conversionType?: string) {
    // Usamos try por si el usuario se arrepiente a medio camino
    try {
      // Empezamos permitiendo cualquier archivo por defecto por si acaso
      let allowedTypes: string | string[] = "*/*";

      // Si nos dijeron qué tipo de conversión quieren hacemos un switch para filtrar los archivos
      if (conversionType) {
        switch (conversionType) {
          // Si van a convertir a word o de word a pdf
          case "word":
          case "word-to-pdf":
            // Solo dejamos que seleccionen documentos de word viejos o nuevos
            allowedTypes = [
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              ".doc", ".docx"
            ];
            break;
          // Si van a convertir excel
          case "excel":
          case "to-excel":
            // Si van de PDF a excel solo dejamos PDFs
            if (conversionType === "to-excel") {
              allowedTypes = ["application/pdf", ".pdf"];
            // Si van de excel a PDF solo dejamos hojas de cálculo
            } else {
              allowedTypes = [
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".xls", ".xlsx"
              ];
            }
            break;
          // Si van a convertir presentaciones
          case "ppt":
            // Filtramos puros powerpoints
            allowedTypes = [
              "application/vnd.ms-powerpoint",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              ".ppt", ".pptx"
            ];
            break;
          // Si son imágenes jpg
          case "jpg":
          case "img-to-pdf":
            // Permitimos solo archivos de imagen jpeg
            allowedTypes = ["image/jpeg", "image/jpg", ".jpg", ".jpeg"];
            break;
          // Si son imágenes png
          case "png":
            // Solo formato png
            allowedTypes = ["image/png", ".png"];
            break;
          // Si son archivos web
          case "html":
            // Solo páginas web
            allowedTypes = ["text/html", ".html", ".htm"];
            break;
          // Si es texto plano
          case "txt":
            // Solo blocs de notas
            allowedTypes = ["text/plain", ".txt"];
            break;
          // Para todas las funciones que parten desde un pdf hacia otro formato
          case "to-word":
          case "to-jpg":
          case "to-png":
            // Obligamos a que solo puedan elegir PDFs
            allowedTypes = ["application/pdf", ".pdf"];
            break;
          // Por si nos mandan un tipo que no conocemos
          default:
            allowedTypes = "*/*";
        }
      }

      // Llamamos al explorador de archivos pasándole nuestra lista de formatos permitidos
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true,
      });
      // Si el usuario no presionó cancelar
      if (!result.canceled) {
        // Guardamos el primer archivo que eligió
        setFile(result.assets[0]);
        // Reiniciamos todo el estado para empezar frescos
        setCompleted(false);
        setResultUri(null);
      }
    // Atrapamos errores raros del teléfono
    } catch (err) {
      showAlert("Error", "No se pudo seleccionar el archivo", "error");
    }
  }

  // FUNCION: processConversion
  // Es la que hace toda la magia mandando el archivo a la nube y bajando el convertido
  async function processConversion(convertType: string) {
    // Si no hay archivo no hacemos nada
    if (!file) return;
    // Activamos la ruedita
    setProcessing(true);
    // Empezamos la operación riesgosa de red
    try {
      // Primero subimos nuestro archivo temporalmente a los servidores de pdfco y nos guardamos su URL temporal
      const uploadedUrl = await uploadFileToPdfco(file.uri, file.name);
      // Luego le decimos a pdfco que agarre ese archivo temporal y lo convierta a lo que necesitemos
      const convertedUrl = await convertPdfTo(uploadedUrl, convertType);

      // Preparamos qué extensión le vamos a poner al archivo final basándonos en lo que pedimos
      let ext = ".pdf";
      if (convertType === "doc") ext = ".doc";
      else if (convertType === "xls") ext = ".xlsx";
      else if (convertType === "jpg") ext = ".jpg";
      else if (convertType === "png") ext = ".png";

      // Armamos un nombre por defecto por si las moscas usando la fecha actual
      let originalName = "converted_" + Date.now();
      // Si nuestro archivo original tenía nombre intentamos robárselo
      if (file && file.name) {
        // Buscamos dónde está el punto de la extensión vieja
        const lastDotIndex = file.name.lastIndexOf(".");
        // Si sí tenía un punto
        if (lastDotIndex !== -1) {
          // Cortamos el nombre justo antes del punto para quitarle la extensión vieja
          originalName = file.name.substring(0, lastDotIndex);
        // Si era un archivo raro sin extensión
        } else {
          // Usamos el nombre completo
          originalName = file.name;
        }
      }

      // Procedemos a descargar el archivo ya convertido desde la nube hacia nuestra carpeta local pegándole el nombre nuevo y la extensión nueva
      const downloadRes = await downloadAsync(
        convertedUrl,
        documentDirectory + originalName + ext,
      );
      // Guardamos la ruta del archivo ya descargadito
      setResultUri(downloadRes.uri);
      // Festejamos marcando como completado
      setCompleted(true);
    // Atrapamos cualquier error que haya botado la api de pdfco
    } catch (error: any) {
      showAlert("Error", error.message || "Ocurrió un error", "error");
    // Al final siempre escondemos la ruedita
    } finally {
      setProcessing(false);
    }
  }

  // FUNCION: shareFile
  // Para mandar el archivo final a los cuates
  async function shareFile() {
    // Revisamos que sí tengamos algo que compartir y que el celular no esté bloqueado
    if (resultUri && (await Sharing.isAvailableAsync())) {
      // Disparamos la hoja de compartir nativa
      await Sharing.shareAsync(resultUri);
    }
  }

  // Empaquetamos todo en el retorno
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

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la lógica del switch de conversionType en pickDocument? pasa que el usuario podrá elegir literalmente cualquier archivo (como un mp3) para intentar convertirlo a PDF haciendo que la aplicación crashee horriblemente cuando se mande al servidor
// para solucionarlo debes volver a implementar el switch de tipos MIME asegurando que el DocumentPicker solo permita los formatos correctos
// ¿qué pasa si borras la línea de convertPdfTo? pasa que la aplicación subirá el archivo con éxito pero jamás le ordenará al servidor que lo procese así que el código explotará cuando intentes descargar un archivo que nunca se convirtió
// para solucionarlo restaura la llamada a convertPdfTo pasándole la url temporal que te dio el paso anterior
