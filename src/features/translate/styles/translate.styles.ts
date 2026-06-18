// SECCION DE IMPORTACIONES
// La herramienta maestra de estilos de React Native
import { StyleSheet } from "react-native";

// Sección: Estilos de la pantalla del Traductor de PDFs

// FUNCION: StyleSheet.create
// Diccionario de estilos para que la pantalla de traducción se vea pro
export default StyleSheet.create({
  // Fondo gris perla que cubre toda la pantalla
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  // El contenedor del estado inicial (sin archivo) que centra el botón grande
  centerContent: { flex: 1, padding: 24, justifyContent: "center" },
  // El contenedor del scroll cuando ya hay archivo que centra los elementos
  scrollContent: { padding: 24, alignItems: "center" },
  // La caja punteada grande de subida con fondo blanco
  uploadBox: {
    width: "100%",
    height: 250,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  // El texto grande y en negritas centrado de invitación
  uploadText: { fontSize: 20, fontWeight: "bold", marginTop: 16, textAlign: "center" },
  // El subtexto gris de la zona de subida
  uploadSubtext: { fontSize: 14, color: "#666", marginTop: 8 },
  // La tarjetita flotante blanca que muestra el nombre del archivo
  fileInfoBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    elevation: 1,
  },
  // El nombre del archivo en negritas oscuro centrado
  fileName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  // El botón gordo de acción principal
  actionButton: {
    width: "100%",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  // Texto blanco del botón principal
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  // La caja de carga centrada verticalmente
  loadingBox: { alignItems: "center", marginVertical: 32 },
  // El texto azul que aparece mientras carga
  loadingText: { marginTop: 16, color: "#0EA5E9", fontWeight: "bold", textAlign: "center" },
  // El texto gris pequeño de paciencia
  loadingSubtext: { marginTop: 8, color: "#666", fontSize: 14, textAlign: "center" },
  // La caja blanca con borde azul que contiene el resultado de la traducción
  resultBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    // Borde azul cielo para que se note que es la sección de resultado
    borderColor: "#0EA5E9",
    marginBottom: 24,
  },
  // El título del resultado en azul cielo negritas
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0EA5E9",
    marginBottom: 12,
  },
  // El texto de la traducción en gris oscuro con interlineado cómodo
  resultText: { fontSize: 14, color: "#333", lineHeight: 22 },
  // El botón fantasma de cancelar con solo padding
  cancelButton: { marginTop: 16, padding: 8 },
  // La letra gris apagada para el botón de cancelar
  cancelText: { color: "#888", fontSize: 14 },
  
  // Language selectors
  // El contenedor de cada selector de idioma con margen inferior
  langSelectorContainer: {
    width: "100%",
    marginBottom: 24,
  },
  // La etiqueta del selector en negritas oscuras
  langLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  // La parrilla flexible de pastillas de idioma
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    // Los botones se separan justamente para llenar el ancho
    justifyContent: "space-between",
  },
  // Cada pastillita de idioma inactiva en azul claro suave
  langChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E0F2FE", // light blue
    marginBottom: 10,
    // Cada pastillita ocupa casi la mitad del ancho para hacer dos columnas
    width: "48%",
    alignItems: "center",
  },
  // Cuando el idioma está seleccionado la pastillita se pone azul sólido
  langChipActive: {
    backgroundColor: "#0EA5E9", // solid blue
  },
  // El texto azul oscuro del idioma no seleccionado
  langChipText: {
    color: "#0284C7",
    fontWeight: "600",
  },
  // El texto blanco del idioma seleccionado para que se lea sobre el azul sólido
  langChipTextActive: {
    color: "#FFF",
    fontWeight: "bold",
  },
  // La fila de los dos botones de acción final (copiar y exportar)
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  // Cada uno de los dos botones mitad que caben lado a lado
  halfButton: {
    width: "48%",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
  },
  // El texto blanco dentro de los botones mitad con margen izquierdo para separarlo del icono
  halfButtonText: {
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "bold",
    marginLeft: 8
  }
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas langChipActive? pasa que el usuario no podrá saber visualmente qué idioma tiene seleccionado porque todas las pastillas se verán iguales en azul claro y no habrá diferenciación
// para solucionarlo vuelve a agregar el estilo con fondo azul sólido "#0EA5E9" y asignárselo condicionalmente a la pastilla activa
// ¿qué pasa si quitas la propiedad flexWrap del langGrid? pasa que los botones de idioma intentarán acomodarse en una sola fila y los últimos se saldrán de la pantalla o se comprimirán hasta quedar ilegibles
// para solucionarlo vuelve a agregar flexWrap: "wrap" para que React Native los baje al siguiente renglón cuando no quepan en el ancho disponible
