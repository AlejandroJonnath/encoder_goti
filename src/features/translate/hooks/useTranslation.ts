// SECCION DE IMPORTACIONES
// Para que el usuario pueda escoger un archivo PDF de su celular
import * as DocumentPicker from "expo-document-picker";
// El clásico gestor de estados de React
import { useState } from "react";
// Nuestro sistema de mensajes emergentes personalizados
import { useCustomAlert } from "@/shared/context/AlertContext";
// Las herramientas que hablan con PDF.co para subir y extraer texto
import { extractTextFromPdf, uploadFileToPdfco, convertHtmlToPdf } from "@/features/pdf/shared/services/pdfco";
// El cerebro que hace la traducción de texto con Groq o Gemini
import { translateText } from "../services/translationService";
// Para copiar el resultado al portapapeles del celular
import * as Clipboard from 'expo-clipboard';
// Para leer y escribir archivos en el almacenamiento del celular
import * as FileSystem from 'expo-file-system/legacy';
// Para compartir el PDF traducido con WhatsApp u otras apps
import * as Sharing from 'expo-sharing';

// Sección: Hook de lógica para el Traductor de PDFs con IA (Groq/Gemini) y exportación a PDF
// Funciones: pickDocument, processTranslation, copyToClipboard, exportAsPdf

// CONSTANTE: LANGUAGES
// La lista de idiomas disponibles para traducir; si la quitas ya no habrá opciones de idioma en la pantalla
export const LANGUAGES = [
  // España con su bandera emoji
  { id: 'es', name: 'Español 🇪🇸' },
  // Reino Unido con su bandera
  { id: 'en', name: 'Inglés 🇬🇧' },
  // Francia
  { id: 'fr', name: 'Francés 🇫🇷' },
  // Alemania
  { id: 'de', name: 'Alemán 🇩🇪' },
  // Italia con su bandera verde, blanca y roja
  { id: 'it', name: 'Italiano 🇮🇹' },
];

