import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { downloadAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { UploadCloud, File, CheckCircle, Download, Minimize } from 'lucide-react-native';
import { uploadFileToPdfco, compressPdf } from '../../lib/pdfco';

// Sección: Pantalla para Comprimir Documentos PDF
// (Proporciona la interfaz para seleccionar un PDF enviarlo a PDF.co para optimizar su tamaño y descargarlo/compartirlo al finalizar)

// Función CompressScreen: Controla la herramienta de compresión de PDF
// (Gestiona los estados de selección subida compresión descarga y compartición del archivo)
export default function CompressScreen() {
  // (Guarda el resultado de la selección del archivo original)
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  // (Indica si la aplicación está ocupada subiendo o procesando el archivo)
  const [processing, setProcessing] = useState(false);
  // (Indica si el proceso de compresión y descarga ya terminó exitosamente)
  const [completed, setCompleted] = useState(false);
  // (Almacena la ruta local URI del archivo ya comprimido para poder compartirlo luego)
  const [resultUri, setResultUri] = useState<string | null>(null);

  // Función pickDocument: Permite al usuario buscar un archivo PDF local
  // (Abre la interfaz nativa del dispositivo para seleccionar únicamente archivos PDF)
  async function pickDocument() {
    // (Maneja los posibles errores al abrir el selector de archivos)
    try {
      // (Inicia el selector filtrando por el tipo MIME de PDF)
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        // (Guarda una copia en caché para asegurar el acceso al archivo por la app)
        copyToCacheDirectory: true,
      });

      // (Si el usuario escoge un archivo y no cancela)
      if (!result.canceled) {
        // (Almacena el documento en el estado file)
        setFile(result);
        // (Resetea los estados de finalización por si se repite el proceso)
        setCompleted(false);
        setResultUri(null);
      }
    // (Atrapa problemas de la librería del selector)
    } catch (err) {
      // (Notifica al usuario sobre el fallo en la selección)
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  }

  // Función processCompress: Ejecuta la lógica de compresión en la nube
  // (Sube el documento manda a reducir su tamaño y descarga el resultado a la memoria local)
  async function processCompress() {
    // (Si no hay archivo seleccionado cancela la función tempranamente)
    if (!file || file.canceled) return;
    
    // (Muestra el indicador visual de que el sistema está trabajando)
    setProcessing(true);
    // (Maneja el flujo asíncrono y atrapa errores)
    try {
      // (Obtiene las propiedades del primer archivo seleccionado)
      const asset = file.assets[0];
      // 1. Subir a PDF.co
      // (Llama a la API para alojar el archivo de forma segura y temporal)
      const uploadedUrl = await uploadFileToPdfco(asset.uri, asset.name);
      
      // 2. Comprimir
      // (Llama a la API de optimización pasándole la URL del archivo subido)
      const compressedUrl = await compressPdf(uploadedUrl);

      // 3. Descargar el resultado al dispositivo
      // (Descarga el archivo desde la URL generada por PDF.co hacia el almacenamiento del teléfono)
      const downloadRes = await downloadAsync(
        // (URL de descarga devuelta por la API)
        compressedUrl,
        // (Ruta local en el dispositivo usando la carpeta de documentos y un timestamp para nombre único)
        documentDirectory + 'compressed_' + Date.now() + '.pdf'
      );

      // (Guarda la ruta local del archivo comprimido)
      setResultUri(downloadRes.uri);
      // (Activa el estado de completado para mostrar opciones de compartir)
      setCompleted(true);
    // (Atrapa cualquier error en las etapas de subida compresión o descarga)
    } catch (error: any) {
      // (Alerta al usuario sobre el fallo específico)
      Alert.alert('Error al Comprimir', error.message || 'Ocurrió un error inesperado');
    // (Se ejecuta incondicionalmente al final)
    } finally {
      // (Oculta el indicador de carga)
      setProcessing(false);
    }
  }

  // Función shareFile: Abre el menú nativo para compartir
  // (Permite enviar el PDF comprimido por WhatsApp correo o guardarlo localmente)
  async function shareFile() {
    // (Verifica que tengamos el archivo descargado y que compartir esté disponible en el dispositivo)
    if (resultUri && await Sharing.isAvailableAsync()) {
      // (Abre la hoja de compartir de iOS/Android con el archivo correspondiente)
      await Sharing.shareAsync(resultUri);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: 'Comprimir PDF', headerTintColor: '#34A853' }} />

      <View style={styles.content}>
        {!file || file.canceled ? (
          <TouchableOpacity style={[styles.uploadBox, { borderColor: '#34A853' }]} onPress={pickDocument}>
            <Minimize size={64} color="#34A853" style={{ marginBottom: 16 }} />
            <Text style={[styles.uploadText, { color: '#34A853' }]}>Selecciona el PDF a comprimir</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileContainer}>
            <View style={styles.fileInfoBox}>
              <File size={48} color="#34A853" />
              <Text style={styles.fileName}>{file.assets[0].name}</Text>
              <Text style={styles.fileSize}>{(file.assets[0].size! / 1024 / 1024).toFixed(2)} MB</Text>
            </View>

            {completed ? (
              <View style={styles.completedBox}>
                <CheckCircle size={48} color="#34A853" />
                <Text style={styles.completedText}>¡Compresión Exitosa!</Text>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#34A853' }]} onPress={shareFile}>
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>Compartir / Guardar PDF</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#34A853' }]}
                onPress={processCompress}
                disabled={processing}
              >
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Comprimir PDF</Text>}
              </TouchableOpacity>
            )}

            {!processing && (
              <TouchableOpacity onPress={() => {setFile(null); setCompleted(false);}} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Elegir otro archivo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// (Estilos para la vista de comprimir)
const styles = StyleSheet.create({
  // (Fondo gris general para la pantalla)
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  // (Ubicación central para todos los elementos)
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  // (Caja punteada que funciona como botón gigante de subida)
  uploadBox: { width: '100%', height: 300, borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  // (Texto dentro de la caja punteada)
  uploadText: { fontSize: 20, fontWeight: 'bold' },
  // (Contenedor que ocupa el ancho y centra su contenido)
  fileContainer: { width: '100%', alignItems: 'center' },
  // (Caja blanca que muestra la información del archivo elegido)
  fileInfoBox: { width: '100%', backgroundColor: '#fff', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 24, elevation: 2 },
  // (Estilo del texto del nombre de archivo)
  fileName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 12, textAlign: 'center' },
  // (Estilo del texto del tamaño de archivo)
  fileSize: { fontSize: 14, color: '#888', marginTop: 4 },
  // (Botones rectangulares grandes para acciones principales)
  actionButton: { width: '100%', padding: 18, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  // (Texto de los botones de acción)
  actionButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // (Botón secundario para cancelar o retroceder)
  cancelButton: { marginTop: 16, padding: 8 },
  // (Texto gris del botón secundario)
  cancelText: { color: '#888', fontSize: 14 },
  // (Contenedor de elementos al finalizar un trabajo con éxito)
  completedBox: { alignItems: 'center', width: '100%' },
  // (Texto de éxito)
  completedText: { fontSize: 18, fontWeight: 'bold', color: '#34A853', marginVertical: 16 },
});

// si quitas la función CompressScreen el usuario no podrá acceder a la función de reducir tamaño de PDF
// si quitas la función pickDocument el usuario no podrá subir el archivo que quiere comprimir
// si quitas la función processCompress el documento seleccionado nunca será procesado ni reducido de tamaño
// si quitas la función shareFile el usuario no podrá extraer de la app el documento ya comprimido para enviarlo o guardarlo
