// SECCION DE IMPORTACIONES
// Importamos el StyleSheet para organizar nuestros diseños en React Native
import { StyleSheet } from "react-native";

// SECCION DE EXPORTACION DE ESTILOS
// FUNCION: StyleSheet.create
// Exportamos nuestro objeto de estilos
export default StyleSheet.create({
  // Bloque general
  // Fondo de la pantalla con flex 1 para rellenar
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  // Contenido centrado y con espaciado lateral
  content: { padding: 24, alignItems: "center" },
  
  // Bloque de la caja punteada
  // Ese cuadro gigante inicial para subir archivos
  uploadBox: {
    width: "100%",
    height: 300,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  
  // Texto de carga grandote
  uploadText: { fontSize: 18, fontWeight: "bold" },
  
  // Contenedor interno alinear a la mitad
  fileContainer: { width: "100%", alignItems: "center" },
  
  // Bloque de la cajita de info
  // Tarjetita blanca elevada con sombras para mostrar el documento que elegimos
  fileInfoBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
  },
  
  // Texto del nombre de archivo
  fileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    textAlign: "center",
  },
  
  // Texto secundario
  fileSize: { fontSize: 14, color: "#888", marginTop: 4 },
  
  // Bloque del botón principal
  // Boton redondo donde le metemos texto e ícono
  actionButton: {
    width: "100%",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  
  // Letras del botón en blanco
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  
  // Bloque del botón cancelar
  cancelButton: { marginTop: 16, padding: 8 },
  
  // Texto discreto
  cancelText: { color: "#888", fontSize: 14 },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si borras la propiedad flexDirection: row del actionButton? pasa que el ícono y el texto del botón de procesar ya no estarán uno al lado del otro sino que se amontonarán verticalmente haciendo el botón gordo y feo
// para solucionarlo devuelve la dirección de flex a su valor original
// ¿qué pasa si quitas la propiedad backgroundColor del uploadBox? pasa que la caja será transparente y si cambias el color de fondo de la app esta caja se verá sucia
// para solucionarlo vuelve a forzar su color de fondo a blanco
