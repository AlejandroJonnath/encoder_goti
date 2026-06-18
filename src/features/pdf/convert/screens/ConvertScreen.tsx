// SECCION DE IMPORTACIONES
// Importamos herramientas de enrutamiento para sacar los parámetros de la URL y modificar la barra superior
import { Stack, useLocalSearchParams } from "expo-router";
// Importamos nuestra batería de íconos para darle onda a los botones
import {
  CheckCircle,
  Download,
  FileType,
  RefreshCw,
  UploadCloud,
} from "lucide-react-native";
// Requerimos React como siempre
import React from "react";
// Importamos componentes visuales de celular
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
// Importamos la inteligencia que hace todo el trabajo pesado de convertir
import { usePdfConversion } from "@/features/pdf/convert/hooks/usePdfConversion";
// Importamos el archivo de diseño
import styles from "@/features/pdf/convert/styles/convert.styles";

// Mapeo constante que define colores y nombres amigables según el tipo de conversión
// Esto es súper útil porque así usamos la misma pantalla para 15 herramientas distintas y solo le cambiamos el colorcito y el texto
const TYPE_MAP: Record<string, { label: string; color: string }> = {
  "to-word": { label: "PDF a Word", color: "#2B579A" },
  "to-excel": { label: "PDF a Excel", color: "#217346" },
  "to-jpg": { label: "PDF a JPG", color: "#E53935" },
  "to-png": { label: "PDF a PNG", color: "#8E24AA" },
  "word-to-pdf": { label: "Word a PDF", color: "#2B579A" },
  "img-to-pdf": { label: "Imagen a PDF", color: "#E53935" },
  "word": { label: "Word a PDF", color: "#2B579A" },
  "excel": { label: "Excel a PDF", color: "#217346" },
  "ppt": { label: "PowerPoint a PDF", color: "#D24726" },
  "jpg": { label: "JPG a PDF", color: "#F4B400" },
  "png": { label: "PNG a PDF", color: "#E5322D" },
  "html": { label: "HTML a PDF", color: "#E34F26" },
  "txt": { label: "TXT a PDF", color: "#757575" },
};

// SECCION PRINCIPAL DE LA PANTALLA
// Función ConvertScreen: Pantalla dinámica que muta según la herramienta
export default function ConvertScreen() {
  // Bloque de configuración dinámica
  // Extraemos la variable "type" de la URL para saber a qué herramienta entró el usuario
  const { type } = useLocalSearchParams<{ type: string }>();
  // Buscamos el tipo en nuestro diccionario de colores y si no existe le clavamos uno gris por defecto
  const config = TYPE_MAP[type || "to-word"] || {
    label: "Convertir",
    color: "#555",
  };

  // Bloque de desestructuración del hook
  // Sacamos todo nuestro arsenal de variables y funciones
  const {
    file,
    processing,
    completed,
    resultUri,
    pickDocument,
    processConversion,
    shareFile,
    setFile,
    setCompleted,
  } = usePdfConversion();

  // FUNCION: handleProcess
  // Esta función es un intermediario que traduce el tipo de herramienta amigable a los códigos raros que espera la API
  function handleProcess() {
    // Por defecto asumimos que vamos a convertir HASTA un pdf
    let destinationType = "pdf";

    // Pero si resulta que el usuario quiere lo contrario aquí hacemos el ajuste a las extensiones raras
    if (type === "to-word") destinationType = "doc";
    else if (type === "to-excel") destinationType = "xls";
    else if (type === "to-jpg") destinationType = "jpg";
    else if (type === "to-png") destinationType = "png";
    // Y si es de la banda de los que van hacia PDF reconfirmamos que es PDF
    else if (
      type === "word" ||
      type === "excel" ||
      type === "ppt" ||
      type === "jpg" ||
      type === "png" ||
      type === "html" ||
      type === "txt" ||
      type === "word-to-pdf" ||
      type === "img-to-pdf"
    ) {
      destinationType = "pdf";
    }

    // Ya con el código correcto le decimos a nuestro hook que mande el archivo
    processConversion(destinationType);
  }

  // Bloque de renderizado
  // Devolvemos el esqueleto de la aplicación
  return (
    // Contenedor grandote
    <View style={styles.container}>
      {/* Ajustamos el título y el color de la barra usando nuestro diccionario dinámico */}
      <Stack.Screen
        options={{ headerTitle: config.label, headerTintColor: config.color }}
      />

      {/* Contenido centrado */}
      <View style={styles.content}>
        {/* Bloque condicional inicial */}
        {/* Si no hay archivo mostramos la caja de subir */}
        {!file ? (
          // Botón gigante pintado con el color dinámico de la herramienta
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: config.color }]}
            onPress={() => pickDocument(type)}
          >
            {/* Ícono de nubecita con color dinámico */}
            <UploadCloud size={64} color={config.color} />
            <Text style={[styles.uploadText, { color: config.color }]}>
              Seleccionar Archivo
            </Text>
          </TouchableOpacity>
        ) : (
          // Bloque del documento ya seleccionado
          // Pantalla secundaria donde se ve el archivo
          <View style={styles.fileContainer}>
            {/* Tarjetita con la info del archivo */}
            <View style={styles.fileInfoBox}>
              <FileType
                size={48}
                color={config.color}
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
            </View>

            {/* Bloque condicional final */}
            {/* Si ya terminó la conversión mostramos otra tarjeta feliz */}
            {completed ? (
              <View style={styles.fileInfoBox}>
                <CheckCircle size={48} color="#34A853" />
                <Text
                  style={[
                    styles.fileName,
                    { color: "#34A853", fontSize: 16, marginTop: 8 },
                  ]}
                >
                  ¡Convertido con Éxito!
                </Text>
                {/* Botón para compartir o guardar con el color original de la herramienta */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: config.color }]}
                  onPress={shareFile}
                >
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>
                    Compartir / Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Si todavía no está listo le ponemos el botón de transformar
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: config.color }]}
                onPress={handleProcess}
                disabled={processing}
              >
                {/* Si estamos trabajando mostramos ruedita si no el botón con ícono de flechitas circulares */}
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <RefreshCw color="#fff" size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.actionButtonText}>Convertir Archivo</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Bloque de limpiar */}
            {/* Botón discreto para arrepentirse */}
            {!processing && (
              <TouchableOpacity
                onPress={() => {
                  setFile(null);
                  setCompleted(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancelar y elegir otro</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si borras el diccionario TYPE_MAP? pasa que la pantalla no sabrá cómo pintarse ni qué título ponerse haciendo que toda la interfaz se vuelva gris y diga "Convertir" en lugar del nombre real de la herramienta confundiendo al usuario
// para solucionarlo debes regresar el objeto constante TYPE_MAP completo con todas sus claves
// ¿qué pasa si quitas la función handleProcess y le mandas directo el tipo al hook? pasa que el servidor explotará recibiendo cosas como "to-word" en lugar del código "doc" que en realidad espera provocando fallos en la conversión
// para solucionarlo vuelve a escribir el router condicional que traduce los tipos amistosos a las extensiones de archivo formales
