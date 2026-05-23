import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { downloadAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { UploadCloud, CheckCircle, Download, FileType, RefreshCw } from 'lucide-react-native';
import { uploadFileToPdfco } from '../../../lib/pdfco';
// Some environments may not export convertPdfTo as a named export; fall back to require to avoid TS/compile error
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { convertPdfTo } = require('../../../lib/pdfco');

// Sección: Pantalla de Conversión Dinámica de PDF
// (Actúa como un controlador único para manejar transformaciones desde y hacia PDF dependiendo del parámetro de ruta que recibe)

// (Mapeo constante que define colores y nombres amigables según el tipo de conversión solicitada en la URL)
const TYPE_MAP: Record<string, { label: string, color: string }> = {
  // (Conversión a documento de Word)
  'to-word': { label: 'PDF a Word', color: '#2B579A' },
  // (Conversión a hoja de cálculo de Excel)
  'to-excel': { label: 'PDF a Excel', color: '#217346' },
  // (Conversión a imagen JPG)
  'to-jpg': { label: 'PDF a JPG', color: '#E53935' },
  // (Conversión a imagen PNG)
  'to-png': { label: 'PDF a PNG', color: '#8E24AA' },
  // (Conversión desde Word hacia PDF)
  'word-to-pdf': { label: 'Word a PDF', color: '#2B579A' },
  // (Conversión desde imagen hacia PDF)
  'img-to-pdf': { label: 'Imagen a PDF', color: '#E53935' },
};

// Función ConvertScreen: Pantalla dinámica que muta según la herramienta
// (Lee el parámetro de ruta adapta sus colores textos y peticiones a la API según lo que el usuario quiere convertir)
export default function ConvertScreen() {
  // (Extrae el parámetro dinámico type de la URL o ruta de expo-router)
  const { type } = useLocalSearchParams<{ type: string }>();
  // (Obtiene la configuración específica para ese tipo de la constante superior o pone valores por defecto si no existe)
  const config = TYPE_MAP[type || 'to-word'] || { label: 'Convertir', color: '#555' };
  
  // (Estado que almacena el archivo seleccionado por el usuario para su conversión)
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  // (Estado que indica si la aplicación está ocupada subiendo y procesando con la API)
  const [processing, setProcessing] = useState(false);
  // (Estado que marca si el archivo fue convertido con éxito)
  const [completed, setCompleted] = useState(false);
  // (Estado que guarda la ruta donde se descargó el nuevo archivo convertido)
  const [resultUri, setResultUri] = useState<string | null>(null);

  // Función pickDocument: Abre el selector de archivos nativo adaptado al modo
  // (Configura el filtro del selector dependiendo si se necesita un PDF imágenes o archivos de Word)
  async function pickDocument() {
    // (Manejo de errores para la interfaz nativa)
    try {
      // (Variable para guardar el tipo MIME que se va a permitir seleccionar)
      let docType = 'application/pdf';
      
      // (Si la conversión es de Word a PDF cambia el filtro a extensiones de Word)
      if (type === 'word-to-pdf') {
        docType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      // (Si la conversión es de imagen a PDF cambia el filtro a todos los formatos de imagen)
      } else if (type === 'img-to-pdf') {
        docType = 'image/*';
      }

      // (Abre la interfaz del selector aplicando el filtro decidido)
      const result = await DocumentPicker.getDocumentAsync({
        type: docType,
        // (Guarda copias en caché para que las subidas posteriores no fallen)
        copyToCacheDirectory: true,
      });

      // (Si el usuario escoge un archivo y no cancela lo guarda en el estado)
      if (!result.canceled) {
        setFile(result.assets[0]);
        // (Reinicia los estados en caso de que ya se hubiera convertido algo antes)
        setCompleted(false);
        setResultUri(null);
      }
    // (Captura problemas en la ejecución del selector)
    } catch (err) {
      // (Alerta que la selección de archivo falló)
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  }

  // Función processConversion: Manda el archivo a PDF.co y descarga el resultado
  // (Este es el motor de esta pantalla que sube el archivo pide a la API la transformación adecuada y descarga lo que devuelve)
  async function processConversion() {
    // (Se asegura de que exista un archivo seleccionado antes de intentar subir algo vacío)
    if (!file) return;
    
    // (Bloquea la UI mostrando el indicador de carga)
    setProcessing(true);
    // (Comienza el proceso envolviéndolo en un try catch para errores de red)
    try {
      // 1. Subir a PDF.co
      // (Manda el archivo físico a la nube y espera que devuelva una URL temporal)
      const uploadedUrl = await uploadFileToPdfco(file.uri, file.name);
      
      // 2. Determinar destino y perfil según el tipo
      // (Variables que le dirán a la API qué queremos hacer con ese archivo subido)
      let destinationType = 'doc';
      let targetName = 'converted.doc';
      
      // (Lógica condicional que mapea nuestra ruta con el endpoint real de la API)
      if (type === 'to-excel') {
        destinationType = 'xls';
        targetName = 'converted.xls';
      } else if (type === 'to-jpg') {
        destinationType = 'jpg';
        targetName = 'converted.jpg';
      } else if (type === 'to-png') {
        destinationType = 'png';
        targetName = 'converted.png';
      } else if (type === 'word-to-pdf' || type === 'img-to-pdf') {
        destinationType = 'pdf';
        targetName = 'converted.pdf';
      }

      // 3. Llamar al endpoint de conversión
      // (Manda la url temporal y el tipo de destino a la API y espera la url del resultado)
      const convertedUrl = await convertPdfTo(uploadedUrl, destinationType);

      // 4. Descargar el resultado
      // (Baja el archivo ya transformado desde el servidor a la carpeta local de la app)
      const downloadRes = await downloadAsync(
        convertedUrl,
        // (Crea un nombre único en el sistema de archivos)
        documentDirectory + 'converted_' + Date.now() + '_' + targetName
      );

      // (Guarda la ruta interna del dispositivo en el estado)
      setResultUri(downloadRes.uri);
      // (Cambia el flujo visual a la pantalla de éxito)
      setCompleted(true);
    // (Captura fallos de red cuotas excedidas o archivos corruptos)
    } catch (error: any) {
      // (Muestra una alerta con el mensaje crudo del error)
      Alert.alert('Error en Conversión', error.message || 'Ocurrió un error');
    // (Sección obligatoria de salida)
    } finally {
      // (Apaga el cargando de la UI)
      setProcessing(false);
    }
  }

  // Función shareFile: Activa el modal nativo para enviar o guardar archivos
  // (Permite llevar el archivo generado a otras aplicaciones como WhatsApp o Guardar en Archivos)
  async function shareFile() {
    // (Si hay una ruta lista y el SO lo permite)
    if (resultUri && await Sharing.isAvailableAsync()) {
      // (Ejecuta la acción nativa de compartir usando la ruta local)
      await Sharing.shareAsync(resultUri);
    }
  }

  return (
    <View style={styles.container}>
      {/* (Título y color de navegación que cambian dinámicamente según la conversión) */}
      <Stack.Screen options={{ headerTitle: config.label, headerTintColor: config.color }} />

      {/* (Caja de centrado general) */}
      <View style={styles.content}>
        {/* (Si no se ha seleccionado nada aún muestra el cuadrado de subida principal) */}
        {!file ? (
          <TouchableOpacity style={[styles.uploadBox, { borderColor: config.color }]} onPress={pickDocument}>
            {/* (Icono de subida con color dinámico) */}
            <UploadCloud size={64} color={config.color} />
            {/* (Texto incitando a la selección dinámica) */}
            <Text style={[styles.uploadText, { color: config.color }]}>Seleccionar Archivo</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileContainer}>
            {/* (Tarjeta blanca flotante con la info del archivo) */}
            <View style={styles.fileInfoBox}>
              {/* (Icono de archivo genérico que usa el color de la herramienta actual) */}
              <FileType size={48} color={config.color} style={{ marginBottom: 12 }} />
              {/* (Nombre del archivo acortado a una línea) */}
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
            </View>

            {/* (Si el flujo se completó y tenemos resultado) */}
            {completed ? (
              <View style={styles.completedBox}>
                {/* (Paloma verde de ok) */}
                <CheckCircle size={48} color="#34A853" />
                {/* (Texto dinámico que menciona hacia qué se convirtió) */}
                <Text style={styles.completedText}>¡Convertido con Éxito!</Text>
                {/* (Botón que usa el color dinámico para activar el compartir) */}
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: config.color }]} onPress={shareFile}>
                  {/* (Iconito de descarga) */}
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  {/* (Texto blanco) */}
                  <Text style={styles.actionButtonText}>Compartir / Guardar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: config.color }]}
                onPress={processConversion}
                disabled={processing}
              >
                {/* (Muestra una rueda giratoria nativa si procesa o un icono dinámico con texto si no) */}
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* (Iconito de actualización rotar) */}
                    <RefreshCw color="#fff" size={20} style={{ marginRight: 8 }} />
                    {/* (Texto estático Convertir Archivo) */}
                    <Text style={styles.actionButtonText}>Convertir Archivo</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* (Si la app no está ocupada ofrece forma de cancelar todo) */}
            {!processing && (
              <TouchableOpacity onPress={() => { setFile(null); setCompleted(false); }} style={styles.cancelButton}>
                {/* (Texto grisáceo) */}
                <Text style={styles.cancelText}>Cancelar y elegir otro</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// (Definición de estilos en objetos fijos)
const styles = StyleSheet.create({
  // (Configuración base ocupa todo y color suave)
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  // (Aplica relleno interno y centra todo)
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  // (Recuadro inicial vacío con borde a rayas que le da un aspecto de soltar archivo)
  uploadBox: { width: '100%', height: 300, borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  // (Texto del recuadro con buena legibilidad)
  uploadText: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  // (Expansión lateral para la caja de resultados)
  fileContainer: { width: '100%', alignItems: 'center' },
  // (Carta que agrupa la info del archivo seleccionado y le da relieve)
  fileInfoBox: { width: '100%', backgroundColor: '#fff', padding: 32, borderRadius: 16, alignItems: 'center', marginBottom: 24, elevation: 2 },
  // (Control de la fuente del archivo para que no rompa la pantalla)
  fileName: { fontSize: 16, color: '#333', textAlign: 'center' },
  // (Botón estandarizado de la app con gran área de toque)
  actionButton: { width: '100%', padding: 18, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  // (Letras fuertes sobre el botón colorido)
  actionButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // (Ligero margen para separar el cancelar del botón principal)
  cancelButton: { marginTop: 16, padding: 8 },
  // (Aspecto apagado para no distraer)
  cancelText: { color: '#888', fontSize: 14 },
  // (Envoltorio para cuando se logra convertir)
  completedBox: { alignItems: 'center', width: '100%' },
  // (Mensaje gigante y verde de éxito)
  completedText: { fontSize: 18, fontWeight: 'bold', color: '#34A853', marginVertical: 16 },
});

// si quitas la función ConvertScreen se rompen 6 herramientas completas a la vez (word a pdf, pdf a excel, pdf a imagen, etc)
// si quitas la constante TYPE_MAP la pantalla no sabrá cómo colorearse o qué título poner perdiendo toda adaptación visual
// si quitas la función pickDocument no se podrán elegir archivos limitados a los que tengan la extensión que permite cada conversión
// si quitas la función processConversion no se conectará con la API y el archivo solo quedará ahí elegido sin hacer nada
// si quitas la función shareFile el archivo nuevo en excel o jpg quedará escondido en el almacenamiento temporal de la app sin que el usuario lo vea
