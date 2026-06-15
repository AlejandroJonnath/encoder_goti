import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Minimize, Merge, PenTool, BrainCircuit, FileImage, Type, Table, Presentation, FileCode, StickyNote } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors } from '@/shared/theme/theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48 - 16) / 2;

type Tool = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
};

type Category = {
  title: string;
  data: Tool[];
};

const categories: Category[] = [
  {
    title: 'Convertir a PDF',
    data: [
      { id: 'word2pdf', title: 'Word a PDF', description: 'Convierte .doc o .docx', icon: <FileText color="#fff" size={32} />, color: '#3B82F6', route: '/tool/convert/word' }, // Azul neón
      { id: 'excel2pdf', title: 'Excel a PDF', description: 'Convierte .xls o .xlsx', icon: <Table color="#fff" size={32} />, color: '#10B981', route: '/tool/convert/excel' }, // Verde esmeralda
      { id: 'ppt2pdf', title: 'PowerPoint a PDF', description: 'Convierte .ppt o .pptx', icon: <Presentation color="#fff" size={32} />, color: '#F97316', route: '/tool/convert/ppt' }, // Naranja vibrante
      { id: 'jpg2pdf', title: 'JPG a PDF', description: 'Convierte imágenes JPG', icon: <FileImage color="#fff" size={32} />, color: '#EAB308', route: '/tool/convert/jpg' }, // Amarillo ámbar
      { id: 'png2pdf', title: 'PNG a PDF', description: 'Convierte imágenes PNG', icon: <FileImage color="#fff" size={32} />, color: '#EF4444', route: '/tool/convert/png' }, // Rojo neón
      { id: 'html2pdf', title: 'HTML a PDF', description: 'Páginas web a PDF', icon: <FileCode color="#fff" size={32} />, color: '#F97316', route: '/tool/convert/html' },
      { id: 'txt2pdf', title: 'TXT a PDF', description: 'Texto plano a PDF', icon: <Type color="#fff" size={32} />, color: '#94A3B8', route: '/tool/convert/txt' },
    ]
  },
  {
    title: 'Herramientas PDF',
    data: [
      { id: 'compress', title: 'Comprimir PDF', description: 'Reduce el tamaño', icon: <Minimize color="#fff" size={32} />, color: '#10B981', route: '/tool/compress' },
      { id: 'merge', title: 'Unir PDF', description: 'Junta varios PDFs', icon: <Merge color="#fff" size={32} />, color: '#3B82F6', route: '/tool/merge' },
      { id: 'sign', title: 'Firmar PDF', description: 'Añade tu firma', icon: <PenTool color="#fff" size={32} />, color: '#F59E0B', route: '/tool/sign' },
      { id: 'notes', title: 'Añadir Notas', description: 'Notas en tu PDF', icon: <StickyNote color="#fff" size={32} />, color: '#FBBF24', route: '/tool/notes' },
    ]
  },
  {
    title: 'Inteligencia Artificial',
    data: [
      { id: 'ai', title: 'Resumen IA', description: 'Extrae puntos clave', icon: <BrainCircuit color="#fff" size={32} />, color: '#D946EF', route: '/tool/ai' },
    ]
  }
];

export default function HomeScreen() {
  const router = useRouter();

  let globalCardIndex = 0; // Para el efecto escalonado general

  return (
    <LinearGradient
      colors={['#0F172A', '#020617']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        {/* Cabecera Animada */}
        <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.header}>
          <Text style={styles.logo}>Encoder<Text style={styles.logoBold}>Goti</Text></Text>
          <Text style={styles.subtitle}>CONVIERTE, COMPRIME, FIRMA Y UNE EN UNA SOLA APP </Text>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {categories.map((category, catIndex) => (
            <Animated.View
              key={catIndex}
              entering={FadeInRight.duration(800).delay(catIndex * 200).springify()}
              style={styles.categoryContainer}
            >
              <Text style={styles.categoryTitle}>{category.title}</Text>

              <View style={styles.grid}>
                {category.data.map((tool) => {
                  const currentDelay = globalCardIndex * 100;
                  globalCardIndex++;

                  return (
                    <Animated.View
                      key={tool.id}
                      entering={FadeInDown.duration(600).delay(currentDelay).springify()}
                    >
                      <TouchableOpacity
                        style={[styles.card, { borderColor: tool.color }]}
                        activeOpacity={0.7}
                        onPress={() => router.push(tool.route as any)}
                      >
                        {/* Glow effect sutil simulado con box shadow del color respectivo */}
                        <View style={[styles.glowEffect, { shadowColor: tool.color }]} />

                        <LinearGradient
                          colors={[tool.color, '#00000000']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                          style={[StyleSheet.absoluteFill, { opacity: 0.1 }]}
                        />

                        <View style={[styles.iconContainer, { backgroundColor: tool.color, shadowColor: tool.color }]}>
                          {tool.icon}
                        </View>

                        <Text style={styles.cardTitle}>{tool.title}</Text>
                        <Text style={styles.cardDescription}>{tool.description}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  logo: {
    fontSize: 32,
    color: '#FFF',
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
  },
  logoBold: {
    color: Colors.dark.tint,
    fontWeight: '900',
    textShadowColor: Colors.dark.tint,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    letterSpacing: 2,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Espacio extra para la tab bar flotante
  },
  categoryContainer: {
    marginBottom: 40,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 20,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: cardWidth,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderTopWidth: 2, // Acento superior
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
});
