import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { UploadCloud, BrainCircuit, FileText } from 'lucide-react-native';
import { uploadFileToPdfco, extractTextFromPdf } from '../../lib/pdfco';
import { summarizeText } from '../../lib/ai';

// Sección: Herramienta de Resumen con Inteligencia Artificial
// (Esta pantalla permite al usuario subir un PDF extraer su texto usando PDF.co y generar un resumen inteligente utilizando la API de Gemini u otro modelo configurado)

// Función AIScreen: Pantalla principal para la herramienta de resumen por IA
// (Controla el estado del archivo seleccionado el indicador de procesamiento y el texto del resumen resultante)
export default function AIScreen() {
  // (Estado que guarda la información del documento seleccionado inicialmente es nulo)
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  // (Estado que indica si se está extrayendo texto o esperando respuesta de la IA)
  const [processing, setProcessing] = useState(false);
  // (Estado que almacena el texto del resumen generado por la IA)
  const [summary, setSummary] = useState<string | null>(null);

  // Función pickDocument: Abre el selector para elegir un documento PDF
  // (Permite al usuario buscar en sus archivos y seleccionar el PDF que desea resumir)
  async function pickDocument() {
    // (Inicia el bloque para manejar errores)
    try {
      // (Abre la interfaz del sistema para seleccionar archivos filtrando solo documentos PDF)
      const result = await DocumentPicker.getDocumentAsync({
        // (Restringe la selección únicamente a formato PDF)
        type: 'application/pdf',
        // (Hace una copia temporal del archivo en la caché de la aplicación para poder manipularlo)
        copyToCacheDirectory: true,
      });

      // (Verifica si el usuario completó la selección sin cancelar)
      if (!result.canceled) {
        // (Guarda el primer archivo seleccionado en el estado)
        setFile(result.assets[0]);
        // (Borra cualquier resumen anterior que pudiera existir en pantalla)
        setSummary(null);
      }
    // (Captura errores si el selector falla)
    } catch (err) {
      // (Muestra un mensaje de alerta en caso de error)
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  }

  // Función processSummary: Orquesta el flujo completo de extracción y resumen
  // (Sube el PDF extrae su texto mediante PDF.co y luego envía ese texto a la IA para obtener el resumen)
  async function processSummary() {
    // (Si no hay archivo seleccionado detiene la ejecución)
    if (!file) return;
    
    // (Activa el estado de carga para mostrar el indicador al usuario)
    setProcessing(true);
    // (Inicia bloque try para manejar operaciones de red asíncronas)
    try {
      // 1. Subir a PDF.co para extraer texto
      // (Sube el archivo físico a los servidores de PDF.co obteniendo una URL temporal)
      const uploadedUrl = await uploadFileToPdfco(file.uri, file.name);
      // (Llama a la función que extrae todo el texto del PDF alojado en esa URL temporal)
      const text = await extractTextFromPdf(uploadedUrl);
      
      // (Comprueba si se obtuvo texto válido y no solo espacios en blanco)
      if (!text || text.trim().length === 0) {
        // (Lanza un error descriptivo si el documento parece no contener texto extraíble como en PDFs escaneados)
        throw new Error('No se pudo extraer texto del documento. Quizás es una imagen escaneada.');
      }

      // 2. Enviar a Gemini para resumir
      // (Llama a la función de la librería AI pasándole el texto extraído para generar el resumen)
      const aiSummary = await summarizeText(text);

      // (Guarda el resumen obtenido en el estado para mostrarlo en pantalla)
      setSummary(aiSummary);
    // (Atrapa cualquier error ocurrido en la subida extracción o generación del resumen)
    } catch (error: any) {
      // (Muestra una alerta con el mensaje de error específico o uno genérico si no lo hay)
      Alert.alert('Error con IA', error.message || 'Ocurrió un error inesperado al analizar.');
    // (Bloque finally que se ejecuta siempre ocurra error o no)
    } finally {
      // (Desactiva el estado de carga al terminar el proceso)
      setProcessing(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: 'Resumen IA (Gemini)', headerTintColor: '#9C27B0' }} />

      {!file ? (
        <View style={styles.centerContent}>
          <TouchableOpacity style={[styles.uploadBox, { borderColor: '#9C27B0' }]} onPress={pickDocument}>
            <UploadCloud size={64} color="#9C27B0" />
            <Text style={[styles.uploadText, { color: '#9C27B0' }]}>Selecciona un PDF a resumir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.fileInfoBox}>
            <FileText size={32} color="#9C27B0" style={{marginBottom: 8}}/>
            <Text style={styles.fileName}>{file.name}</Text>
          </View>

          {!summary && !processing && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
              onPress={processSummary}
            >
              <BrainCircuit color="#fff" size={24} style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>Generar Resumen Inteligente</Text>
            </TouchableOpacity>
          )}

          {processing && (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#9C27B0" size="large" />
              <Text style={styles.loadingText}>La IA está leyendo y analizando...</Text>
            </View>
          )}

          {summary && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Resumen Generado:</Text>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          )}

          {!processing && (
            <TouchableOpacity onPress={() => {setFile(null); setSummary(null);}} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Elegir otro documento</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// (Estilos para la pantalla de IA)
const styles = StyleSheet.create({
  // (Fondo general de la pantalla)
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  // (Alineación para cuando no hay archivo seleccionado)
  centerContent: { flex: 1, padding: 24, justifyContent: 'center' },
  // (Padding y alineación para el scroll view principal)
  scrollContent: { padding: 24, alignItems: 'center' },
  // (Estilo de la caja punteada para subir el archivo)
  uploadBox: { width: '100%', height: 300, borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  // (Estilo del texto central de subida)
  uploadText: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  // (Diseño de la tarjeta que muestra el nombre del archivo)
  fileInfoBox: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 24, elevation: 1 },
  // (Texto para el nombre del archivo)
  fileName: { fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  // (Botón grande principal para disparar la acción de la IA)
  actionButton: { width: '100%', padding: 18, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  // (Texto del botón de acción principal)
  actionButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // (Contenedor que centra el spinner de carga)
  loadingBox: { alignItems: 'center', marginVertical: 32 },
  // (Texto descriptivo durante la carga)
  loadingText: { marginTop: 16, color: '#9C27B0', fontWeight: 'bold' },
  // (Contenedor con bordes coloreados que enmarca el texto del resumen)
  summaryBox: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#9C27B0', marginBottom: 24 },
  // (Título superior dentro de la caja de resumen)
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#9C27B0', marginBottom: 12 },
  // (Texto propio del resumen generado con espaciado para mejor lectura)
  summaryText: { fontSize: 14, color: '#333', lineHeight: 22 },
  // (Área táctil para cancelar)
  cancelButton: { marginTop: 16, padding: 8 },
  // (Texto gris para el botón de cancelar)
  cancelText: { color: '#888', fontSize: 14 },
});

// si quitas la función AIScreen los usuarios perderán el acceso a la herramienta de resumen y la pantalla no cargará
// si quitas la función pickDocument será imposible seleccionar un PDF para resumir
// si quitas la función processSummary el archivo nunca será procesado por PDF.co ni enviado a la inteligencia artificial

