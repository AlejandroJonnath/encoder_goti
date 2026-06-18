// SECCION DE IMPORTACIONES
// Stack nos permite configurar el título de la barra superior
import { Stack } from "expo-router";
// Traemos los iconos que usamos en los botones
import { Languages, FileText, UploadCloud, Copy, Download } from "lucide-react-native";
// Importamos React porque JSX lo necesita
import React from "react";
// Todas las piezas de lego nativas de React Native que usaremos para pintar la pantalla
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
// Traemos la lógica y la lista de idiomas del hook especializado
import { useTranslation, LANGUAGES } from "../hooks/useTranslation";
// Los estilos visuales de esta pantalla
import styles from "../styles/translate.styles";

// Sección: Pantalla principal del Traductor de PDFs con IA

// FUNCION: TranslateScreen
// Muestra el flujo completo de selección, configuración de idiomas y resultado de la traducción
export default function TranslateScreen() {
  // Extraemos todo lo que el hook nos ofrece
  const {
    file,
    processing,
    processingStep,
    translatedText,
    sourceLang,
    targetLang,
    pickDocument,
    processTranslation,
    setFile,
    setSourceLang,
    setTargetLang,
    copyToClipboard,
    exportAsPdf,
    setTranslatedText,
    displayTranslatedText
  } = useTranslation();

  return (
    // Contenedor principal con fondo gris de la hoja de estilos
    <View style={styles.container}>
      {/* La barra de título con el nombre de la sección en azul cielo */}
      <Stack.Screen
        options={{
          headerTitle: "Traductor PDF",
          headerTintColor: "#0EA5E9",
        }}
      />

      {/* BIFURCACIÓN: si no hay archivo elegido mostramos la pantalla de inicio */}
      {!file ? (
        <View style={styles.centerContent}>
          {/* El botón grande punteado para elegir un PDF */}
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: "#0EA5E9" }]}
            onPress={pickDocument}
          >
            {/* La nube con flechas de subida en azul cielo */}
            <UploadCloud size={64} color="#0EA5E9" />
            {/* El texto principal de invitación */}
            <Text style={[styles.uploadText, { color: "#0EA5E9" }]}>
              Selecciona un PDF a traducir
            </Text>
            {/* El subtexto explicativo más pequeñito */}
            <Text style={styles.uploadSubtext}>
              Extraeremos el texto y lo traduciremos fielmente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Si ya hay archivo cargado mostramos todo el panel de configuración
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* La tarjetita que muestra qué archivo seleccionó el usuario */}
          <View style={styles.fileInfoBox}>
            {/* El icono de documento */}
            <FileText size={32} color="#0EA5E9" style={{ marginBottom: 8 }} />
            {/* El nombre del archivo */}
            <Text style={styles.fileName}>{file.name}</Text>
          </View>

          {/* Zona de configuración de idiomas que solo se ve si no está procesando ni hay resultado */}
          {!translatedText && !processing && (
            <View style={{ width: '100%' }}>
              {/* Selector de idioma de origen */}
              <View style={styles.langSelectorContainer}>
                <Text style={styles.langLabel}>Traducir del:</Text>
                {/* Mapeamos la lista de idiomas para crear una pastillita por cada uno */}
                <View style={styles.langGrid}>
                  {LANGUAGES.map(lang => (
                    <TouchableOpacity 
                      // La clave es única combinando source y el id del idioma
                      key={`source-${lang.id}`}
                      // Si este idioma es el seleccionado le ponemos el estilo activo azul sólido
                      style={[styles.langChip, sourceLang === lang.id && styles.langChipActive]}
                      // Al tocar cambiamos el idioma de origen
                      onPress={() => setSourceLang(lang.id)}
                    >
                      <Text style={[styles.langChipText, sourceLang === lang.id && styles.langChipTextActive]}>
                        {lang.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Selector de idioma destino, igual al anterior pero independiente */}
              <View style={styles.langSelectorContainer}>
                <Text style={styles.langLabel}>Al idioma:</Text>
                <View style={styles.langGrid}>
                  {LANGUAGES.map(lang => (
                    <TouchableOpacity 
                      key={`target-${lang.id}`}
                      style={[styles.langChip, targetLang === lang.id && styles.langChipActive]}
                      onPress={() => setTargetLang(lang.id)}
                    >
                      <Text style={[styles.langChipText, targetLang === lang.id && styles.langChipTextActive]}>
                        {lang.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* El botón grande azul que dispara todo el proceso */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#0EA5E9" }]}
                onPress={processTranslation}
              >
                {/* Icono de idiomas cruzados */}
                <Languages color="#fff" size={24} style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>
                  Traducir Documento
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Solo aparece mientras el sistema está procesando la traducción */}
          {processing && (
            <View style={styles.loadingBox}>
              {/* La ruedita azul giratoria de carga */}
              <ActivityIndicator color="#0EA5E9" size="large" />
              {/* El mensaje de estado que va cambiando entre las etapas */}
              <Text style={styles.loadingText}>
                {processingStep || "Procesando..."}
              </Text>
              {/* Mensaje adicional de paciencia */}
              <Text style={styles.loadingSubtext}>
                Esto puede tomar un momento dependiendo del tamaño del archivo.
              </Text>
            </View>
          )}

          {/* Solo aparece cuando tenemos la traducción lista y ya terminamos de procesar */}
          {translatedText && !processing && (
            <View style={{ width: '100%' }}>
              {/* La caja blanca con borde azul donde se muestra el texto traducido */}
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>Traducción exitosa:</Text>
                {/* Mostramos el texto limpio ya sin etiquetas HTML */}
                <Text style={styles.resultText}>{displayTranslatedText}</Text>
              </View>
              
              {/* Los dos botones de acción lado a lado */}
              <View style={styles.buttonRow}>
                {/* Botón para copiar el texto al portapapeles */}
                <TouchableOpacity style={styles.halfButton} onPress={copyToClipboard}>
                  <Copy color="#fff" size={20} />
                  <Text style={styles.halfButtonText}>Copiar texto</Text>
                </TouchableOpacity>

                {/* Botón para exportar la traducción como PDF lindo */}
                <TouchableOpacity style={styles.halfButton} onPress={exportAsPdf}>
                  <Download color="#fff" size={20} />
                  <Text style={styles.halfButtonText}>Exportar PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* El enlace discreto para empezar de nuevo con otro documento */}
          {!processing && (
            <TouchableOpacity
              onPress={() => {
                // Borramos el archivo actual
                setFile(null);
                // Y la traducción
                setTranslatedText(null);
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Elegir otro documento</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas el bloque {!translatedText && !processing && (...)} que contiene los selectores de idioma? pasa que el usuario nunca podrá escoger qué idioma usar y el proceso siempre irá de español a inglés sin que nadie lo sepa ni pueda cambiarlo
// para solucionarlo debes volver a renderizar condicionalmente los dos selectores de idioma con sus respectivos LANGUAGES.map y los onPress conectados a setSourceLang y setTargetLang
// ¿qué pasa si quitas el bloque {processing && (...)}? pasa que cuando el proceso tarde varios segundos el usuario verá la pantalla congelada sin ninguna indicación de qué está pasando y creerá que la app se colgó
// para solucionarlo vuelve a pintar la ActivityIndicator y el processingStep condicionalmente mientras processing sea verdadero
