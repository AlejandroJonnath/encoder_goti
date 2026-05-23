import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Stack as ExpoStack } from 'expo-router';

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { documentDirectory, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { UploadCloud, CheckCircle, Download, FileSignature, ImageIcon } from 'lucide-react-native';
import { PDFDocument } from 'pdf-lib';

// Sección: Pantalla para Estampar Firma en Documentos PDF
// (Permite subir un PDF tomar o subir una foto de una firma e incrustarla en una de las esquinas o el centro de la primera página del documento)

// (Define un tipo específico para las cinco posiciones posibles de la firma)
type Position = 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';

// Función SignScreen: Controla toda la interfaz y flujo de firmado local
// (Gestiona la selección del PDF la imagen de la firma su posición y usa pdf-lib para incrustarla sin necesidad de internet)
export default function SignScreen() {
  // (Estado que guarda el documento PDF seleccionado para ser firmado)
  const [pdfFile, setPdfFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  // (Estado que guarda la imagen de la firma seleccionada desde la galería)
  const [signatureImage, setSignatureImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  // (Estado que guarda la posición elegida por el usuario por defecto abajo a la derecha)
  const [position, setPosition] = useState<Position>('bottom-right');
  
  // (Estado que indica si la aplicación está procesando el PDF localmente)
  const [processing, setProcessing] = useState(false);
  // (Estado que indica si la firma ya fue añadida con éxito)
  const [completed, setCompleted] = useState(false);
  // (Guarda la ruta del nuevo PDF generado para poder descargarlo o compartirlo)
  const [resultUri, setResultUri] = useState<string | null>(null);

  // Función pickPdf: Selecciona el documento que recibirá la firma
  // (Abre el selector de documentos filtrando por PDFs y lo guarda temporalmente)
  async function pickPdf() {
    // (Manejo de errores básicos)
    try {
      // (Pide seleccionar un archivo con extensión pdf)
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        // (Copiar al caché asegura que lo podamos leer sin problemas de permisos luego)
        copyToCacheDirectory: true,
      });

      // (Si no fue cancelada la acción se guarda el primer archivo elegido)
      if (!result.canceled) {
        setPdfFile(result.assets[0]);
      }
    // (Atrapa fallos al abrir la interfaz del sistema)
    } catch (err) {
      // (Alerta que hubo fallo en la selección)
      Alert.alert('Error', 'No se pudo seleccionar el PDF');
    }
  }

  // Función pickSignature: Selecciona la imagen de la firma desde la galería
  // (Verifica permisos de galería abre el selector de fotos y permite recortar la imagen antes de usarla)
  async function pickSignature() {
    // (Inicia bloque para atrapar errores)
    try {
      // (Pide permiso explícito al sistema operativo para acceder a fotos y galería)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      // (Si el usuario rechaza el permiso detiene el flujo)
      if (status !== 'granted') {
        // (Notifica al usuario por qué se detuvo)
        Alert.alert('Permiso Denegado', 'Necesitamos acceso a la galería para seleccionar la firma.');
        return;
      }

      // (Abre la galería filtrando solo imágenes)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        // (Habilita el editor nativo para que el usuario pueda recortar bordes de su firma)
        allowsEditing: true,
        // (Mantener calidad máxima)
        quality: 1,
      });

      // (Si se completó el proceso se guarda la imagen recortada en el estado)
      if (!result.canceled) {
        setSignatureImage(result.assets[0]);
      }
    // (Atrapa problemas abriendo la galería o editando)
    } catch (err) {
      // (Alerta de fallo en la imagen)
      Alert.alert('Error', 'No se pudo seleccionar la imagen de la firma');
    }
  }

  // Función processSign: Inserta la firma en el PDF usando la librería local pdf-lib
  // (Lee ambos archivos en base64 los combina calculando coordenadas y guarda el resultado en el dispositivo)
  async function processSign() {
    // (Si falta alguno de los dos archivos aborta la operación)
    if (!pdfFile || !signatureImage) return;
    
    // (Muestra indicador de proceso)
    setProcessing(true);
    // (Inicia manejo de operaciones asíncronas)
    try {
      // (Lee el archivo PDF original convirtiéndolo a texto codificado en base64 para pdf-lib)
      const pdfBase64 = await readAsStringAsync(pdfFile.uri, { encoding: 'base64' });
      // (Carga el documento en memoria usando la librería)
      const pdfDoc = await PDFDocument.load(pdfBase64);

      // (Lee la imagen de la firma de la misma manera)
      const imageBase64 = await readAsStringAsync(signatureImage.uri, { encoding: 'base64' });
      
      // (Variable para guardar la imagen ya incrustada en el PDF temporalmente)
      let img;
      // (Intenta adivinar el formato de la imagen para incrustarla correctamente)
      try {
        // (Revisa el tipo mime o extensión para usar el método correcto png o jpg)
        if (signatureImage.mimeType === 'image/png' || signatureImage.uri.toLowerCase().endsWith('.png')) {
          img = await pdfDoc.embedPng(imageBase64);
        } else {
          img = await pdfDoc.embedJpg(imageBase64);
        }
      // (Si falla el primer intento prueba cruzando el método como alternativa de rescate)
      } catch (e) {
        try {
          img = await pdfDoc.embedPng(imageBase64);
        } catch (e2) {
          img = await pdfDoc.embedJpg(imageBase64);
        }
      }

      // (Obtiene un arreglo con todas las páginas del PDF)
      const pages = pdfDoc.getPages();
      // (Toma únicamente la primera página para colocar la firma allí)
      const firstPage = pages[0];
      // (Extrae el ancho y alto real de la primera página)
      const { width, height } = firstPage.getSize();
      
      // (Escala la imagen para que encaje proporcionalmente en un cuadro de 150x150 puntos)
      const imgDims = img.scaleToFit(150, 150);
      
      // (Variables iniciales para las coordenadas x e y de la firma)
      let x = 50;
      let y = 50;

      // (Calcula las coordenadas finales basándose en la opción elegida por el usuario)
      switch (position) {
        case 'bottom-right':
          // (Ancho total menos el ancho de la imagen y un margen de 50)
          x = width - imgDims.width - 50;
          // (Margen inferior estándar de 50)
          y = 50;
          break;
        case 'bottom-left':
          // (Margen izquierdo estándar)
          x = 50;
          y = 50;
          break;
        case 'top-right':
          x = width - imgDims.width - 50;
          // (Alto total menos la altura de la firma menos un margen)
          y = height - imgDims.height - 50;
          break;
        case 'top-left':
          x = 50;
          y = height - imgDims.height - 50;
          break;
        case 'center':
          // (Calcula el centro exacto dividiendo por dos el espacio sobrante)
          x = (width - imgDims.width) / 2;
          y = (height - imgDims.height) / 2;
          break;
      }
      
      // (Dibuja la imagen sobre la primera página usando las coordenadas y dimensiones calculadas)
      firstPage.drawImage(img, {
        x,
        y,
        width: imgDims.width,
        height: imgDims.height,
      });

      // (Genera el nuevo archivo en memoria convirtiéndolo a base64 de vuelta)
      const pdfBytes = await pdfDoc.saveAsBase64();
      // (Define una ruta en el directorio de documentos con un nombre único basado en la fecha)
      const finalUri = documentDirectory + 'signed_' + Date.now() + '.pdf';
      // (Escribe el archivo físico usando el string base64)
      await writeAsStringAsync(finalUri, pdfBytes, { encoding: 'base64' });

      // (Guarda la ruta de acceso al nuevo PDF en el estado)
      setResultUri(finalUri);
      // (Marca el proceso como terminado)
      setCompleted(true);
    // (Captura errores durante la modificación manipulación o guardado)
    } catch (error: any) {
      // (Notifica con error detallado ya que pueden ser fallos de memoria o formato)
      Alert.alert('Error detallado', error.message || 'Error desconocido');
    // (Bloque de salida obligatoria)
    } finally {
      // (Desactiva la animación de carga)
      setProcessing(false);
    }
  }

  // Función shareFile: Despliega la ventana nativa de compartir
  // (Permite enviar el archivo resultante al sistema operativo o a otra aplicación)
  async function shareFile() {
    // (Comprueba que haya un archivo generado y compartir esté activo)
    if (resultUri && await Sharing.isAvailableAsync()) {
      // (Gatilla la hoja de compartir)
      await Sharing.shareAsync(resultUri);
    }
  }

  // Componente interno PositionButton: Crea los botones para elegir dónde va la firma
  const PositionButton = ({ pos, label }: { pos: Position, label: string }) => (
    <TouchableOpacity
      style={[styles.posButton, position === pos && styles.posButtonActive]}
      onPress={() => setPosition(pos)}
    >
      <Text style={[styles.posButtonText, position === pos && styles.posButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  // (Devuelve la estructura visual general)
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      {/* (Configuración del encabezado de navegación con color naranja cálido) */}
      <ExpoStack.Screen options={{ headerTitle: 'Firmar PDF', headerTintColor: '#FBBC05' }} />

      {/* (Contenedor que centra el contenido en toda la vista disponible) */}
      <View style={styles.content}>
        {/* (Si todavía no se ha elegido el documento base) */}
        {!pdfFile ? (
          <TouchableOpacity style={[styles.uploadBox, { borderColor: '#FBBC05' }]} onPress={pickPdf}>
            {/* (Icono de subida naranja) */}
            <UploadCloud size={64} color="#FBBC05" />
            {/* (Texto guía de paso 1) */}
            <Text style={[styles.uploadText, { color: '#FBBC05' }]}>Paso 1: Selecciona el PDF</Text>
          </TouchableOpacity>
        ) : !signatureImage ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            {/* (Mensaje confirmando que el PDF ya está listo) */}
            <Text style={styles.fileName}>PDF Seleccionado: {pdfFile.name}</Text>
            {/* (Botón punteado para tomar o elegir foto de la galería) */}
            <TouchableOpacity style={[styles.uploadBox, { borderColor: '#FBBC05', marginTop: 24 }]} onPress={pickSignature}>
              {/* (Icono representativo de imagen) */}
              <ImageIcon size={64} color="#FBBC05" />
              {/* (Texto guía de paso 2) */}
              <Text style={[styles.uploadText, { color: '#FBBC05' }]}>Paso 2: Foto de tu Firma</Text>
              {/* (Subtítulo aclarando la función de recorte nativa) */}
              <Text style={styles.uploadSubtext}>(Podrás recortarla y ajustarla)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.fileContainer}>
            {/* (Caja blanca superior con resumen de información) */}
            <View style={styles.fileInfoBox}>
              {/* (Icono decorativo de firma) */}
              <FileSignature size={48} color="#FBBC05" style={{ marginBottom: 12 }} />
              {/* (Muestra el nombre del documento cortándolo si es largo) */}
              <Text style={styles.fileName} numberOfLines={1}>Documento: {pdfFile.name}</Text>
              {/* (Muestra una previsualización de la firma recortada cargándola desde el estado temporal) */}
              <Image source={{ uri: signatureImage.uri }} style={styles.previewImage} resizeMode="contain" />

              {/* (Título del menú de posiciones) */}
              <Text style={styles.posTitle}>¿Dónde ubicar la firma?</Text>
              {/* (Contenedor flex wrap para que los botones se acomoden solos) */}
              <View style={styles.posGrid}>
                {/* (Botones que usan el subcomponente interno creado arriba) */}
                <PositionButton pos="top-left" label="Arriba Izq" />
                <PositionButton pos="top-right" label="Arriba Der" />
                <PositionButton pos="center" label="Centro" />
                <PositionButton pos="bottom-left" label="Abajo Izq" />
                <PositionButton pos="bottom-right" label="Abajo Der" />
              </View>
            </View>

            {/* (Si ya la firma fue estampada en el pdf se muestra la caja verde) */}
            {completed ? (
              <View style={styles.completedBox}>
                {/* (Icono de palomita verde) */}
                <CheckCircle size={48} color="#34A853" />
                {/* (Mensaje de victoria) */}
                <Text style={styles.completedText}>¡Firma Añadida con Éxito!</Text>
                {/* (Botón naranja para exportar el archivo listo) */}
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FBBC05' }]} onPress={shareFile}>
                  {/* (Icono pequeño de bajada) */}
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  {/* (Texto para compartir guardar) */}
                  <Text style={styles.actionButtonText}>Compartir / Guardar PDF</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FBBC05' }]}
                onPress={processSign}
                disabled={processing}
              >
                {/* (Condicional que muestra el spinner o el texto estampar firma) */}
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Estampar Firma</Text>}
              </TouchableOpacity>
            )}

            {/* (Si no se está trabajando se muestra botón de cancelar general) */}
            {!processing && (
              <TouchableOpacity onPress={() => { setPdfFile(null); setSignatureImage(null); setCompleted(false); }} style={styles.cancelButton}>
                {/* (Texto descriptivo del reseteo) */}
                <Text style={styles.cancelText}>Cancelar y empezar de nuevo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// (Todos los estilos aplicados a esta pantalla compleja)
const styles = StyleSheet.create({
  // (Estilo para asegurar que tome todo el espacio con fondo muy suave)
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  // (Centra elementos dejando que el alto mínimo abarque la pantalla)
  content: { padding: 24, justifyContent: 'center', alignItems: 'center', minHeight: '100%' },
  // (Botón gigante vacío con borde punteado)
  uploadBox: { width: '100%', height: 250, borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  // (Texto grueso dentro de botones de subida)
  uploadText: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  // (Nota pequeña y grisácea)
  uploadSubtext: { fontSize: 12, color: '#888', marginTop: 8 },
  // (Contenedor que ocupa la totalidad de su padre a lo ancho)
  fileContainer: { width: '100%', alignItems: 'center' },
  // (Caja estilo tarjeta blanca y elevada para datos combinados)
  fileInfoBox: { width: '100%', backgroundColor: '#fff', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 24, elevation: 2 },
  // (Estilo general para nombrar el documento)
  fileName: { fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  // (Dimensiones controladas para la miniatura de la firma y borde sutil)
  previewImage: { width: 100, height: 80, marginTop: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
  // (Título de la sección de coordenadas o cuadricula de ubicación)
  posTitle: { marginTop: 24, marginBottom: 12, fontSize: 14, fontWeight: 'bold', color: '#555' },
  // (Flexbox que permite varios botones por línea adaptándose automáticamente)
  posGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  // (Aspecto por defecto inactivo de los botones de posición fondo gris sutil)
  posButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  // (Aspecto cuando el botón de posición se toca fondo claro naranja y borde grueso naranja)
  posButtonActive: { backgroundColor: '#fff5d7', borderColor: '#FBBC05' },
  // (Letra base para los botones no seleccionados)
  posButtonText: { fontSize: 12, color: '#666', fontWeight: '500' },
  // (Letra en negrita y naranja para marcar selección activa)
  posButtonTextActive: { color: '#d99a00', fontWeight: 'bold' },
  // (Botones masivos y principales en la zona inferior de cada pantalla)
  actionButton: { width: '100%', padding: 18, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  // (Fuente destacada de color blanco sobre los botones con fondo fuerte)
  actionButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // (Separación ligera para el botón inferior de reset)
  cancelButton: { marginTop: 16, padding: 8 },
  // (Texto con estilo secundario y desapercibido)
  cancelText: { color: '#888', fontSize: 14 },
  // (Contenedor que abarca de borde a borde para mostrar mensaje de finalizado)
  completedBox: { alignItems: 'center', width: '100%' },
  // (Mensaje final verde y de buen tamaño destacando el logro)
  completedText: { fontSize: 18, fontWeight: 'bold', color: '#34A853', marginVertical: 16 },
});

// si quitas la función SignScreen el usuario nunca podrá utilizar la herramienta de firmas
// si quitas la función pickPdf no se podrá seleccionar el PDF base y el flujo se bloqueará
// si quitas la función pickSignature el usuario no podrá subir fotos de su propia galería para usarlas como firmas
// si quitas la función processSign el motor local de firmas fallará no se harán conversiones de base64 y el PDF no se unirá con la imagen de la firma
// si quitas la función shareFile el archivo PDF con la firma será inaccesible al usuario fuera de la aplicación
