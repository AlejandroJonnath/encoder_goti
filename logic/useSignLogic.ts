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
        type: ["application/x-pkcs12", "application/x-pkcs12-pfx"],
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

  // Realizar el firmado criptográfico enviando los datos al Backend
  async function executeSignature() {
    if (!pdfFile) return;
    
    // Si no está validado el certificado, intentamos validarlo ahora
    if (!isValidCert) {
      const valid = await loadAndValidateP12();
      if (!valid) return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", {
        uri: pdfFile.uri,
        name: pdfFile.name || "document.pdf",
        type: "application/pdf",
      } as any);
      
      formData.append("p12", {
        uri: p12File!.uri,
        name: p12File!.name || "firma.p12",
        type: "application/x-pkcs12",
      } as any);

      formData.append("password", p12Password);
      formData.append("posX", posX.toString());
      formData.append("posY", posY.toString());

      // IP fallback: si estás en tu PC local, usarás una IP o un servicio hosteado
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.1.10:3000"; // <-- Cambiar esta IP a la local de tu PC si usas expo go

      const response = await fetch(`${backendUrl}/api/sign`, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/pdf",
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Error en el servidor de firmas");
      }

      // Convertir la respuesta Blob del servidor a Base64 y guardarla
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(",")[1];
        if (base64data) {
          const finalUri = documentDirectory + "signed_" + Date.now() + ".pdf";
          await writeAsStringAsync(finalUri, base64data, { encoding: "base64" });
          setResultUri(finalUri);
          setCompleted(true);
          setProcessing(false);
        }
      };
      
      return; // El bloque onloadend se encarga de terminar el estado
    } catch (err: any) {
      Alert.alert("Error al firmar", err.message || "Ocurrió un error al estampar tu firma en el documento.");
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
