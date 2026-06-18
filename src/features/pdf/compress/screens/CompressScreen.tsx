// SECCION DE IMPORTACIONES
// Importamos Stack de expo-router para poder configurar el texto y color del menú superior
import { Stack } from "expo-router";
// Importamos un montón de íconos chidos desde lucide para decorar los botones
import { CheckCircle, Download, File, Minimize } from "lucide-react-native";
// Importamos la librería base de React
import React from "react";
// Importamos componentes visuales de React Native para armar los bloques de la pantalla
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
// Traemos nuestro cerebro personalizado para la compresión que nos dará todas las funciones listas para usar
import { usePdfCompression } from "@/features/pdf/compress/hooks/usePdfCompression";
// Importamos los estilos de CSS para dejar esto bien presentable
import styles from "@/features/pdf/compress/styles/compress.styles";

// SECCION PRINCIPAL DE LA PANTALLA
// FUNCION: CompressScreen
// Este es el cascarón visual donde el usuario interactúa para exprimir sus PDFs
export default function CompressScreen() {
  // Bloque de desestructuración
  // Extraemos uno por uno los estados y funciones de nuestro gancho para conectarlos con los botones
  const {
    file,
    processing,
    completed,
    resultUri,
    pickDocument,
    processCompress,
    shareFile,
    setFile,
  } = usePdfCompression();

  // Bloque de renderizado principal
  // Devolvemos el árbol de componentes visuales de la aplicación
  return (
    // Ponemos el contenedor maestro que envuelve a todo
    <View style={styles.container}>
      {/* Pintamos la barra de arriba poniéndole el título de Comprimir PDF y coloreando la flechita de verde ecológico */}
      <Stack.Screen
        options={{ headerTitle: "Comprimir PDF", headerTintColor: "#34A853" }}
      />

      {/* Caja interior donde va todo el contenido */}
      <View style={styles.content}>
        {/* Bloque condicional inicial */}
        {/* Revisamos si todavía no elige archivo para mostrar el recuadro gigante de subida */}
        {!file || file.canceled ? (
          // Botón gigante cuadrado que llama a pickDocument al ser presionado
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: "#34A853" }]}
            onPress={pickDocument}
          >
            {/* Le ponemos un ícono de minimizar para que entienda que va a encoger el archivo */}
            <Minimize size={64} color="#34A853" style={{ marginBottom: 16 }} />
            {/* Textito para que sepa qué tiene que hacer */}
            <Text style={[styles.uploadText, { color: "#34A853" }]}>
              Selecciona el PDF a comprimir
            </Text>
          </TouchableOpacity>
        ) : (
          // Bloque del archivo seleccionado
          // Si ya eligió su documento mostramos esta otra vista
          <View style={styles.fileContainer}>
            {/* Cajita blanca para mostrar la información del documento */}
            <View style={styles.fileInfoBox}>
              {/* Ícono de un archivo normal */}
              <File size={48} color="#34A853" />
              {/* Ponemos el nombre tal cual lo extrajo del celular */}
              <Text style={styles.fileName}>{file.assets[0].name}</Text>
              {/* Hacemos un cálculo matemático loco para pasar los bytes a Megabytes y mostrarlo bonito con 2 decimales */}
              <Text style={styles.fileSize}>
                {(file.assets[0].size! / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>

            {/* Bloque condicional final */}
            {/* Revisamos si ya terminamos todo el proceso de reducir tamaño */}
            {completed ? (
              // Mostramos la caja verde de victoria
              <View style={styles.completedBox}>
                {/* Palomita gigante de triunfo */}
                <CheckCircle size={48} color="#34A853" />
                {/* Letrero feliz */}
                <Text style={styles.completedText}>¡Compresión Exitosa!</Text>
                {/* Botón para compartir o guardar el archivo invoca a la función shareFile */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#34A853" }]}
                  onPress={shareFile}
                >
                  {/* Le ponemos una flechita de descarga al lado del texto */}
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>
                    Compartir / Guardar PDF
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Si todavía no se completa mostramos el botón de acción normal
              // Este botón lanza processCompress para mandarlo al servidor
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#34A853" }]}
                onPress={processCompress}
                disabled={processing}
              >
                {/* Si estamos subiendo algo le metemos la ruedita de carga si no mostramos el texto normal */}
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Comprimir PDF</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Bloque del botón limpiar */}
            {/* Siempre que no esté la maquinita procesando le dejamos elegir otro archivo borrando el estado */}
            {!processing && (
              <TouchableOpacity
                onPress={() => { setFile(null); }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Elegir otro archivo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si borras la llamada a usePdfCompression al inicio? pasa que la pantalla se quedará desconectada del cerebro de fondo por lo que todos los botones marcarán errores diciendo que processing o pickDocument no existen
// para solucionarlo debes volver a importar y destapar el hook al inicio de tu componente
// ¿qué pasa si eliminas el chequeo de if !file ? pasa que la pantalla intentará mostrar el nombre del archivo sin que exista uno y crasheará con un error rojo feo de property undefined
// para solucionarlo devuelve el ternario asegurando que solo intente pintar nombre y tamaño si la variable de archivo ya existe
