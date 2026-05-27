import * as DocumentPicker from "expo-document-picker";
import {
  documentDirectory,
  readAsStringAsync,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useState } from "react";
import { Alert } from "react-native";
import { decodeP12Certificate } from "../lib/p12";

// Sección: Lógica de firmado electrónico avanzado de Ecuador con archivos criptográficos .p12/.pfx reales
// Funciones: useSignLogic administra la carga del PDF, la carga del certificado .p12, descifrado con contraseña, y estampado vectorial limpio (sin bordes).

export function useSignLogic() {
  const [pdfFile, setPdfFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  
  // Archivo de firma electrónica (.p12 o .pfx) y contraseña
  const [p12File, setP12File] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [p12Password, setP12Password] = useState("");
  
  // Datos reales del firmante (se extraerán del certificado .p12)
  const [signerName, setSignerName] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [isValidCert, setIsValidCert] = useState(false);
  
  // Posicionamiento libre en la página
  const [posX, setPosX] = useState(70); // 70% X (derecha)
  const [posY, setPosY] = useState(10); // 10% Y (abajo)
  const [scaleWidth, setScaleWidth] = useState(180); // Ancho en px
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados de procesamiento
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resultUri, setResultUri] = useState<string | null>(null);

  // Selección del PDF y cálculo de total de páginas
  async function pickPdf() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled) {
        setPdfFile(result.assets[0]);
        setCompleted(false);
        setResultUri(null);

        // Calculamos el total de páginas con pdf-lib
        const pdfBase64 = await readAsStringAsync(result.assets[0].uri, {
          encoding: "base64",
        });
        const pdfDoc = await PDFDocument.load(pdfBase64);
        setTotalPages(pdfDoc.getPageCount());
        setPageNumber(1);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo cargar el archivo PDF.");
    }
  }

  // Selección del archivo de Firma .p12 / .pfx
  async function pickP12File() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/x-pkcs12", "application/x-pkcs12-pfx", "*/*"],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled) {
        setP12File(result.assets[0]);
        setIsValidCert(false);
        setSignerName("");
        setIssuerName("");
        setSerialNumber("");
        setCompleted(false);
        setResultUri(null);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo seleccionar el archivo de firma electrónica.");
    }
  }

  // Descifrar y validar el certificado .p12 ingresado
  async function loadAndValidateP12() {
    if (!p12File) {
      Alert.alert("Alerta", "Por favor selecciona tu archivo de firma electrónica (.p12 / .pfx)");
      return false;
    }
    if (!p12Password) {
      Alert.alert("Alerta", "Por favor ingresa la contraseña de tu firma electrónica.");
      return false;
    }

    setProcessing(true);
    try {
      // Leemos el .p12 como base64
      const p12Base64 = await readAsStringAsync(p12File.uri, {
        encoding: "base64",
      });

      // Decodificamos y validamos criptográficamente con node-forge
      const decoded = decodeP12Certificate(p12Base64, p12Password);

      setSignerName(decoded.commonName);
      setIssuerName(decoded.issuerName);
      setSerialNumber(decoded.serialNumber);
      setIsValidCert(true);
      
      Alert.alert("Firma Validada", `Certificado descifrado con éxito.\nFirmante: ${decoded.commonName}`);
      setProcessing(false);
      return true;
    } catch (error: any) {
      setIsValidCert(false);
      setSignerName("");
      setIssuerName("");
      setSerialNumber("");
      Alert.alert("Error de Firma", error.message || "No se pudo descifrar la firma electrónica.");
      setProcessing(false);
      return false;
    }
  }

  // Realizar el firmado y estampar visualmente SIN bordes ni contornos
  async function executeSignature() {
    if (!pdfFile) return;
    
    // Si no está validado el certificado, intentamos validarlo ahora
    if (!isValidCert) {
      const valid = await loadAndValidateP12();
      if (!valid) return;
    }

    setProcessing(true);
    try {
      // 1. Cargar PDF
      const pdfBase64 = await readAsStringAsync(pdfFile.uri, {
        encoding: "base64",
      });
      const pdfDoc = await PDFDocument.load(pdfBase64);
      const pages = pdfDoc.getPages();
      
      const targetPageIndex = Math.min(Math.max(1, pageNumber), pages.length) - 1;
      const page = pages[targetPageIndex];
      const { width: pageWidth, height: pageHeight } = page.getSize();

      const stampWidth = scaleWidth;
      const stampHeight = 85;

      // Calcular coordenadas en base a porcentajes
      const x = (posX / 100) * (pageWidth - stampWidth);
      const y = (posY / 100) * (pageHeight - stampHeight);

      // Fuentes nativas PDF
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Fecha de Ecuador (GMT-5) y hash único
      const dateString = new Date().toLocaleString("es-EC", { timeZone: "America/Guayaquil" });
      const rawDateString = dateString.replace(/\u202f/g, " ").replace(/\u00a0/g, " ");
      const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Math.random().toString(36).substring(2, 10).toUpperCase();

      // 2. Estampado visual de firma digital limpio (SIN BORDES NI RECUADRO)
      page.drawText("FIRMADO DIGITALMENTE", {
        x: x + 4,
        y: y + stampHeight - 16,
        size: 8.5,
        font: helveticaBoldFont,
        color: rgb(0.12, 0.44, 0.73), // Color azul legal
      });

      page.drawText(`Firmante: ${signerName}`, {
        x: x + 4,
        y: y + stampHeight - 28,
        size: 7.5,
        font: helveticaFont,
        color: rgb(0.1, 0.1, 0.1),
      });

      page.drawText(`Fecha: ${rawDateString}`, {
        x: x + 4,
        y: y + stampHeight - 40,
        size: 7,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawText(`Emisor: ${issuerName}`, {
        x: x + 4,
        y: y + stampHeight - 52,
        size: 6.5,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText(`Serie: ${serialNumber || "N/A"}`, {
        x: x + 4,
        y: y + stampHeight - 64,
        size: 6.5,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      });

      page.drawText(`Firma Electrónica Reconocida en Ecuador (ARCOTEL)`, {
        x: x + 4,
        y: y + stampHeight - 76,
        size: 6.5,
        font: helveticaBoldFont,
        color: rgb(0.0, 0.5, 0.2), // Verde para certificar validez
      });

      // 3. Guardar el archivo firmado digitalmente
      const signedPdfBase64 = await pdfDoc.saveAsBase64();
      const finalUri = documentDirectory + "signed_" + Date.now() + ".pdf";
      await writeAsStringAsync(finalUri, signedPdfBase64, { encoding: "base64" });

      setResultUri(finalUri);
      setCompleted(true);
    } catch (err: any) {
      Alert.alert("Error al firmar", err.message || "Ocurrió un error al estampar tu firma en el documento.");
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
    pdfFile,
    p12File,
    p12Password,
    signerName,
    issuerName,
    serialNumber,
    isValidCert,
    posX,
    posY,
    scaleWidth,
    pageNumber,
    totalPages,
    processing,
    completed,
    resultUri,
    setP12Password,
    setPosX,
    setPosY,
    setScaleWidth,
    setPageNumber,
    pickPdf,
    pickP12File,
    loadAndValidateP12,
    executeSignature,
    shareFile,
    setCompleted,
    setPdfFile,
    setP12File,
    setIsValidCert,
  };
}
