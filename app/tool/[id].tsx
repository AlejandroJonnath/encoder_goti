import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { UploadCloud, File, CheckCircle, Download } from 'lucide-react-native';

// Sección: Pantalla genérica para herramientas de PDF
// (Maneja la selección de archivos y muestra la interfaz principal para herramientas que aún no tienen una pantalla específica o se manejan de forma dinámica)

// (Objeto que contiene los detalles de cada herramienta según su ID incluyendo el título el color de la interfaz y el endpoint de la API)
const toolDetails: Record<string, { title: string, color: string, endpoint: string }> = {
  // (Configuración para la herramienta de conversión)
  'convert': { title: 'Convertir a PDF', color: '#E5322D', endpoint: '/pdf/convert/from/doc' },
  // (Configuración para la herramienta de compresión)
  'compress': { title: 'Comprimir PDF', color: '#34A853', endpoint: '/pdf/optimize' },
  // (Configuración para la herramienta de unión de PDFs)
  'merge': { title: 'Unir PDF', color: '#4285F4', endpoint: '/pdf/merge' },
  // (Configuración para la herramienta de firmas)
  'sign': { title: 'Firmar PDF', color: '#FBBC05', endpoint: '/pdf/edit/add' },
  // (Configuración para la herramienta de inteligencia artificial)
  'ai': { title: 'Resumen IA', color: '#9C27B0', endpoint: 'custom_ai' },
};

// Función ToolScreen: Muestra la interfaz de la herramienta seleccionada dinámicamente
// (Permite seleccionar un archivo muestra su información y simula un procesamiento con estados de carga y finalización)
export default function ToolScreen() {
  // (Obtiene el parámetro id de la URL actual para saber qué herramienta mostrar)
  const { id } = useLocalSearchParams();
  // (Busca los detalles de la herramienta usando el id obtenido si no existe asigna un valor por defecto)
  const tool = toolDetails[id as string] || { title: 'Herramienta', color: '#333' };
  
  // (Estado que guarda la información del archivo seleccionado por el usuario inicialmente es nulo)
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  // (Estado que indica si la aplicación está procesando el archivo inicialmente es falso)
  const [processing, setProcessing] = useState(false);
  // (Estado que indica si el procesamiento del archivo ya se completó inicialmente es falso)
  const [completed, setCompleted] = useState(false);

  // Función pickDocument: Abre el selector de archivos del dispositivo
  // (Permite al usuario elegir un documento para ser procesado por la herramienta)
  async function pickDocument() {
    // (Inicia un bloque try para manejar posibles errores durante la selección del archivo)
    try {
      // (Llama a la API de Expo para abrir el selector de archivos y espera la respuesta del usuario)
      const result = await DocumentPicker.getDocumentAsync({
        // (Define los tipos de archivos permitidos como PDF Word e imágenes)
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
        // (Indica que el archivo seleccionado debe copiarse al directorio de caché de la aplicación)
        copyToCacheDirectory: true,
      });

      // (Verifica si el usuario no canceló la selección del archivo)
      if (!result.canceled) {
        // (Guarda el resultado de la selección en el estado file)
        setFile(result);
        // (Reinicia el estado completed a falso por si se había procesado un archivo antes)
        setCompleted(false);
      }
    // (Captura cualquier error que ocurra al intentar abrir el selector de archivos)
    } catch (err) {
      // (Muestra una alerta al usuario indicando que hubo un problema al seleccionar el archivo)
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  }

  // Función processFile: Simula el procesamiento del archivo seleccionado
  // (Cambia los estados para mostrar la carga y luego marca el proceso como completado después de un tiempo)
  async function processFile() {
    // (Si no hay archivo o la selección fue cancelada detiene la ejecución de la función)
    if (!file || file.canceled) return;
    
    // (Cambia el estado processing a verdadero para mostrar el indicador de carga en la pantalla)
    setProcessing(true);
    
    // (Inicia un temporizador que simulará el tiempo de espera del procesamiento)
    setTimeout(() => {
      // (Cambia el estado processing a falso porque el proceso ya terminó)
      setProcessing(false);
      // (Cambia el estado completed a verdadero para mostrar el botón de descarga)
      setCompleted(true);
      // (Muestra una alerta indicando que el proceso fue un éxito)
      Alert.alert('¡Éxito!', 'El archivo ha sido procesado correctamente.');
    // (El temporizador espera tres segundos)
    }, 3000);
  }

  // (Retorna la estructura visual de la pantalla)
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: tool.title, headerTintColor: tool.color }} />

      <View style={styles.content}>
        {!file || file.canceled ? (
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: tool.color }]}
            onPress={pickDocument}
          >
            <UploadCloud size={64} color={tool.color} />
            <Text style={[styles.uploadText, { color: tool.color }]}>Selecciona un archivo</Text>
            <Text style={styles.uploadSubtext}>o toca aquí para explorar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileContainer}>
            <View style={styles.fileInfoBox}>
              <File size={48} color={tool.color} />
              <Text style={styles.fileName}>{file.assets[0].name}</Text>
              <Text style={styles.fileSize}>{(file.assets[0].size! / 1024 / 1024).toFixed(2)} MB</Text>
            </View>

            {completed ? (
              <View style={styles.completedBox}>
                <CheckCircle size={48} color="#34A853" />
                <Text style={styles.completedText}>¡Procesamiento Completado!</Text>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: tool.color }]}>
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>Descargar Archivo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: tool.color }]}
                onPress={processFile}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Procesar Archivo</Text>
                )}
              </TouchableOpacity>
            )}

            {!processing && !completed && (
              <TouchableOpacity onPress={() => setFile(null)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Elegir otro archivo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// (Objeto que contiene todos los estilos visuales para los componentes de la pantalla)
const styles = StyleSheet.create({
  // (Estilo para el contenedor principal de la pantalla)
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // (Estilo para centrar el contenido principal y añadir padding)
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // (Estilo para el área de subida de archivos creando un cuadro con borde punteado)
  uploadBox: {
    width: '100%',
    height: 300,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  // (Estilo para el texto principal del área de subida)
  uploadText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  // (Estilo para el texto secundario del área de subida)
  uploadSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  // (Estilo para el contenedor que envuelve la información del archivo y botones)
  fileContainer: {
    width: '100%',
    alignItems: 'center',
  },
  // (Estilo para la caja que muestra el nombre y tamaño del archivo seleccionado)
  fileInfoBox: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // (Estilo para el texto del nombre del archivo)
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  // (Estilo para el texto del tamaño del archivo)
  fileSize: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  // (Estilo general para los botones de acción principales como procesar o descargar)
  actionButton: {
    width: '100%',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  // (Estilo para el texto dentro de los botones de acción)
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // (Estilo para el área tocable del botón de cancelar)
  cancelButton: {
    marginTop: 16,
    padding: 8,
  },
  // (Estilo para el texto del botón de cancelar)
  cancelText: {
    color: '#888',
    fontSize: 14,
  },
  // (Estilo para el contenedor que agrupa los elementos mostrados tras completar el proceso)
  completedBox: {
    alignItems: 'center',
    width: '100%',
  },
  // (Estilo para el texto de éxito del proceso)
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34A853',
    marginVertical: 16,
  },
});

// si quitas la función ToolScreen los usuarios no podrán interactuar con la herramienta dinámica y la aplicación mostrará una pantalla en blanco o un error de navegación
// si quitas la función pickDocument no se podrá abrir el explorador de archivos del teléfono y la herramienta quedará inservible
// si quitas la función processFile la aplicación no simulará o ejecutará el trabajo con el archivo y el usuario quedará estancado sin resultados
