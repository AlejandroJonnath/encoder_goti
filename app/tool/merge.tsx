import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { downloadAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { UploadCloud, FileText, CheckCircle, Download, Plus, Trash2 } from 'lucide-react-native';
import { uploadFileToPdfco, mergePdfs } from '../../lib/pdfco';

// Sección: Pantalla para Unir Múltiples PDFs
// (Maneja la selección de múltiples archivos PDF los sube en paralelo y los combina en un único archivo utilizando la API)

// Función MergeScreen: Pantalla interactiva para la herramienta de unir PDF
// (Gestiona la lista de archivos seleccionados el procesamiento la descarga y el reinicio de la herramienta)
export default function MergeScreen() {
  // (Estado que almacena un arreglo con todos los archivos PDF seleccionados inicialmente vacío)
  const [files, setFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  // (Estado booleano que indica si se están procesando o subiendo los archivos)
  const [processing, setProcessing] = useState(false);
  // (Estado booleano que indica si la unión de los PDFs fue exitosa)
  const [completed, setCompleted] = useState(false);
  // (Estado que guarda la ruta local del archivo unido para poder descargarlo o compartirlo)
  const [resultUri, setResultUri] = useState<string | null>(null);

  // Función pickDocument: Abre el selector para añadir PDFs a la lista
  // (Permite selección múltiple de documentos PDF y los agrega al estado actual sin borrar los anteriores)
  async function pickDocument() {
    // (Manejo de errores para la apertura del selector)
    try {
      // (Abre la interfaz nativa filtrando por PDF y habilitando selección múltiple)
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        // (Guarda copias en caché para lectura rápida posterior)
        copyToCacheDirectory: true,
        // (Atributo que habilita escoger más de un archivo a la vez)
        multiple: true,
      });

      // (Si el usuario seleccionó archivos y no cerró el modal)
      if (!result.canceled) {
        // (Actualiza el estado concatenando los nuevos archivos a los que ya estaban seleccionados)
        setFiles(prev => [...prev, ...result.assets]);
        // (Reinicia el estado de completado por si se agregan archivos después de haber unido otros)
        setCompleted(false);
        // (Borra el resultado anterior porque la lista de archivos cambió)
        setResultUri(null);
      }
    // (Atrapa cualquier error generado por la librería del selector)
    } catch (err) {
      // (Muestra una alerta en caso de fallar la selección)
      Alert.alert('Error', 'No se pudieron seleccionar los archivos');
    }
  }

  // Función removeFile: Elimina un archivo específico de la lista
  // (Toma el índice del archivo en la lista y lo filtra para quitarlo del estado)
  function removeFile(index: number) {
    // (Filtra el arreglo de archivos conservando todos excepto el que coincide con el índice dado)
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  // Función processMerge: Sube los archivos los une y descarga el resultado
  // (Orquesta todo el flujo de trabajo con la API de PDF.co para fusionar los documentos)
  async function processMerge() {
    // (Verifica que haya al menos dos archivos seleccionados ya que no se puede unir un solo archivo)
    if (files.length < 2) {
      // (Alerta al usuario si no cumple el mínimo de archivos)
      Alert.alert('Aviso', 'Necesitas al menos 2 PDFs para unirlos.');
      return;
    }
    
    // (Activa el indicador de carga visual)
    setProcessing(true);
    // (Inicia el bloque de manejo de operaciones asíncronas)
    try {
      // Subir todos los archivos a PDF.co en paralelo
      // (Crea un arreglo de promesas donde cada promesa sube un archivo individual)
      const uploadPromises = files.map(file => uploadFileToPdfco(file.uri, file.name));
      // (Espera a que todas las subidas terminen simultáneamente para optimizar el tiempo)
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Llamar al endpoint de Merge
      // (Envía el arreglo de URLs generadas a la API de PDF.co para unirlos en el orden dado)
      const mergedUrl = await mergePdfs(uploadedUrls, 'merged_document.pdf');

      // Descargar el resultado
      // (Descarga el archivo fusionado desde la URL devuelta por la API al dispositivo)
      const downloadRes = await downloadAsync(
        mergedUrl,
        // (Genera un nombre único usando la fecha actual y lo guarda en la carpeta de documentos local)
        documentDirectory + 'merged_' + Date.now() + '.pdf'
      );

      // (Guarda la ruta del archivo final descargado)
      setResultUri(downloadRes.uri);
      // (Cambia el estado a completado para mostrar la pantalla de éxito)
      setCompleted(true);
    // (Atrapa errores si falla la subida la unión o la descarga)
    } catch (error: any) {
      // (Muestra una alerta con el mensaje del error capturado)
      Alert.alert('Error al Unir', error.message || 'Ocurrió un error');
    // (Se ejecuta incondicionalmente al final del try-catch)
    } finally {
      // (Apaga el indicador de carga visual)
      setProcessing(false);
    }
  }

  // Función shareFile: Invoca el menú nativo para compartir
  // (Permite al usuario sacar el archivo de la aplicación enviándolo por otras apps o guardándolo localmente)
  async function shareFile() {
    // (Asegura que el archivo final exista y que el sistema permita compartir archivos)
    if (resultUri && await Sharing.isAvailableAsync()) {
      // (Abre la interfaz de compartir del teléfono con el archivo unido)
      await Sharing.shareAsync(resultUri);
    }
  }

  // (Devuelve los componentes visuales de la interfaz)
  return (
    <View style={styles.container}>
      {/* (Configuración dinámica del encabezado con color azul específico para esta herramienta) */}
      <Stack.Screen options={{ headerTitle: 'Unir PDFs', headerTintColor: '#4285F4' }} />

      {/* (Contenedor que alinea el contenido centralmente) */}
      <View style={styles.content}>
        {/* (Si el arreglo de archivos está vacío se muestra el botón grande de selección inicial) */}
        {files.length === 0 ? (
          <TouchableOpacity style={[styles.uploadBox, { borderColor: '#4285F4' }]} onPress={pickDocument}>
            {/* (Icono de nube azul) */}
            <UploadCloud size={64} color="#4285F4" />
            {/* (Texto invitando a añadir al menos 2 PDFs) */}
            <Text style={[styles.uploadText, { color: '#4285F4' }]}>Selecciona 2 o más PDFs</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileContainer}>
            {/* (Caja blanca que envuelve la lista de archivos) */}
            <View style={styles.listContainer}>
              {/* (Componente FlatList que renderiza los archivos de forma eficiente) */}
              <FlatList
                data={files}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.fileRow}>
                    {/* (Icono de archivo pequeño al lado del nombre) */}
                    <FileText color="#4285F4" size={24} />
                    {/* (Nombre del archivo que se acorta si es muy largo) */}
                    <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                    {/* (Botón de la papelera para eliminar este elemento de la lista) */}
                    <TouchableOpacity onPress={() => removeFile(index)}>
                      {/* (Icono de papelera color rojo) */}
                      <Trash2 color="#E5322D" size={24} />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {/* (Si no se ha completado el proceso y no está cargando permite añadir más archivos) */}
              {!processing && !completed && (
                <TouchableOpacity style={styles.addMoreButton} onPress={pickDocument}>
                  {/* (Icono de sumar azul) */}
                  <Plus color="#4285F4" size={20} />
                  {/* (Texto para agregar más archivos) */}
                  <Text style={styles.addMoreText}>Añadir más archivos</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* (Si el proceso de unión finalizó con éxito) */}
            {completed ? (
              <View style={styles.completedBox}>
                {/* (Check verde de éxito) */}
                <CheckCircle size={48} color="#34A853" />
                {/* (Texto confirmando la unión) */}
                <Text style={styles.completedText}>¡PDFs Unidos!</Text>
                {/* (Botón azul para compartir el archivo resultante) */}
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4285F4' }]} onPress={shareFile}>
                  {/* (Icono de descargar) */}
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  {/* (Texto del botón compartir) */}
                  <Text style={styles.actionButtonText}>Compartir / Guardar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#4285F4' }]}
                onPress={processMerge}
                disabled={processing}
              >
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Unir Archivos</Text>}
              </TouchableOpacity>
            )}

            {/* (Si no está procesando muestra botón para limpiar todo) */}
            {!processing && (
              <TouchableOpacity onPress={() => { setFiles([]); setCompleted(false); }} style={styles.cancelButton}>
                {/* (Texto de cancelar) */}
                <Text style={styles.cancelText}>Empezar de nuevo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// (Reglas de diseño visual)
const styles = StyleSheet.create({
  // (Fondo de toda la pantalla)
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  // (Padding general y alineación al centro)
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  // (Caja punteada gigante para el inicio)
  uploadBox: { width: '100%', height: 300, borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  // (Estilo del texto del cuadro de subida)
  uploadText: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  // (Contenedor que hace que la lista ocupe el resto del espacio)
  fileContainer: { width: '100%', flex: 1 },
  // (Caja blanca que envuelve la lista con sombra sutil)
  listContainer: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 24, elevation: 2 },
  // (Diseño de cada fila de la lista de archivos con borde separador abajo)
  fileRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12 },
  // (Texto del nombre de archivo con márgenes)
  fileName: { flex: 1, marginHorizontal: 12, fontSize: 16, color: '#333' },
  // (Botón para añadir más archivos con padding y centrado)
  addMoreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, marginTop: 8 },
  // (Texto del botón añadir más color azul y negrita)
  addMoreText: { color: '#4285F4', fontWeight: 'bold', marginLeft: 8 },
  // (Botón grande inferior estilo genérico)
  actionButton: { width: '100%', padding: 18, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  // (Texto de los botones grandes color blanco)
  actionButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // (Botón de cancelar margen superior y centrado)
  cancelButton: { marginTop: 16, padding: 8, alignItems: 'center' },
  // (Color gris para texto de cancelar)
  cancelText: { color: '#888', fontSize: 14 },
  // (Caja de completado ocupando todo el ancho)
  completedBox: { alignItems: 'center', width: '100%' },
  // (Texto verde de la caja completada)
  completedText: { fontSize: 18, fontWeight: 'bold', color: '#34A853', marginVertical: 16 },
});

// si quitas la función MergeScreen el usuario perderá acceso a la herramienta de unir PDFs
// si quitas la función pickDocument no se podrán seleccionar archivos por ende la herramienta no servirá
// si quitas la función removeFile si un usuario se equivoca al elegir un archivo no podrá quitarlo de la lista
// si quitas la función processMerge los archivos nunca se enviarán a la API para fusionarse y la app se quedará sin hacer nada
// si quitas la función shareFile el archivo unido se quedará dentro de la app sin que el usuario pueda guardarlo o enviarlo a otros lados
