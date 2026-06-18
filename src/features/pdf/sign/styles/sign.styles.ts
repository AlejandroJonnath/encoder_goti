// SECCION DE IMPORTACIONES
// Importamos la maquinita de coser de react native para nuestros trajes de colores
import { StyleSheet } from "react-native";

// SECCION DE EXPORTACION DE ESTILOS
// FUNCION: StyleSheet.create
// Armamos nuestro diccionario gigantesco de ropa visual para la pantalla
export default StyleSheet.create({
  // Gris perla de fondo clásico de apps modernas que lo abarca todo
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  // Bloque para estirar el cuerpo hasta que ocupe todo lo alto posible y se centre
  content: {
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },
  // Caja grande punteada que suplica que le avientes tu archivo
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
  // Título gordo para invitar a subir
  uploadText: { fontSize: 18, fontWeight: "bold", marginTop: 16 },
  // Letra flaca para calmar la ansiedad
  uploadSubtext: { fontSize: 12, color: "#888", marginTop: 8 },
  // Cajón maestro donde echas los archivos y los centra
  fileContainer: { width: "100%", alignItems: "center" },
  // Papelito blanco flotante con sombra para que destaque qué subiste
  fileInfoBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
  },
  // Tu nombre de archivo en negritas
  fileName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  // Ese minicuadrito visual que se ve abajo
  previewImage: {
    width: 100,
    height: 80,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
  },
  // Titulitos de posición intermedios
  posTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  // Bloque grid para que las cosas se alineen bien
  posGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  // Botones secundarios redonditos y claritos
  posButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  // Cuando picas el botón lo volvemos amarilloso
  posButtonActive: { backgroundColor: "#fff5d7", borderColor: "#FBBC05" },
  // La letra original de botón inactivo
  posButtonText: { fontSize: 12, color: "#666", fontWeight: "500" },
  // Letras doradas potentes cuando está activo el botón
  posButtonTextActive: { color: "#d99a00", fontWeight: "bold" },
  // Estilo base para el botonazo inferior de mandar a procesar
  actionButton: {
    width: "100%",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  // Letras blancas gruesas
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  // Espaciado para el botón aburrido de arrepentirse
  cancelButton: { marginTop: 16, padding: 8 },
  // La letra triste del botón de arrepentirse
  cancelText: { color: "#888", fontSize: 14 },
  // Caja de festejo centrada que abarca todo
  completedBox: { alignItems: "center", width: "100%" },
  // Letras verdes potentes de que saliste triunfador
  completedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34A853",
    marginVertical: 16,
  },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la propiedad flexWrap: "wrap" de posGrid? pasa que tus botones de posiciones van a intentar seguir de largo horizontalmente y se van a salir de la pantalla arruinando toda tu hermosa cuadrícula
// para solucionarlo debes volver a pegarle la propiedad wrap para decirle al celular que cuando ya no quepa, salte al renglón de abajo
// ¿qué pasa si borras la propiedad minHeight: "100%" en content? pasa que en celulares muy altos el contenido se colapsará en el medio dejando huecos espantosos grises en los bordes superior e inferior
// para solucionarlo deberás volver a asignarle el mínimo de 100% de alto para que el cascarón se estire y abrace toda la pantalla
