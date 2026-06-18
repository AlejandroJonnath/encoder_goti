// SECCION DE IMPORTACIONES
// Importamos DocumentPicker para que el usuario pueda abrir sus archivos y elegir un PDF
import * as DocumentPicker from "expo-document-picker";
// Traemos documentDirectory y downloadAsync para poder descargar el PDF ya comprimido y guardarlo en el celular
import { documentDirectory, downloadAsync } from "expo-file-system/legacy";
// Importamos Sharing para poder enviarle el PDF a alguien por WhatsApp o guardarlo en Drive
import * as Sharing from "expo-sharing";
// Importamos useState de React para guardar datos que cambian y refrescan la pantalla
import { useState } from "react";
// Traemos nuestro gancho de alertas personalizadas para mostrar avisos de error o éxito
import { useCustomAlert } from "@/shared/context/AlertContext";

// SECCION PRINCIPAL DEL HOOK
// FUNCION: usePdfCompression
// Exportamos nuestro gancho personalizado que contiene todo el cerebro de la pantalla de compresión
export function usePdfCompression() {
  // Sacamos la herramienta showAlert de nuestro contexto para poder invocarla después
  const { showAlert } = useCustomAlert();
  // Estado para guardar el archivo que el usuario seleccionó de su galería de documentos
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(
    null,
  );
  // Estado para saber si estamos subiendo o descargando el archivo y así poner la ruedita a girar
  const [processing, setProcessing] = useState(false);
  // Estado para saber si ya terminamos todo el proceso con éxito y mostrar el botón de compartir
  const [completed, setCompleted] = useState(false);
  // Estado para guardar la ruta local de dónde quedó el archivo ya descargado en el teléfono
  const [resultUri, setResultUri] = useState<string | null>(null);

  // FUNCION: pickDocument
  // Esta función es la que abre la cajita nativa del celular para elegir un documento
  async function pickDocument() {
    // Usamos try por si el usuario cancela de golpe o algo falla en el sistema de archivos
    try {
      // Llamamos a la herramienta de Expo diciéndole que solo queremos ver archivos de tipo PDF y que los copie a la memoria caché temporal
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      // Si el usuario no canceló la selección y de verdad eligió algo
      if (!result.canceled) {
        // Guardamos el archivo seleccionado en nuestra variable de estado
        setFile(result);
        // Reiniciamos el estado de completado por si era un intento anterior
        setCompleted(false);
        // Borramos el resultado anterior para no confundir archivos
        setResultUri(null);
      }
    // Si algo raro pasa atrapamos el error
    } catch (err) {
      // Mostramos una alerta roja avisando que no se pudo abrir el selector
      showAlert("Error", "No se pudo seleccionar el archivo", "error");
    }
  }

  // FUNCION: processCompress
  // Esta función toma el PDF y lo manda a nuestro servidor en la nube para que le reduzca el tamaño
  async function processCompress() {
    // Si no hay archivo o el usuario canceló ni nos molestamos en arrancar
    if (!file || file.canceled) return;
    // Prendemos la bandera de procesamiento para que aparezca la ruedita de carga
    setProcessing(true);
    // Empezamos la zona de riesgo con try
    try {
      // Sacamos el primer archivo de los que eligió el usuario
      const asset = file.assets[0];
      // Creamos un paquete de formulario como los de las páginas web antiguas
      const formData = new FormData();
      // Le metemos el PDF al paquete pasándole su dirección real, nombre y tipo
      formData.append("pdf", {
        uri: asset.uri,
        name: asset.name,
        type: "application/pdf"
      } as any);

      // Revisamos a qué dirección de internet vamos a mandar esto o usamos el localhost de emergencia
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";
      // Lanzamos la petición POST a nuestra ruta de compresión con el paquete incluido
      const response = await fetch(`${backendUrl}/api/pdf/compress`, {
        method: "POST",
        body: formData,
      });

      // Si el servidor nos mandó a volar con un error 500 o 400
      if (!response.ok) {
        // Intentamos leer el JSON del error o armamos uno vacío si falla
        const errData = await response.json().catch(() => ({}));
        // Hacemos explotar el código lanzando el error para que caiga en el catch
        throw new Error(errData.error || "Error en el servidor al comprimir el PDF");
      }

      // Si todo fue bien leemos la respuesta del servidor en formato JSON
      const data = await response.json();
      
      // Si por alguna razón el servidor se hizo el loco y no nos mandó el link del archivo final
      if (!data.url) {
        // Lanzamos error quejándonos
        throw new Error("No se recibió la URL del archivo comprimido");
      }

      // Descargamos el archivo desde la URL generada por nuestro backend
      // Conservamos el nombre original del archivo asegurándonos de que termine en punto pdf
      const originalName = asset.name.endsWith(".pdf") ? asset.name : asset.name + ".pdf";
      // Forzamos HTTPS en el lado del cliente por si el backend se confunde con los proxies y envía HTTP inseguro
      const secureUrl = data.url.replace(/^http:\/\/(?!localhost|192\.168)/i, 'https://');
      // Llamamos a downloadAsync pasándole la URL segura y diciéndole dónde guardarlo en nuestro teléfono
      const downloadRes = await downloadAsync(
        secureUrl,
        documentDirectory + originalName,
      );

      // Guardamos la ruta final donde quedó el archivo pequeñito
      setResultUri(downloadRes.uri);
      // Festejamos cambiando el estado a completado
      setCompleted(true);
    // Atrapamos las bombas
    } catch (error: any) {
      // Mandamos la alerta roja mostrando qué carambas falló en todo el proceso
      showAlert(
        "Error al Comprimir",
        error.message || "Ocurrió un error inesperado",
        "error"
      );
    // Y siempre apagamos la ruedita de carga pase lo que pase
    } finally {
      setProcessing(false);
    }
  }

  // FUNCION: shareFile
  // Esta función abre la ventanita típica del celular que te pregunta a qué aplicación le quieres mandar el archivo
  async function shareFile() {
    // Si tenemos el archivo descargado y el celular nos permite usar el menú de compartir
    if (resultUri && (await Sharing.isAvailableAsync())) {
      // Lanzamos la acción de compartir pasándole la ruta final de nuestro archivo
      await Sharing.shareAsync(resultUri);
    }
  }

  // Bloque de retorno
  // Empaquetamos y devolvemos todos los estados y funciones para que la pantalla visual los use
  return {
    file,
    processing,
    completed,
    resultUri,
    pickDocument,
    processCompress,
    shareFile,
    setFile,
  };
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la función processCompress? pasa que el usuario podrá elegir su PDF infinitas veces pero el botón de comprimir nunca hará nada y se quedarán atorados sin poder reducir el peso de su documento
// para solucionarlo debes volver a programar todo el bloque del fetch con formData hacia el servidor
// ¿qué pasa si borras la llamada a downloadAsync dentro del processCompress? pasa que el servidor sí comprimirá el archivo y cobrará procesamiento pero el celular jamás guardará el resultado haciendo que la app se trabe a medias
// para solucionarlo regresa la función downloadAsync para llevar la url a la carpeta documentDirectory
