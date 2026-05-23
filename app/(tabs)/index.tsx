import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Minimize, Merge, PenTool, BrainCircuit, FileImage, Type, Table, Presentation, FileCode } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Sección: Este archivo es la cara principal de tu aplicación una vez que el usuario inicia sesión. Es el catálogo que muestra todas las herramientas disponibles agrupadas en cuadritos ordenados

// Funciones: HomeScreen sirve como panel de control central. Lista las categorías (Conversión de PDFs, Manejo de PDF y la IA) y dibuja botones coloridos para que el usuario navegue hacia la herramienta que desea utilizar

// Sacamos el ancho total de la pantalla del celular que nos está corriendo
const { width } = Dimensions.get('window');
// Calculamos matemáticamente el ancho que debe tener cada cuadro para que quepan dos por fila considerando los márgenes
const cardWidth = (width - 48 - 16) / 2;

// Definimos la estructura de datos que representa una herramienta individual
type Tool = {
  // Identificador único
  id: string;
  // Nombre a mostrar
  title: string;
  // Pequeña descripción
  description: string;
  // Componente de ícono a renderizar
  icon: JSX.Element;
  // Color temático de la marca
  color: string;
  // Dirección de pantalla a la que viajará
  route: string;
};

// Definimos la estructura de las agrupaciones de herramientas
type Category = {
  // Título de la sección
  title: string;
  // Lista de herramientas adentro de esta sección
  data: Tool[];
};

// Creamos un diccionario masivo con todos nuestros botones preconfigurados
const categories: Category[] = [
  // Primera categoría: conversores a PDF
  {
    title: 'Convertir a PDF',
    data: [
      { id: 'word2pdf', title: 'Word a PDF', description: 'Convierte .doc o .docx', icon: <FileText color="#fff" size={32} />, color: '#2B579A', route: '/tool/convert/word' },
      { id: 'excel2pdf', title: 'Excel a PDF', description: 'Convierte .xls o .xlsx', icon: <Table color="#fff" size={32} />, color: '#217346', route: '/tool/convert/excel' },
      { id: 'ppt2pdf', title: 'PowerPoint a PDF', description: 'Convierte .ppt o .pptx', icon: <Presentation color="#fff" size={32} />, color: '#D24726', route: '/tool/convert/ppt' },
      { id: 'jpg2pdf', title: 'JPG a PDF', description: 'Convierte imágenes JPG', icon: <FileImage color="#fff" size={32} />, color: '#F4B400', route: '/tool/convert/jpg' },
      { id: 'png2pdf', title: 'PNG a PDF', description: 'Convierte imágenes PNG', icon: <FileImage color="#fff" size={32} />, color: '#E5322D', route: '/tool/convert/png' },
      { id: 'html2pdf', title: 'HTML a PDF', description: 'Páginas web a PDF', icon: <FileCode color="#fff" size={32} />, color: '#E34F26', route: '/tool/convert/html' },
      { id: 'txt2pdf', title: 'TXT a PDF', description: 'Texto plano a PDF', icon: <Type color="#fff" size={32} />, color: '#757575', route: '/tool/convert/txt' },
    ]
  },
  // Segunda categoría: modificaciones a PDFs existentes
  {
    title: 'Herramientas PDF',
    data: [
      { id: 'compress', title: 'Comprimir PDF', description: 'Reduce el tamaño', icon: <Minimize color="#fff" size={32} />, color: '#34A853', route: '/tool/compress' },
      { id: 'merge', title: 'Unir PDF', description: 'Junta varios PDFs', icon: <Merge color="#fff" size={32} />, color: '#4285F4', route: '/tool/merge' },
      { id: 'sign', title: 'Firmar PDF', description: 'Añade tu firma', icon: <PenTool color="#fff" size={32} />, color: '#FBBC05', route: '/tool/sign' },
    ]
  },
  // Tercera categoría: funciones avanzadas
  {
    title: 'Inteligencia Artificial',
    data: [
      { id: 'ai', title: 'Resumen IA', description: 'Extrae puntos clave', icon: <BrainCircuit color="#fff" size={32} />, color: '#9C27B0', route: '/tool/ai' },
    ]
  }
];

