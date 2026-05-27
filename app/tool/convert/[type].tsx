import { Stack, useLocalSearchParams } from "expo-router";
import {
  CheckCircle,
  Download,
  FileType,
  RefreshCw,
  UploadCloud,
} from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useConvertLogic } from "../../../logic/useConvertLogic";
import styles from "../../../styles/convert.styles";

// Sección: Pantalla de Conversión Dinámica de PDF
// (Actúa como un controlador único para manejar transformaciones desde y hacia PDF dependiendo del parámetro de ruta que recibe)

// (Mapeo constante que define colores y nombres amigables según el tipo de conversión solicitada en la URL)
const TYPE_MAP: Record<string, { label: string; color: string }> = {
  // (Conversión a documento de Word)
  "to-word": { label: "PDF a Word", color: "#2B579A" },
  // (Conversión a hoja de cálculo de Excel)
  "to-excel": { label: "PDF a Excel", color: "#217346" },
  // (Conversión a imagen JPG)
  "to-jpg": { label: "PDF a JPG", color: "#E53935" },
  // (Conversión a imagen PNG)
  "to-png": { label: "PDF a PNG", color: "#8E24AA" },
  // (Conversión desde Word hacia PDF)
  "word-to-pdf": { label: "Word a PDF", color: "#2B579A" },
  // (Conversión desde imagen hacia PDF)
  "img-to-pdf": { label: "Imagen a PDF", color: "#E53935" },
  // (Conversión hacia PDF desde la pantalla principal)
  "word": { label: "Word a PDF", color: "#2B579A" },
  "excel": { label: "Excel a PDF", color: "#217346" },
  "ppt": { label: "PowerPoint a PDF", color: "#D24726" },
  "jpg": { label: "JPG a PDF", color: "#F4B400" },
  "png": { label: "PNG a PDF", color: "#E5322D" },
  "html": { label: "HTML a PDF", color: "#E34F26" },
  "txt": { label: "TXT a PDF", color: "#757575" },
};

// Función ConvertScreen: Pantalla dinámica que muta según la herramienta
// (Lee el parámetro de ruta adapta sus colores textos y peticiones a la API según lo que el usuario quiere convertir)
export default function ConvertScreen() {
  // (Extrae el parámetro dinámico type de la URL o ruta de expo-router)
  const { type } = useLocalSearchParams<{ type: string }>();
  // (Obtiene la configuración específica para ese tipo de la constante superior o pone valores por defecto si no existe)
  const config = TYPE_MAP[type || "to-word"] || {
    label: "Convertir",
    color: "#555",
  };

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
  } = useConvertLogic();

  function handleProcess() {
    let destinationType = "pdf"; // Default to pdf for the to-pdf conversions
    
    if (type === "to-word") destinationType = "doc";
    else if (type === "to-excel") destinationType = "xls";
    else if (type === "to-jpg") destinationType = "jpg";
    else if (type === "to-png") destinationType = "png";
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
    
    processConversion(destinationType);
  }

  return (
    <View style={styles.container}>
      {/* (Título y color de navegación que cambian dinámicamente según la conversión) */}
      <Stack.Screen
        options={{ headerTitle: config.label, headerTintColor: config.color }}
      />

      {/* (Caja de centrado general) */}
      <View style={styles.content}>
        {/* (Si no se ha seleccionado nada aún muestra el cuadrado de subida principal) */}
        {!file ? (
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: config.color }]}
            onPress={() => pickDocument(type)}
          >
            {/* (Icono de subida con color dinámico) */}
            <UploadCloud size={64} color={config.color} />
            {/* (Texto incitando a la selección dinámica) */}
            <Text style={[styles.uploadText, { color: config.color }]}>
              Seleccionar Archivo
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileContainer}>
            {/* (Tarjeta blanca flotante con la info del archivo) */}
            <View style={styles.fileInfoBox}>
              {/* (Icono de archivo genérico que usa el color de la herramienta actual) */}
              <FileType
                size={48}
                color={config.color}
                style={{ marginBottom: 12 }}
              />
              {/* (Nombre del archivo acortado a una línea) */}
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
            </View>

            {/* (Si el flujo se completó y tenemos resultado) */}
            {completed ? (
              <View style={styles.fileInfoBox}>
                {/* (Paloma verde de ok) */}
                <CheckCircle size={48} color="#34A853" />
                {/* (Texto dinámico que menciona hacia qué se convirtió) */}
                <Text
                  style={[
                    styles.fileName,
                    { color: "#34A853", fontSize: 16, marginTop: 8 },
                  ]}
                >
                  ¡Convertido con Éxito!
                </Text>
                {/* (Botón que usa el color dinámico para activar el compartir) */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: config.color },
                  ]}
                  onPress={shareFile}
                >
                  {/* (Iconito de descarga) */}
                  <Download color="#fff" size={24} style={{ marginRight: 8 }} />
                  {/* (Texto blanco) */}
                  <Text style={styles.actionButtonText}>
                    Compartir / Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: config.color }]}
                onPress={handleProcess}
                disabled={processing}
              >
                {/* (Muestra una rueda giratoria nativa si procesa o un icono dinámico con texto si no) */}
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {/* (Iconito de actualización rotar) */}
                    <RefreshCw
                      color="#fff"
                      size={20}
                      style={{ marginRight: 8 }}
                    />
                    {/* (Texto estático Convertir Archivo) */}
                    <Text style={styles.actionButtonText}>
                      Convertir Archivo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* (Si la app no está ocupada ofrece forma de cancelar todo) */}
            {!processing && (
              <TouchableOpacity
                onPress={() => {
                  setFile(null);
                  setCompleted(false);
                }}
                style={styles.cancelButton}
              >
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

// si quitas la función ConvertScreen se rompen 6 herramientas completas a la vez (word a pdf, pdf a excel, pdf a imagen, etc)
// si quitas la constante TYPE_MAP la pantalla no sabrá cómo colorearse o qué título poner perdiendo toda adaptación visual
// si quitas la función pickDocument no se podrán elegir archivos limitados a los que tengan la extensión que permite cada conversión
// si quitas la función processConversion no se conectará con la API y el archivo solo quedará ahí elegido sin hacer nada
// si quitas la función shareFile el archivo nuevo en excel o jpg quedará escondido en el almacenamiento temporal de la app sin que el usuario lo vea
