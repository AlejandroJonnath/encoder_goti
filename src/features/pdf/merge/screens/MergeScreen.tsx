// SECCION DE IMPORTACIONES
// Importamos Stack de expo-router para poder cambiar los títulos de la pantalla de arriba
import { Stack } from "expo-router";
// Importamos nuestro paquete de íconos chidos desde lucide
import {
  CheckCircle,
  Download,
  FileText,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react-native";
// Traemos React para que la magia del código funcione
import React from "react";
// Importamos varios componentes visuales de react-native incluyendo FlatList que es súper importante para listas largas
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Importamos nuestro cerebro que se encarga de manejar toda la lógica para unir PDFs
import { usePdfMerger } from "@/features/pdf/merge/hooks/usePdfMerger";
// Importamos el estilo gráfico
import styles from "@/features/pdf/merge/styles/merge.styles";

// SECCION PRINCIPAL DE LA PANTALLA
// FUNCION: MergeScreen
// Este es el cascarón que se dibuja en la pantalla para dejarte pegar tus PDFs
export default function MergeScreen() {
  // Bloque de extracción del hook
  // Sacamos cada uno de los estados y funciones de nuestro gancho personalizado
  const {
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
  } = usePdfMerger();

  // Bloque de renderizado
  // Devolvemos el esqueleto de componentes
  return (
    // Nuestro marco grandote de la pantalla
    <View style={styles.container}>
      {/* Configuración de la barra superior donde le ponemos el título de Unir PDFs de color azulito */}
      <Stack.Screen
        options={{ headerTitle: "Unir PDFs", headerTintColor: "#4285F4" }}
      />

      {/* Contenedor central donde va la carnita */}
      <View style={styles.content}>
        {/* Bloque condicional inicial */}
        {/* Si nuestra lista de archivos está vacía mostramos el botón gigante de subida */}
        {files.length === 0 ? (
          // El famoso recuadro punteado al que puedes picarle
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: "#4285F4" }]}
            onPress={pickDocument}
          >
            {/* Ícono de nube azul */}
            <UploadCloud size={64} color="#4285F4" />
            <Text style={[styles.uploadText, { color: "#4285F4" }]}>
              Selecciona 2 o más PDFs
            </Text>
          </TouchableOpacity>
        ) : (
          // Bloque principal con archivos
          // Si ya tienes al menos un archivo pasamos a la vista compleja
          <View style={styles.fileContainer}>
            {/* Cajita blanca contenedora de la lista */}
            <View style={styles.listContainer}>
              {/* Aquí usamos FlatList para pintar de manera eficiente la lista de todos los PDFs que has metido */}
              <FlatList
                // Le pasamos el arreglo entero de archivos
                data={files}
                // Usamos la posición del arreglo como llave de identificación
                keyExtractor={(item, index) => index.toString()}
                // Rendereamos cada fila individual
                renderItem={({ item, index }) => (
                  // Contenedor horizontal para la fila de un solo archivo
                  <View style={styles.fileRow}>
                    {/* Ponemos un iconito azul de documento a la izquierda */}
                    <FileText color="#4285F4" size={24} />
                    {/* Pintamos el nombre del archivo cortándolo si es demasiado largo para que no se desborde */}
                    <Text style={styles.fileName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {/* Botón de basurita roja para poder eliminar este archivo de la lista si te equivocaste */}
                    <TouchableOpacity onPress={() => removeFile(index)}>
                      <Trash2 color="#E5322D" size={24} />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {/* Botón para meter más cosas a la licuadora */}
              {/* Solo aparece si no estamos a mitad de un proceso ni hemos terminado */}
              {!processing && !completed && (
                <TouchableOpacity
                  style={styles.addMoreButton}
                  onPress={pickDocument}
                >
                  <Plus color="#4285F4" size={20} />
                  <Text style={styles.addMoreText}>Añadir más archivos</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Bloque condicional de finalización */}
            {/* Si ya recibimos el PDF gigante de regreso mostramos la victoria */}
            {completed ? (
              <View style={styles.completedBox}>
                {/* Palomita verde de la suerte */}
                <CheckCircle size={48} color="#34A853" />
                <Text style={styles.completedText}>¡PDFs Unidos!</Text>
                {/* Botón azulote para repartir nuestro archivo */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#4285F4" }]}
                  onPress={shareFile}
                >
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>
                    Compartir / Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Si no hemos terminado dejamos el botón principal para arrancar el motor
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#4285F4" }]}
                onPress={processMerge}
                // Si ya estamos uniendo bloqueamos el botón para que no manden doscientas peticiones
                disabled={processing}
              >
                {/* Si la bandera procesando está arriba le clavamos la ruedita de carga */}
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  // Si no mostramos las letras normales
                  <Text style={styles.actionButtonText}>Unir Archivos</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Bloque del botón de reseteo */}
            {/* Mientras no estemos procesando dejamos que el usuario limpie la mesa de trabajo */}
            {!processing && (
              <TouchableOpacity
                onPress={() => {
                  setFiles([]);
                  setCompleted(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Empezar de nuevo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si borras la FlatList? pasa que desaparecerán por completo los nombres de los archivos que elegiste dejándote ciego sobre qué diablos vas a unir porque la interfaz no pintará ninguna fila
// para solucionarlo debes volver a montar el componente FlatList configurando su data renderItem y keyExtractor
// ¿qué pasa si quitas la llamada a removeFile en el icono del bote de basura? pasa que podrás picar el basurero mil veces pero jamás se borrará el archivo y te quedarás con archivos basura atorados en tu lista
// para solucionarlo reconecta el evento onPress de ese botón y pásale la función removeFile con su índice correspondiente
