// SECCION DE IMPORTACIONES
// Importamos React y el hook de estado para manejar la memoria de la pantalla
import React, { useState } from 'react';
// Importamos toda la botonería y vistas nativas del celular incluyendo TextInput para que puedan escribir
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, TextInput } from 'react-native';
// Traemos Stack para configurar la barra superior
import { Stack } from 'expo-router';
// Sacamos nuestros íconos bonitos
import { StickyNote, File, Download, CheckCircle } from 'lucide-react-native';
// Importamos el explorador de documentos
import * as DocumentPicker from 'expo-document-picker';
// Importamos utilidades de descarga y manejo de carpetas en el teléfono
import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
// Traemos la capacidad de compartir con otras aplicaciones
import * as Sharing from 'expo-sharing';

// SECCION PRINCIPAL DE LA PANTALLA
// FUNCION: NotesScreen
// Pantalla principal para rayar los PDFs
export default function NotesScreen() {
  // Guardamos el documento original aquí
  const [file, setFile] = useState<any>(null);
  // Estado para guardar las letras que el usuario escribe en la cajita
  const [noteText, setNoteText] = useState('');
  // Estado para saber en qué número de página quieren la nota
  const [pageNumber, setPageNumber] = useState('1');
  // Bandera para la ruedita de carga
  const [loading, setLoading] = useState(false);
  // Ruta local donde se va a guardar el documento modificado
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // FUNCION: pickDocument
  // Abre la galería nativa de documentos del usuario
  const pickDocument = async () => {
    // Intentamos abrir el selector
    try {
      // Pedimos que se abra restringiendo a solo PDFs y copiándolos al cache
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      // Si el usuario presiona cancelar nos salimos sin hacer nada
      if (result.canceled) return;
      // Guardamos el PDF
      setFile(result);
      // Limpiamos resultados anteriores por si estaban jugando
      setResultUrl(null);
    // Atrapamos errores silenciosamente en consola
    } catch (err) {
      console.error(err);
    }
  };

  // FUNCION: processNotes
  // Agarra el PDF y la nota y lo manda todo empaquetado al backend para que los fusione
  const processNotes = async () => {
    // Si olvidaron elegir el archivo les echamos bronca
    if (!file || file.canceled) {
      Alert.alert('Error', 'Selecciona un PDF primero.');
      return;
    }
    // Si olvidaron escribir la nota y dejaron puros espacios en blanco también les echamos bronca
    if (!noteText.trim()) {
      Alert.alert('Error', 'Ingresa el texto de la nota.');
      return;
    }

    // Prendemos la ruedita de carga
    setLoading(true);
    // Iniciamos el proceso peligroso de red
    try {
      // Agarramos la URL del backend desde el entorno o usamos una IP local por defecto
      const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.x:3000';
      // Desempaquetamos el primer archivo seleccionado
      const asset = file.assets[0];
      
      // Creamos un paquete de formulario grande
      const formData = new FormData();
      // Le metemos el documento pdf con todos sus metadatos
      formData.append("pdf", {
        uri: asset.uri,
        name: asset.name,
        type: "application/pdf"
      } as any);
      // Le embutimos el texto de la nota que escribieron
      formData.append("noteText", noteText);
      // Le decimos en qué página va o usamos la 1 por defecto si se hacen los chistosos
      formData.append("pageNumber", pageNumber || '1');
      
      // Mandamos el misil al servidor a nuestra ruta de notas
      const response = await fetch(`${apiUrl}/api/notes`, {
        method: 'POST',
        body: formData,
      });

      // Si el servidor nos dice que no
      if (!response.ok) {
        // Leemos el mensaje o ponemos un objeto vacío de salvavidas
        const data = await response.json().catch(() => ({}));
        // Aventamos el error al catch
        throw new Error(data.error || 'Error al procesar');
      }
      // Si todo sale bien leemos el JSON devuelto
      const data = await response.json();
      
      // Corregimos la URL asegurándonos de que sea HTTPS para que los teléfonos no bloqueen la descarga por insegura
      const secureUrl = data.url.replace(/^http:\/\/(?!localhost|192\.168)/i, 'https://');
      // Guardamos la URL final en nuestra memoria
      setResultUrl(secureUrl);
    // Atrapamos cualquier error de red o de código
    } catch (error: any) {
      // Usamos el sistema nativo de alertas de react native
      Alert.alert('Error', error.message);
    // Siempre apagamos la carga
    } finally {
      setLoading(false);
    }
  };

  // FUNCION: shareFile
  // Descarga el archivo de la nube y luego lanza la hoja de compartir
  const shareFile = async () => {
    // Si no hay URL que compartir abortamos
    if (!resultUrl) return;
    // Entramos a zona de descarga
    try {
      // Rescatamos el nombre original del archivo subido
      const originalName = file.assets[0].name;
      // Le forzamos el punto pdf si no lo tiene
      const fileName = originalName.endsWith('.pdf') ? originalName : `${originalName}.pdf`;
      // Ordenamos la descarga local en nuestra carpeta segura
      const downloadRes = await downloadAsync(
        resultUrl,
        documentDirectory + fileName
      );
      // Preguntamos si el celular soporta el menú de compartir
      if (await Sharing.isAvailableAsync()) {
        // Disparamos el menú con tipo de documento explícito para iOS
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Guardar PDF con nota',
          UTI: 'com.adobe.pdf'
        });
      // Si el celular es viejito y no soporta compartir
      } else {
        // Mostramos un mensajito diciendo dónde quedó guardado
        Alert.alert('Éxito', 'PDF guardado en el dispositivo: ' + downloadRes.uri);
      }
    // Atrapamos errores de guardado
    } catch (error: any) {
      // Y los mostramos en un popup feo
      Alert.alert('Error al descargar', error.message || 'No se pudo descargar el archivo');
    }
  };

  // Bloque principal visual
  // Devolvemos el árbol gráfico de toda la pantalla de notas
  return (
    // Cuadro negro azulado de fondo general
    <View style={styles.container}>
      {/* Título de la pantalla con letras amarillas fosforescentes */}
      <Stack.Screen options={{ headerTitle: 'Añadir Notas PDF', headerTintColor: '#FBBF24' }} />
      
      {/* Contenedor central con mucho padding */}
      <View style={styles.content}>
        {/* Bloque condicional inicial */}
        {/* Si no hay documento mostramos la cajota de seleccionar */}
        {!file || file.canceled ? (
          // El botón cuadrado punteado con el color amarillo inyectado directo
          <TouchableOpacity style={[styles.uploadBox, { borderColor: '#FBBF24' }]} onPress={pickDocument}>
            {/* Ícono de notita adhesiva amarilla */}
            <StickyNote size={64} color="#FBBF24" style={{ marginBottom: 16 }} />
            {/* Instrucción visual */}
            <Text style={[styles.uploadText, { color: '#FBBF24' }]}>Selecciona el PDF a anotar</Text>
          </TouchableOpacity>
        ) : (
          // Bloque del formulario activo
          // Si ya hay documento entramos al menú complejo
          <View style={styles.fileContainer}>
            {/* Tarjeta oscura enseñando qué archivo elegiste */}
            <View style={styles.fileInfoBox}>
              <File size={48} color="#FBBF24" />
              <Text style={styles.fileName}>{file.assets[0].name}</Text>
            </View>

            {/* Bloque condicional secundario */}
            {/* Si ya tenemos la URL del resultado mostramos la vista de victoria */}
            {resultUrl ? (
              <View style={styles.completedBox}>
                <CheckCircle size={48} color="#FBBF24" />
                <Text style={styles.completedText}>¡Nota añadida con éxito!</Text>
                {/* Botón amarillo que lanza shareFile para bajar y compartir */}
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FBBF24' }]} onPress={shareFile}>
                  <Download color="#000" size={24} style={{ marginRight: 8 }} />
                  {/* Letras negras sobre fondo amarillo estilo taxi */}
                  <Text style={[styles.actionButtonText, { color: '#000' }]}>Descargar PDF</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Si aún no procesamos mostramos los campos para escribir
              <View style={styles.formContainer}>
                {/* Cajita grande para la nota */}
                <TextInput
                  style={styles.input}
                  placeholder="Escribe tu nota aquí..."
                  placeholderTextColor="#64748b"
                  value={noteText}
                  onChangeText={setNoteText}
                  // Propiedad clave para que deje dar saltos de línea
                  multiline
                />
                {/* Cajita chica para la página */}
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Número de página (ej: 1)"
                  placeholderTextColor="#64748b"
                  value={pageNumber}
                  onChangeText={setPageNumber}
                  // Forzamos el teclado de numeritos
                  keyboardType="numeric"
                />
                {/* Botón de envío principal amarillo que se desactiva si está cargando */}
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FBBF24' }]} onPress={processNotes} disabled={loading}>
                  {/* Cambio dinámico entre la ruedita o el texto normal */}
                  {loading ? <ActivityIndicator color="#000" /> : <Text style={[styles.actionButtonText, { color: '#000' }]}>Añadir Nota</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* Bloque del botón rojo ocultable */}
            {/* Si la app no está calculando nada mostramos la opción de cambiar de archivo */}
            {!loading && (
              <TouchableOpacity onPress={() => { setFile(null); setResultUrl(null); }} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Elegir otro archivo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// SECCION DE ESTILOS
// Aquí guardamos en local todo el CSS falso para React Native
const styles = StyleSheet.create({
  // Contenedor principal con fondo azul hiper mega oscuro
  container: { flex: 1, backgroundColor: '#0f172a' },
  // Caja de contenido centrada
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  // Caja punteada para seleccionar archivos
  uploadBox: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: 20, padding: 40,
    alignItems: 'center', backgroundColor: '#1e293b'
  },
  // Texto grueso para la caja punteada
  uploadText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  // Contenedor alineado al centro ocupando todo el ancho posible
  fileContainer: { alignItems: 'center', width: '100%' },
  // Tarjetita oscura para mostrar info con bordes redondeados
  fileInfoBox: {
    backgroundColor: '#1e293b', padding: 24, borderRadius: 16, width: '100%',
    alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#334155'
  },
  // Nombre del documento en color blanquito
  fileName: { color: '#f8fafc', fontSize: 16, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  // Contenedor estirable para los text inputs
  formContainer: { width: '100%' },
  // Área de texto grande con 100 píxeles de alto y texto anclado arriba para que parezca libreta
  input: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 16, color: '#f8fafc',
    marginBottom: 12, borderWidth: 1, borderColor: '#334155', height: 100, textAlignVertical: 'top'
  },
  // Área de texto chica normalita de un solo renglón
  inputSmall: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 16, color: '#f8fafc',
    marginBottom: 24, borderWidth: 1, borderColor: '#334155'
  },
  // Estilo base para el boton grandote inferior
  actionButton: {
    padding: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', width: '100%'
  },
  // Letras negras y gruesas para los botones amarillos
  actionButtonText: { fontSize: 18, fontWeight: 'bold' },
  // Caja agrupadora para mensaje final victorioso
  completedBox: { alignItems: 'center', width: '100%', marginBottom: 24 },
  // Texto amarillo de que la cosa salió al cien
  completedText: { color: '#FBBF24', fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 24 },
  // Espaciado para el botón rojo
  cancelButton: { marginTop: 24 },
  // Letras rojas estilo advertencia para cancelar
  cancelText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' }
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si borras la validación de !noteText.trim() al inicio de processNotes? pasa que el usuario podrá enviar peticiones con puros espacios vacíos y el servidor te regresará un error extraño o ensuciará tu documento con cajas de texto transparentes
// para solucionarlo debes volver a poner la condición del trim para forzar al usuario a teclear al menos una letra de verdad
// ¿qué pasa si eliminas la propiedad multiline del primer TextInput? pasa que el usuario solo podrá escribir en un solo renglón infinito que se irá deslizando horizontalmente siendo muy incómodo leer notas largas en el celular
// para solucionarlo debes reincorporar la etiqueta multiline y asegurarte que el estilo mantenga el textAlignVertical top para que el cursor arranque desde arriba