// Exportamos nuestra pantalla principal
export default function HomeScreen() {
  // Inicializamos el enrutador para que los botones nos puedan llevar de paseo
  const router = useRouter();

  // Empezamos a pintar la pantalla asegurando que respetamos el recorte de la cámara de los celulares nuevos
  return (
    <SafeAreaView style={styles.container}>
      {/* Caja blanca elegante de la cabecera */}
      <View style={styles.header}>
        {/* Título grandote combinando estilos */}
        <Text style={styles.logo}>Encoder <Text style={styles.logoBold}>Goti</Text></Text>
        {/* Subtítulo debajo del logo */}
        <Text style={styles.subtitle}>Herramientas profesionales para documentos.</Text>
      </View>

      {/* Zona donde el usuario puede arrastrar hacia abajo para ver el resto de herramientas */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Recorremos dinámicamente nuestra lista gigante de categorías */}
        {categories.map((category, catIndex) => (
          // Por cada categoría hacemos un bloque contenedor
          <View key={catIndex} style={styles.categoryContainer}>
            {/* Dibujamos el título de la categoría */}
            <Text style={styles.categoryTitle}>{category.title}</Text>
            {/* Contenedor que agrupará a todas las herramientas de esta sección en formato rejilla de 2 columnas */}
            <View style={styles.grid}>
              {/* Recorremos ahora las herramientas de esta categoría actual */}
              {category.data.map((tool) => (
                // Botón tocable que representa la herramienta
                <TouchableOpacity 
                  // Llave para que React no se pierda al renderizar listas
                  key={tool.id} 
                  // Combinamos los estilos normales con un borde dinámico superior del color propio de la herramienta
                  style={[styles.card, { borderTopColor: tool.color, borderTopWidth: 4 }]}
                  // Cuando alguien presione mandamos a llamar al router para que navegue a su ruta configurada
                  onPress={() => router.push(tool.route as any)}
                >
                  {/* Cuadrito pequeño centrado adentro con el fondo coloreado para guardar el ícono */}
                  <View style={[styles.iconContainer, { backgroundColor: tool.color }]}>
                    {/* Renderizamos la etiqueta de dibujo elegida */}
                    {tool.icon}
                  </View>
                  {/* Nombre cortito en negritas */}
                  <Text style={styles.cardTitle}>{tool.title}</Text>
                  {/* Letras chiquitas grises de explicación */}
                  <Text style={styles.cardDescription}>{tool.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Generamos todos nuestros estilos gráficos de la pantalla de catálogo
const styles = StyleSheet.create({
  // Fondo de toda la pantalla con un color muy clarito casi blanco
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Bloque blanco superior con línea divisoria fina
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  // Tamaño del logo principal
  logo: {
    fontSize: 24,
    color: '#333',
  },
  // Grosor remarcado del logo
  logoBold: {
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  // Detalle textual debajo del logo
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // Espaciado del interior del scroll para que no se vea pegado al fondo ni a los bordes
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  // Separación vertical gruesa entre las diferentes categorías de herramientas
  categoryContainer: {
    marginBottom: 32,
  },
  // Letra del título de la categoría
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  // Truco para formar un diseño en mosaico o cuadrícula usando filas que rompen la línea si ya no caben
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  // Tarjetas blancas elegantes (los botones principales)
  card: {
    // Le asignamos el ancho que calculamos al principio del archivo
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    // Le aplicamos una sombra elegante que simula relieve sobre el fondo
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // La elevación es el equivalente a las sombras pero exclusivo para Android
    elevation: 2,
    marginBottom: 8,
  },
  // Recuadro interior donde se dibuja el dibujito de cada función
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Letras del nombre de la herramienta
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  // Letras pequeñitas de la descripción
  cardDescription: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

// si quitas HomeScreen pasa que tu pantalla de inicio estará en blanco roto u oscurecida los usuarios no verán ningún menú y no podrán acceder a ninguna función como comprimir o usar inteligencia artificial
