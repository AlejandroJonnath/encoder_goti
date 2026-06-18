// SECCION DE IMPORTACIONES
// Importamos el recolector de documentos del celular
import * as DocumentPicker from "expo-document-picker";
// Nos traemos utilidades del sistema de archivos para guardar cosas o leerlas completas
import {
  documentDirectory,
  readAsStringAsync,
  writeAsStringAsync,
} from "expo-file-system/legacy";
// Importamos la habilidad de compartir archivos con el exterior
import * as Sharing from "expo-sharing";
// Librería pesada para jugar con PDFs nativos aunque solo la usaremos poquito
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
// Hook maestro de react para nuestra memoria local
import { useState } from "react";
// Importamos nuestro destripador de firmas ecuatorianas
import { decodeP12Certificate } from "@/features/pdf/shared/services/p12";
// Traemos el sistema de mensajitos emergentes
import { useCustomAlert } from "@/shared/context/AlertContext";

// Sección: Lógica de firmado electrónico avanzado de Ecuador con archivos criptográficos .p12/.pfx reales
// Funciones: usePdfSignature administra la carga del PDF, la carga del certificado .p12, descifrado con contraseña, y estampado vectorial limpio (sin bordes).

// FUNCION: usePdfSignature
// Este es el cerebro que hace que la firma electrónica funcione
export function usePdfSignature() {
  // Sacamos el método para mandar alertas
  const { showAlert } = useCustomAlert();
  // Estado para memorizar el PDF que queremos rayar
  const [pdfFile, setPdfFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // Archivo de firma electrónica (.p12 o .pfx) y contraseña
  // Estado para el archivo secreto de la firma
  const [p12File, setP12File] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  // Estado para guardar la clave que destraba esa firma
  const [p12Password, setP12Password] = useState("");

  // Datos reales del firmante (se extraerán del certificado .p12)
  // Guardamos el nombre del bato que firma
  const [signerName, setSignerName] = useState("");
  // Guardamos la empresa que certifica
  const [issuerName, setIssuerName] = useState("");
  // Guardamos el código raro único de esa firma
  const [serialNumber, setSerialNumber] = useState("");
  // Bandera para saber si ya abrimos el cofre de la firma correctamente
  const [isValidCert, setIsValidCert] = useState(false);

  // Posicionamiento libre en la página
  // Para mover la firma a la derecha o izquierda (empieza tirado a la derecha)
  const [posX, setPosX] = useState(70); // 70% X (derecha)
  // Para mover la firma arriba o abajo (empieza casi hasta abajo)
  const [posY, setPosY] = useState(10); // 10% Y (abajo)
  // Qué tan gordita o flaca será la firma (ancho)
  const [scaleWidth, setScaleWidth] = useState(180); // Ancho en px
  // En qué hoja del documento queremos manchar nuestra firma
  const [pageNumber, setPageNumber] = useState(1);
  // Cuántas hojas totales tiene nuestro archivo para no pasarnos
  const [totalPages, setTotalPages] = useState(1);

  // Estados de procesamiento
  // Ruedita girando o apagada
  const [processing, setProcessing] = useState(false);
  // Pantalla de fiesta encendida o apagada
  const [completed, setCompleted] = useState(false);
  // En qué ruta se quedó guardado el pdf final
  const [resultUri, setResultUri] = useState<string | null>(null);

  // Selección del PDF y cálculo de total de páginas
  // FUNCION: pickPdf
  // Nos deja escoger nuestro documento a firmar
  async function pickPdf() {
    // Zona de control de daños
    try {
      // Disparamos la galería enfocada solo en PDFs
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        // Hacemos un clon al cache
        copyToCacheDirectory: true,
      });

      // Si terminaron y no se echaron para atrás
      if (!result.canceled) {
        // Memorizamos el primer archivo seleccionado
        setPdfFile(result.assets[0]);
        // Apagamos la fiesta
        setCompleted(false);
        // Borramos el rastro del archivo anterior
        setResultUri(null);

        // Calculamos el total de páginas con pdf-lib
        // Leemos todo nuestro pdf convirtiéndolo en un texto gigante estilo base64
        const pdfBase64 = await readAsStringAsync(result.assets[0].uri, {
          encoding: "base64",
        });
        // Despertamos al lector de pdfs pesado para que analice esa cadena de texto
        const pdfDoc = await PDFDocument.load(pdfBase64);
        // Le preguntamos cuántas páginas encontró y las guardamos
        setTotalPages(pdfDoc.getPageCount());
        // Reseteamos el paginador a la hoja uno
        setPageNumber(1);
      }
    // Si falla la carga nos quejamos
    } catch (err) {
      showAlert("Error", "No se pudo cargar el archivo PDF.", "error");
    }
  }

  // Selección del archivo de Firma .p12 / .pfx
  // FUNCION: pickP12File
  // Para ir a buscar esa firma que compramos en security data
  async function pickP12File() {
    // Intentamos abrir la mochila
    try {
      // Forzamos al explorador a mostrar solo archivos especiales de certificado
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/x-pkcs12", "application/x-pkcs12-pfx"],
        // Traemos copia al cache
        copyToCacheDirectory: true,
      });

      // Si no arruinaron el proceso
      if (!result.canceled) {
        // Guardamos la firma
        setP12File(result.assets[0]);
        // Como es firma nueva forzamos a que vuelva a meter contraseña invalidando la anterior
        setIsValidCert(false);
        // Borramos todo rastro de nombres viejos
        setSignerName("");
        setIssuerName("");
        setSerialNumber("");
        // Apagamos cualquier festejo previo
        setCompleted(false);
        setResultUri(null);
      }
    // Si truena la galería tiramos alerta
    } catch (err) {
      showAlert("Error", "No se pudo seleccionar el archivo de firma electrónica.", "error");
    }
  }

  // Descifrar y validar el certificado .p12 ingresado
  // FUNCION: loadAndValidateP12
  // Lee la firma y verifica que la contraseña que tipeaste no esté mal
  async function loadAndValidateP12() {
    // Si pican el botón pero ni han subido la firma los regañamos
    if (!p12File) {
      showAlert("Alerta", "Por favor selecciona tu archivo de firma electrónica (.p12 / .pfx)", "warning");
      return false;
    }
    // Si pican sin haber tipeado su clave secreta también regañamos
    if (!p12Password) {
      showAlert("Alerta", "Por favor ingresa la contraseña de tu firma electrónica.", "warning");
      return false;
    }

    // Prendemos motor de procesamiento
    setProcessing(true);
    // Probamos suerte rompiendo el candado
    try {
      // Leemos el .p12 como base64
      // Convertimos el archivo enano del certificado a puro texto
      const p12Base64 = await readAsStringAsync(p12File.uri, {
        encoding: "base64",
      });

      // Decodificamos y validamos criptográficamente con node-forge
      // Se lo pasamos a nuestra llave maestra para que escupa los datos sucios
      const decoded = decodeP12Certificate(p12Base64, p12Password);

      // Si pasamos la trampa guardamos los tesoros
      setSignerName(decoded.commonName);
      setIssuerName(decoded.issuerName);
      setSerialNumber(decoded.serialNumber);
      // Bajamos bandera verde de validación
      setIsValidCert(true);

      // Les damos palmadita en la espalda
      showAlert("Firma Validada", `Certificado descifrado con éxito.\nFirmante: ${decoded.commonName}`, "success");
      // Apagamos motor
      setProcessing(false);
      // Retornamos verdadero porque ganamos
      return true;
    // Si la contraseña estaba mal y explota
    } catch (error: any) {
      // Bajamos la bandera a rojo
      setIsValidCert(false);
      // Borramos cualquier nombre corrupto
      setSignerName("");
      setIssuerName("");
      setSerialNumber("");
      // Le explicamos al usuario por qué falló
      showAlert("Error de Firma", error.message || "No se pudo descifrar la firma electrónica.", "error");
      // Detenemos motor de todos modos
      setProcessing(false);
      // Retornamos falso por mancos
      return false;
    }
  }

  // Realizar el firmado criptográfico enviando los datos al Backend
  // FUNCION: executeSignature
  // Manda todo al servidor para que él sude la gota gorda y nos devuelva el pdf tatuado
  async function executeSignature() {
    // Si no hay PDF no hacemos nada
    if (!pdfFile) return;

    // Si no está validado el certificado, intentamos validarlo ahora
    // Si el usuario se pasó de listo y quiso firmar sin probar contraseña lo forzamos a probar
    if (!isValidCert) {
      // Mandamos a llamar la validación
      const valid = await loadAndValidateP12();
      // Si la validación revienta abortamos la misión
      if (!valid) return;
    }

    // Encendemos la rueda para calmar la ansiedad
    setProcessing(true);
    // Empezamos la magia
    try {
      // Creamos una caja de cartón gigante virtual
      const formData = new FormData();
      // Metemos primero nuestro PDF principal a la caja
      formData.append("pdf", {
        uri: pdfFile.uri,
        name: pdfFile.name || "document.pdf",
        type: "application/pdf",
      } as any);

      // Ahora metemos el mini archivito peligroso de la firma
      formData.append("p12", {
        uri: p12File!.uri,
        name: p12File!.name || "firma.p12",
        type: "application/x-pkcs12",
      } as any);

      // En el mismo paquete aventamos la contraseña las posiciones y la hoja que queremos
      formData.append("password", p12Password);
      formData.append("posX", posX.toString());
      formData.append("posY", posY.toString());
      formData.append("pageNumber", pageNumber.toString());

      // Checamos a dónde le vamos a mandar esta bomba
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.1.10:3000";

      // Hacemos el envío especial por correo express
      const response = await fetch(`${backendUrl}/api/sign`, {
        // En POST para que el servidor atrape todo
        method: "POST",
        // El cuerpo es nuestra caja gorda
        body: formData,
        // Y le decimos que esperamos que nos conteste con un PDF fresco
        headers: {
          "Accept": "application/pdf",
        },
      });

      // Si el servidor nos cachetea
      if (!response.ok) {
        // Revisamos la nota de enojo
        const errData = await response.json().catch(() => null);
        // Tiramos el error al suelo
        throw new Error(errData?.error || "Error en el servidor de firmas");
      }

      // Convertir la respuesta Blob del servidor a Base64 y guardarla
      // Recibimos un pedazo de información bruta que no sabemos bien qué es (Blob)
      const blob = await response.blob();
      // Sacamos una lupa para leerlo
      const reader = new FileReader();
      // Se lo ponemos en la cara a la lupa para que lo pase a texto DataUrl
      reader.readAsDataURL(blob);
      // Cuando termine de leer hacemos esto
      reader.onloadend = async () => {
        // Agarramos el chorizo de texto le cortamos el inicio feo y nos quedamos con el puro base64
        const base64data = reader.result?.toString().split(",")[1];
        // Si sí encontramos base64
        if (base64data) {
          // Tomamos el nombre original
          const originalName = pdfFile.name || "document.pdf";
          // Lo rasuramos
          const baseName = originalName.replace(/\.pdf$/i, "");
          // Usamos el nombre original añadiendo _firmado para el archivo final
          // Creamos su nueva identidad final
          const finalUri = documentDirectory + baseName + "_firmado.pdf";
          // Usamos expo para escribir todo ese base64 directo a un archivo físico
          await writeAsStringAsync(finalUri, base64data, { encoding: "base64" });
          // Guardamos dónde chingados lo guardamos
          setResultUri(finalUri);
          // Ponemos banderita de victoria
          setCompleted(true);
          // Apagamos rueda
          setProcessing(false);
        }
      };

      // Nos vamos felices
      return;
    // Si nos cayó un asteroide encima
    } catch (err: any) {
      // Mandamos alerta en rojo chillón
      showAlert("Error al firmar", err.message || "Ocurrió un error al estampar tu firma en el documento.", "error");
      // Matamos el proceso infinito
      setProcessing(false);
    }
  }

  // FUNCION: shareFile
  // Para regalar nuestro trabajo recién firmado
  async function shareFile() {
    // Si todo cuadra
    if (resultUri && (await Sharing.isAvailableAsync())) {
      // Aventamos la flecha a whatsapp u otra app
      await Sharing.shareAsync(resultUri);
    }
  }

  // Escupimos todas nuestras herramientas y variables a la pantalla
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

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas loadAndValidateP12? pasa que nadie comprobará si el archivo .p12 y la contraseña combinan antes de mandarlos al servidor, provocando que tu app intente procesar firmas inválidas a ciegas y truene
// para solucionarlo debes volver a implementar esta validación previa que frena procesos defectuosos antes de que toquen internet
// ¿qué pasa si eliminas la transformación de blob a base64 dentro de executeSignature? pasa que al recibir el archivo firmado del servidor tu app no entenderá cómo guardar el resultado físico arrojando un objeto corrupto sin extensión útil
// para solucionarlo deberás rehacer el lector FileReader y el writeAsStringAsync para escribir la cadena convertida
