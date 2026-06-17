import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { useCustomAlert } from "@/shared/context/AlertContext";
import { extractTextFromPdf, uploadFileToPdfco, convertHtmlToPdf } from "@/features/pdf/shared/services/pdfco";
import { translateText } from "../services/translationService";
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export const LANGUAGES = [
  { id: 'es', name: 'Español 🇪🇸' },
  { id: 'en', name: 'Inglés 🇬🇧' },
  { id: 'fr', name: 'Francés 🇫🇷' },
  { id: 'de', name: 'Alemán 🇩🇪' },
  { id: 'it', name: 'Italiano 🇮🇹' },
];

export function useTranslation() {
  const { showAlert } = useCustomAlert();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  
  const [sourceLang, setSourceLang] = useState('es');
  const [targetLang, setTargetLang] = useState('en');

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFile(result.assets[0]);
        setTranslatedText(null);
      }
    } catch (err) {
      showAlert("Error", "No se pudo seleccionar el archivo", "error");
    }
  }

  async function processTranslation() {
    if (!file) return;
    if (sourceLang === targetLang) {
      showAlert("Atención", "El idioma de origen y destino no pueden ser iguales.", "warning");
      return;
    }

    setProcessing(true);
    try {
      setProcessingStep("Subiendo documento a la nube...");
      const uploadedUrl = await uploadFileToPdfco(file.uri, file.name);
      
      setProcessingStep("Extrayendo texto del PDF...");
      const text = await extractTextFromPdf(uploadedUrl);

      if (!text || text.trim().length === 0) {
        throw new Error(
          "No se pudo extraer texto del documento. Quizás es una imagen escaneada.",
        );
      }

      setProcessingStep("Traduciendo documento...");
      
      const sourceName = LANGUAGES.find(l => l.id === sourceLang)?.name || sourceLang;
      const targetName = LANGUAGES.find(l => l.id === targetLang)?.name || targetLang;
      
      const translation = await translateText(text, sourceName, targetName);
      setTranslatedText(translation);
      
    } catch (error: any) {
      showAlert(
        "Error en la traducción",
        error.message || "Ocurrió un error inesperado al traducir.",
        "error"
      );
    } finally {
      setProcessing(false);
      setProcessingStep("");
    }
  }

  // Generate a plain text version for the UI and Clipboard
  const getPlainText = () => {
    if (!translatedText) return null;
    return translatedText
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/g, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]*>?/gm, '') // Strip remaining HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z]+;/gi, '') // Strip other HTML entities
      .trim();
  };

  const displayTranslatedText = getPlainText();

  async function copyToClipboard() {
    if (!displayTranslatedText) return;
    await Clipboard.setStringAsync(displayTranslatedText);
    showAlert("Copiado", "Texto traducido copiado al portapapeles", "success");
  }

  async function exportAsPdf() {
    if (!translatedText || !file) return;
    setProcessing(true);
    setProcessingStep("Generando PDF...");
    try {
      // Get original filename without extension
      const originalName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "documento";
      const finalPdfName = `${originalName}_${targetLang.toUpperCase()}.pdf`;

      let cleanHtml = translatedText.replace(/```html\n?/gi, '').replace(/```\n?/g, '').trim();

      // Basic HTML structure for the translation
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
      const pdfcoResponse = await fetch('https://api.pdf.co/v1/pdf/convert/from/html', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.EXPO_PUBLIC_PDFCO_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          html: htmlContent,
          name: finalPdfName
        })
      });

      const pdfcoData = await pdfcoResponse.json();
      if (pdfcoData.error) {
        throw new Error(pdfcoData.message || "Error al convertir HTML a PDF");
      }

      const pdfUrl = pdfcoData.url;
      
      // Download the result
      const downloadPath = `${FileSystem.documentDirectory}${finalPdfName}`;
      const { uri } = await FileSystem.downloadAsync(pdfUrl, downloadPath);
      
      // Share/Save the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        showAlert("Éxito", "PDF generado correctamente. Guardado en dispositivo.", "success");
      }
      
    } catch (error: any) {
      showAlert("Error", "No se pudo exportar a PDF: " + error.message, "error");
    } finally {
      setProcessing(false);
      setProcessingStep("");
    }
  }

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
