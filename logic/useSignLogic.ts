import * as DocumentPicker from "expo-document-picker";
import {
    documentDirectory,
    readAsStringAsync,
    writeAsStringAsync,
} from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import { Alert } from "react-native";

// Sección: Hook con toda la lógica para la pantalla de firmar PDFs
// Funciones: useSignLogic expone estados y funciones para seleccionar PDF imagen de firma posicionar procesar y compartir el PDF firmado

type Position =
  | "top-left"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-right";

export function useSignLogic() {
  const [pdfFile, setPdfFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [signatureImage, setSignatureImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resultUri, setResultUri] = useState<string | null>(null);

  async function pickPdf() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) setPdfFile(result.assets[0]);
    } catch (err) {
      Alert.alert("Error", "No se pudo seleccionar el PDF");
    }
  }

  async function pickSignature() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso Denegado",
          "Necesitamos acceso a la galería para seleccionar la firma.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) setSignatureImage(result.assets[0]);
    } catch (err) {
      Alert.alert("Error", "No se pudo seleccionar la imagen de la firma");
    }
  }

  async function processSign() {
    if (!pdfFile || !signatureImage) return;
    setProcessing(true);
    try {
      const pdfBase64 = await readAsStringAsync(pdfFile.uri, {
        encoding: "base64",
      });
      const pdfDoc = await PDFDocument.load(pdfBase64);

      const imageBase64 = await readAsStringAsync(signatureImage.uri, {
        encoding: "base64",
      });
      let img;
      try {
        if (
          signatureImage.mimeType === "image/png" ||
          signatureImage.uri.toLowerCase().endsWith(".png")
        ) {
          img = await pdfDoc.embedPng(imageBase64);
        } else {
          img = await pdfDoc.embedJpg(imageBase64);
        }
      } catch (e) {
        try {
          img = await pdfDoc.embedPng(imageBase64);
        } catch (e2) {
          img = await pdfDoc.embedJpg(imageBase64);
        }
      }

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      const imgDims = img.scaleToFit(150, 150);

      let x = 50;
      let y = 50;
      switch (position) {
        case "bottom-right":
          x = width - imgDims.width - 50;
          y = 50;
          break;
        case "bottom-left":
          x = 50;
          y = 50;
          break;
        case "top-right":
          x = width - imgDims.width - 50;
          y = height - imgDims.height - 50;
          break;
        case "top-left":
          x = 50;
          y = height - imgDims.height - 50;
          break;
        case "center":
          x = (width - imgDims.width) / 2;
          y = (height - imgDims.height) / 2;
          break;
      }

      firstPage.drawImage(img, {
        x,
        y,
        width: imgDims.width,
        height: imgDims.height,
      });
      const pdfBytes = await pdfDoc.saveAsBase64();
      const finalUri = documentDirectory + "signed_" + Date.now() + ".pdf";
      await writeAsStringAsync(finalUri, pdfBytes, { encoding: "base64" });

      setResultUri(finalUri);
      setCompleted(true);
    } catch (error: any) {
      Alert.alert("Error detallado", error.message || "Error desconocido");
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
    signatureImage,
    position,
    processing,
    completed,
    resultUri,
    pickPdf,
    pickSignature,
    processSign,
    shareFile,
    setPdfFile,
    setSignatureImage,
    setPosition,
    setCompleted,
    setResultUri,
    setProcessing,
  };
}

// si quitas la función SignScreen el usuario nunca podrá utilizar la herramienta de firmas
// si quitas la función pickPdf no se podrá seleccionar el PDF base
// si quitas la función pickSignature el usuario no podrá subir fotos de su propia galería
// si quitas la función processSign el motor local de firmas fallará