// FUNCION: useTranslation
// El hook central que maneja toda la traducción paso a paso
export function useTranslation() {
  // Sacamos la función para mostrar ventanitas de alerta
  const { showAlert } = useCustomAlert();
  // El archivo PDF que escogió el usuario
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  // Indica si estamos en mitad de un proceso largo
  const [processing, setProcessing] = useState(false);
  // El mensaje que explica qué está pasando mientras se procesa
  const [processingStep, setProcessingStep] = useState("");
  // El texto ya traducido listo para mostrar
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  
  // El idioma de origen seleccionado (por defecto español)
  const [sourceLang, setSourceLang] = useState('es');
  // El idioma destino seleccionado (por defecto inglés)
  const [targetLang, setTargetLang] = useState('en');

  // FUNCION: pickDocument
  // Abre el explorador de archivos del celular filtrado solo para PDFs
  async function pickDocument() {
    // Zona de captura de errores
    try {
      // Abrimos el explorador con filtro de PDF
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        // Hacemos copia al cache para poder leerlo aunque sea de un directorio protegido
        copyToCacheDirectory: true,
      });

      // Si el usuario no canceló
      if (!result.canceled) {
        // Guardamos el archivo seleccionado
        setFile(result.assets[0]);
        // Limpiamos cualquier traducción anterior para evitar confusiones
        setTranslatedText(null);
      }
    // Si el explorador crasha por permisos o lo que sea
    } catch (err) {
      showAlert("Error", "No se pudo seleccionar el archivo", "error");
    }
  }

  // FUNCION: processTranslation
  // El proceso en tres pasos: subir el PDF, extraer texto y traducirlo
  async function processTranslation() {
    // Si no hay archivo no hacemos nada
    if (!file) return;
    // Si pusieron el mismo idioma para origen y destino los regañamos
    if (sourceLang === targetLang) {
      showAlert("Atención", "El idioma de origen y destino no pueden ser iguales.", "warning");
      return;
    }

    // Encendemos la rueda de carga
    setProcessing(true);
    // Zona de captura de errores de toda la operación
    try {
      // Paso 1: avisamos y subimos el archivo
      setProcessingStep("Subiendo documento a la nube...");
      // Mandamos el PDF a PDF.co y recibimos la URL del archivo en la nube
      const uploadedUrl = await uploadFileToPdfco(file.uri, file.name);
      
      // Paso 2: avisamos y extraemos el texto del PDF
      setProcessingStep("Extrayendo texto del PDF...");
      // Le pedimos a PDF.co que lea el PDF y nos escupa el texto puro
      const text = await extractTextFromPdf(uploadedUrl);

      // Si el texto resultante está vacío o son puros espacios
      if (!text || text.trim().length === 0) {
        // Probablemente es un PDF escaneado que no tiene texto real sino una imagen
        throw new Error(
          "No se pudo extraer texto del documento. Quizás es una imagen escaneada.",
        );
      }

      // Paso 3: traducimos el texto con la IA
      setProcessingStep("Traduciendo documento...");
      
      // Buscamos el nombre legible del idioma de origen para dárselo a la IA como instrucción
      const sourceName = LANGUAGES.find(l => l.id === sourceLang)?.name || sourceLang;
      // Igual para el idioma destino
      const targetName = LANGUAGES.find(l => l.id === targetLang)?.name || targetLang;
      
      // Llamamos al motor de traducción que intentará con Groq primero y Gemini de respaldo
      const translation = await translateText(text, sourceName, targetName);
      // Guardamos el resultado para que la pantalla lo muestre
      setTranslatedText(translation);
      
    // Si algo falla en cualquiera de los tres pasos
    } catch (error: any) {
      showAlert(
        "Error en la traducción",
        // Si el error trae mensaje se lo mostramos, si no mandamos uno genérico
        error.message || "Ocurrió un error inesperado al traducir.",
        "error"
      );
    } finally {
      // Ya sea éxito o error apagamos la rueda de carga siempre
      setProcessing(false);
      // Y borramos el mensaje de estado
      setProcessingStep("");
    }
  }

  // Generate a plain text version for the UI and Clipboard
  // FUNCION: getPlainText
  // Convierte el HTML que regresó la IA en texto plano legible para humanos
  const getPlainText = () => {
    // Si no hay traducción devolvemos nulo
    if (!translatedText) return null;
    return translatedText
      // Borramos el inicio del bloque de código markdown de HTML
      .replace(/```html\n?/gi, '')
      // Borramos el cierre del bloque de código
      .replace(/```\n?/g, '')
      // Convertimos las etiquetas de salto de línea HTML en saltos reales
      .replace(/<br\s*\/?>/gi, '\n')
      // Convertimos los cierres de párrafo en dobles saltos
      .replace(/<\/p>/gi, '\n\n')
      // Convertimos los cierres de títulos en dobles saltos
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]*>?/gm, '') // Strip remaining HTML tags
      // Reemplazamos la entidad HTML de espacio duro por un espacio normal
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z]+;/gi, '') // Strip other HTML entities
      // Eliminamos los espacios sobrantes al principio y al final
      .trim();
  };

  // Guardamos el texto plano calculado en una variable para no recalcularlo mil veces
  const displayTranslatedText = getPlainText();

  // FUNCION: copyToClipboard
  // Copia el texto traducido limpio al portapapeles del teléfono
  async function copyToClipboard() {
    // Si no hay texto limpio no hay nada que copiar
    if (!displayTranslatedText) return;
    // Copiamos el texto al portapapeles
    await Clipboard.setStringAsync(displayTranslatedText);
    // Le avisamos al usuario que ya está copiado
    showAlert("Copiado", "Texto traducido copiado al portapapeles", "success");
  }

  // FUNCION: exportAsPdf
  // Toma la traducción en HTML y la convierte en un PDF descargable y compartible
  async function exportAsPdf() {
    // Si no hay traducción ni archivo de origen no hacemos nada
    if (!translatedText || !file) return;
    // Encendemos la rueda de proceso
    setProcessing(true);
    setProcessingStep("Generando PDF...");
    // Zona de seguridad
    try {
      // Get original filename without extension
      // Quitamos la extensión al nombre original del archivo para el nombre final
      const originalName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "documento";
      // Construimos el nombre final con el idioma destino en mayúsculas como sufijo
      const finalPdfName = `${originalName}_${targetLang.toUpperCase()}.pdf`;

      // Limpiamos la traducción quitando cualquier markdown que haya sobrevivido
      let cleanHtml = translatedText.replace(/```html\n?/gi, '').replace(/```\n?/g, '').trim();

      // Basic HTML structure for the translation
      // Creamos un documento HTML completo con estilos embebidos para que el PDF se vea bonito
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; line-height: 1.6; color: #333; }
            .content { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="content">${cleanHtml}</div>
        </body>
        </html>
      `;

      // Call PDF.co directly with the raw HTML string
      // Mandamos el HTML directamente a PDF.co usando fetch para que nos devuelva un PDF listo
      const pdfcoResponse = await fetch('https://api.pdf.co/v1/pdf/convert/from/html', {
        method: 'POST',
        headers: {
          // Nuestra llave de PDF.co desde el entorno seguro
          'x-api-key': process.env.EXPO_PUBLIC_PDFCO_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Le mandamos el HTML completo como string
          html: htmlContent,
          // El nombre que queremos para el PDF resultante
          name: finalPdfName
        })
      });

      // Convertimos la respuesta a JSON para ver qué nos contestaron
      const pdfcoData = await pdfcoResponse.json();
      // Si PDF.co reporta error
      if (pdfcoData.error) {
        throw new Error(pdfcoData.message || "Error al convertir HTML a PDF");
      }

      // La URL del PDF recién horneado en la nube de PDF.co
      const pdfUrl = pdfcoData.url;
      
      // Download the result
      // Construimos la ruta local donde guardamos el PDF en el celular
      const downloadPath = `${FileSystem.documentDirectory}${finalPdfName}`;
      // Descargamos el PDF de la nube al almacenamiento local del celular
      const { uri } = await FileSystem.downloadAsync(pdfUrl, downloadPath);
      
      // Share/Save the file
      // Si el sistema soporta compartir archivos (casi siempre sí)
      if (await Sharing.isAvailableAsync()) {
        // Compartimos el PDF con las apps del celular
        await Sharing.shareAsync(uri);
      } else {
        // Si no se puede compartir al menos avisamos que se guardó
        showAlert("Éxito", "PDF generado correctamente. Guardado en dispositivo.", "success");
      }
      
    // Si algo falla durante la exportación
    } catch (error: any) {
      showAlert("Error", "No se pudo exportar a PDF: " + error.message, "error");
    } finally {
      // Apagamos la rueda siempre
      setProcessing(false);
      setProcessingStep("");
    }
  }

  // Devolvemos todo lo necesario para que la pantalla pueda funcionar
  return {
    file,
    processing,
    processingStep,
    translatedText,
    sourceLang,
    targetLang,
    pickDocument,
    processTranslation,
    setFile,
    setSourceLang,
    setTargetLang,
    copyToClipboard,
    exportAsPdf,
    setTranslatedText,
    displayTranslatedText
  };
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas processTranslation? pasa que el botón de traducir quedará pintado pero al apretarlo no pasará absolutamente nada porque es esa función la que coordina subir, extraer y traducir el texto
// para solucionarlo debes volver a crear la función que llama secuencialmente a uploadFileToPdfco, extractTextFromPdf y translateText guardando cada resultado para el siguiente paso
// ¿qué pasa si quitas exportAsPdf? pasa que el botón de exportar PDF quedará inservible y el usuario no podrá llevarse la traducción como documento PDF sino solo copiarla al portapapeles
// para solucionarlo debes volver a implementar la función que construye el HTML, lo manda a PDF.co y descarga el resultado al celular
