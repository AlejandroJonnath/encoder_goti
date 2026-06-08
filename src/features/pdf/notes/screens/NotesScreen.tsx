import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { StickyNote, File, Download, CheckCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export default function NotesScreen() {
  const [file, setFile] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [pageNumber, setPageNumber] = useState('1');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      setFile(result);
      setResultUrl(null);
    } catch (err) {
      console.error(err);
    }
  };

  const processNotes = async () => {
    if (!file || file.canceled) {
      Alert.alert('Error', 'Selecciona un PDF primero.');
      return;
    }
    if (!noteText.trim()) {
      Alert.alert('Error', 'Ingresa el texto de la nota.');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.x:3000';
      const asset = file.assets[0];
      
      const formData = new FormData();
      formData.append("pdf", {
        uri: asset.uri,
        name: asset.name,
        type: "application/pdf"
      } as any);
      formData.append("noteText", noteText);
      formData.append("pageNumber", pageNumber || '1');
      
      const response = await fetch(`${apiUrl}/api/notes`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Error al procesar');
      }
      const data = await response.json();
      
      setResultUrl(data.url);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const shareFile = async () => {
    if (!resultUrl) return;
    try {
      const downloadRes = await downloadAsync(
        resultUrl,
        documentDirectory + `noted_document_${Date.now()}.pdf`
      );
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadRes.uri);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: 'Añadir Notas PDF', headerTintColor: '#FBBF24' }} />
      
      <View style={styles.content}>
        {!file || file.canceled ? (
          <TouchableOpacity style={[styles.uploadBox, { borderColor: '#FBBF24' }]} onPress={pickDocument}>
            <StickyNote size={64} color="#FBBF24" style={{ marginBottom: 16 }} />
            <Text style={[styles.uploadText, { color: '#FBBF24' }]}>Selecciona el PDF a anotar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileContainer}>
            <View style={styles.fileInfoBox}>
              <File size={48} color="#FBBF24" />
              <Text style={styles.fileName}>{file.assets[0].name}</Text>
            </View>

            {resultUrl ? (
              <View style={styles.completedBox}>
                <CheckCircle size={48} color="#FBBF24" />
                <Text style={styles.completedText}>¡Nota añadida con éxito!</Text>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FBBF24' }]} onPress={shareFile}>
                  <Download color="#000" size={24} style={{ marginRight: 8 }} />
                  <Text style={[styles.actionButtonText, { color: '#000' }]}>Descargar PDF</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Escribe tu nota aquí..."
                  placeholderTextColor="#64748b"
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                />
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Número de página (ej: 1)"
                  placeholderTextColor="#64748b"
                  value={pageNumber}
                  onChangeText={setPageNumber}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FBBF24' }]} onPress={processNotes} disabled={loading}>
                  {loading ? <ActivityIndicator color="#000" /> : <Text style={[styles.actionButtonText, { color: '#000' }]}>Añadir Nota</Text>}
                </TouchableOpacity>
              </View>
            )}

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  uploadBox: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: 20, padding: 40,
    alignItems: 'center', backgroundColor: '#1e293b'
  },
  uploadText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  fileContainer: { alignItems: 'center', width: '100%' },
  fileInfoBox: {
    backgroundColor: '#1e293b', padding: 24, borderRadius: 16, width: '100%',
    alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#334155'
  },
  fileName: { color: '#f8fafc', fontSize: 16, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  formContainer: { width: '100%' },
  input: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 16, color: '#f8fafc',
    marginBottom: 12, borderWidth: 1, borderColor: '#334155', height: 100, textAlignVertical: 'top'
  },
  inputSmall: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 16, color: '#f8fafc',
    marginBottom: 24, borderWidth: 1, borderColor: '#334155'
  },
  actionButton: {
    padding: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', width: '100%'
  },
  actionButtonText: { fontSize: 18, fontWeight: 'bold' },
  completedBox: { alignItems: 'center', width: '100%', marginBottom: 24 },
  completedText: { color: '#FBBF24', fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 24 },
  cancelButton: { marginTop: 24 },
  cancelText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' }
});
