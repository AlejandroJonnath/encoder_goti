import { Stack } from "expo-router";
import { Languages, FileText, UploadCloud, Copy, Download } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTranslation, LANGUAGES } from "../hooks/useTranslation";
import styles from "../styles/translate.styles";

export default function TranslateScreen() {
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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Traductor PDF",
          headerTintColor: "#0EA5E9",
        }}
      />

      {!file ? (
        <View style={styles.centerContent}>
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: "#0EA5E9" }]}
            onPress={pickDocument}
          >
            <UploadCloud size={64} color="#0EA5E9" />
            <Text style={[styles.uploadText, { color: "#0EA5E9" }]}>
              Selecciona un PDF a traducir
            </Text>
            <Text style={styles.uploadSubtext}>
              Extraeremos el texto y lo traduciremos fielmente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.fileInfoBox}>
            <FileText size={32} color="#0EA5E9" style={{ marginBottom: 8 }} />
            <Text style={styles.fileName}>{file.name}</Text>
          </View>

          {!translatedText && !processing && (
            <View style={{ width: '100%' }}>
              <View style={styles.langSelectorContainer}>
                <Text style={styles.langLabel}>Traducir del:</Text>
                <View style={styles.langGrid}>
                  {LANGUAGES.map(lang => (
                    <TouchableOpacity 
                      key={`source-${lang.id}`}
                      style={[styles.langChip, sourceLang === lang.id && styles.langChipActive]}
                      onPress={() => setSourceLang(lang.id)}
                    >
                      <Text style={[styles.langChipText, sourceLang === lang.id && styles.langChipTextActive]}>
                        {lang.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

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

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#0EA5E9" }]}
                onPress={processTranslation}
              >
                <Languages color="#fff" size={24} style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>
                  Traducir Documento
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {processing && (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#0EA5E9" size="large" />
              <Text style={styles.loadingText}>
                {processingStep || "Procesando..."}
              </Text>
              <Text style={styles.loadingSubtext}>
                Esto puede tomar un momento dependiendo del tamaño del archivo.
              </Text>
            </View>
          )}

          {translatedText && !processing && (
            <View style={{ width: '100%' }}>
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>Traducción exitosa:</Text>
                <Text style={styles.resultText}>{displayTranslatedText}</Text>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.halfButton} onPress={copyToClipboard}>
                  <Copy color="#fff" size={20} />
                  <Text style={styles.halfButtonText}>Copiar texto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.halfButton} onPress={exportAsPdf}>
                  <Download color="#fff" size={20} />
                  <Text style={styles.halfButtonText}>Exportar PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!processing && (
            <TouchableOpacity
              onPress={() => {
                setFile(null);
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
