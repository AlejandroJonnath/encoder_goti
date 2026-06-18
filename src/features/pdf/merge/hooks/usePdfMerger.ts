// SECCION DE IMPORTACIONES
// Importamos la herramienta para que el usuario pueda abrir su galería de archivos
import * as DocumentPicker from "expo-document-picker";
// Importamos utilidades para guardar los archivos descargados en el teléfono
import { documentDirectory, downloadAsync } from "expo-file-system/legacy";
// Traemos la función de compartir para poder mandar el archivo por chat
import * as Sharing from "expo-sharing";
// Importamos el gancho de React para manejar los estados dinámicos
import { useState } from "react";
// Traemos el contexto de alertas personalizadas para mostrar mensajitos flotantes
import { useCustomAlert } from "@/shared/context/AlertContext";

// SECCION PRINCIPAL DEL HOOK
// FUNCION: usePdfMerger
// Exportamos nuestra función cerebro que se encarga de pegar los PDFs
export function usePdfMerger() {
  // Sacamos la alerta del contexto para poder avisar cosas al usuario
  const { showAlert } = useCustomAlert();
  // Estado que guarda no uno sino una lista entera de archivos seleccionados
  const [files, setFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  // Estado para la ruedita de carga mientras todo se sube y descarga
  const [processing, setProcessing] = useState(false);
  // Estado de éxito para cambiar la pantalla a modo fiesta
  const [completed, setCompleted] = useState(false);
  // Estado para guardar en dónde demonios guardó el celular nuestro PDF final
  const [resultUri, setResultUri] = useState<string | null>(null);

  // FUNCION: pickDocument
  // Abre el menú del celular y te deja seleccionar todos los PDFs que quieras
  async function pickDocument() {
    // Ponemos el try para que si el usuario se asusta y cancela no explote todo
    try {
      // Disparamos el selector
      const result = await DocumentPicker.getDocumentAsync({
        // Forzamos a que solo puedan elegir archivos pdf
        type: "application/pdf",
        // Hacemos que copie los archivos a cache para no perderlos
        copyToCacheDirectory: true,
        // Y muy importante le decimos que sí puede seleccionar un montón a la vez
        multiple: true,
      });

      // Si no canceló la operación
      if (!result.canceled) {
        // Agarramos los archivos que ya teníamos en la lista y le pegamos los nuevitos que acaba de escoger
        setFiles((prev) => [...prev, ...result.assets]);
        // Apagamos la pantalla de completado por si estaba intentando otra vez
        setCompleted(false);
        // Limpiamos la uri anterior
        setResultUri(null);
      }
    // Si da algún error rarísimo el teléfono lo atrapamos acá
    } catch (err) {
      // Lanzamos la alerta roja indicando que fracasó la selección
      showAlert("Error", "No se pudieron seleccionar los archivos", "error");
    }
  }

  // FUNCION: removeFile
  // Es la escoba que usamos para quitar un archivo de la lista si el usuario se equivocó
  function removeFile(index: number) {
    // Usamos filter para dejar pasar todos los archivos menos el que coincide con la posición que le pasamos
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // FUNCION: processMerge
  // Agarra toda la lista de PDFs la manda al servidor y nos devuelve el Frankenstein unido
  async function processMerge() {
    // Si el usuario es listillo e intenta unir menos de 2 archivos no lo dejamos
    if (files.length < 2) {
      // Le mandamos una alerta amarilla regañándolo
      showAlert("Aviso", "Necesitas al menos 2 PDFs para unirlos.", "warning");
      return;
    }

    // Encendemos la ruedita de carga
    setProcessing(true);
    // Empezamos la zona de riesgo con la conexión a internet
    try {
      // Armamos un paquete grande como un sobre de manila virtual
      const formData = new FormData();
      // Empezamos a revisar cada archivo en nuestra lista uno por uno
      files.forEach((file) => {
        // Y los vamos metiendo al paquete asegurándonos de que todos se llamen pdfs para que el backend los reciba como un arreglo
        formData.append("pdfs", {
          uri: file.uri,
          name: file.name,
          type: "application/pdf"
        } as any);
      });

      // Verificamos si estamos conectados a la nube o si estamos jugando en el localhost de nuestro cuarto
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";
      // Lanzamos el paquete hacia la ruta correcta usando POST
      const response = await fetch(`${backendUrl}/api/pdf/merge`, {
        method: "POST",
        body: formData,
      });

      // Si el servidor nos hace el feo y manda error
      if (!response.ok) {
        // Intentamos leer su queja o mandamos un objeto vacío
        const errData = await response.json().catch(() => ({}));
        // Aventamos el error para que caiga directo en el bloque catch de abajo
        throw new Error(errData.error || "Error en el servidor al unir los PDFs");
      }

      // Si el servidor hizo su magia leemos lo que nos contestó
      const data = await response.json();

      // Revisamos si olvidó pasarnos la ruta del archivo pegado
      if (!data.url) {
        // Lanzamos un error por incompetencia del servidor
        throw new Error("No se recibió la URL del archivo unido");
      }

      // Para nombrar al Frankenstein agarramos el nombre del primer archivo y le cortamos la extensión pdf
      const baseName = files[0].name.replace(/\.pdf$/i, "");
      // Y le pegamos la palabra unido y el punto pdf al final para que se vea bonito
      const mergedName = `${baseName}_unido.pdf`;
      // Forzamos al enlace a usar https para que no nos bloqueen por inseguros
      const secureUrl = data.url.replace(/^http:\/\/(?!localhost|192\.168)/i, 'https://');
      // Ponemos a descargar nuestro premio
      const downloadRes = await downloadAsync(
        secureUrl,
        documentDirectory + mergedName,
      );

      // Guardamos en memoria dónde quedó el archivo dentro de nuestro celular
      setResultUri(downloadRes.uri);
      // Festejamos que todo salió perfecto
      setCompleted(true);
    // Atrapamos las papas calientes
    } catch (error: any) {
      // Tiramos la alerta roja contándole al usuario qué fue lo que tronó
      showAlert("Error al Unir", error.message || "Ocurrió un error", "error");
    // Al salir pase lo que pase apagamos la ruedita de carga
    } finally {
      setProcessing(false);
    }
  }

  // FUNCION: shareFile
  // Para presumirle a tus compas el archivo unido
  async function shareFile() {
    // Si tenemos la ruta local lista y el celular no tiene bloqueada la opción de compartir
    if (resultUri && (await Sharing.isAvailableAsync())) {
      // Levantamos la hojita de abajo para que lo mande a whatsapp o donde sea
      await Sharing.shareAsync(resultUri);
    }
  }

  // Bloque de salida
  // Aventamos todos nuestros juguetes y controles para que la pantalla los utilice
  return {
    files,
    processing,
    completed,
    resultUri,
    pickDocument,
    removeFile,
    processMerge,
    shareFile,
    setFiles,
    setCompleted,
  };
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la función removeFile? pasa que el usuario seleccionará archivos a lo tonto y si elige uno que no era jamás podrá borrarlo viéndose forzado a salirse de la app o apretar el botón de vaciar todo
// para solucionarlo debes volver a implementar la función que filtra el arreglo de archivos ignorando el índice seleccionado
// ¿qué pasa si borras la validación de files.length < 2 dentro de processMerge? pasa que el usuario podrá enviar un solo archivo a unir haciendo que la app haga trabajo inútil consumiendo megas de internet y el servidor te regañará botándote un error feo
// para solucionarlo vuelve a colocar ese pequeño chequeo que previene enviar la petición si no hay al menos dos piezas que unir
