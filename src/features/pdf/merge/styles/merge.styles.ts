// SECCION DE IMPORTACIONES
// Importamos StyleSheet de react native para poder darle cachet a los botones y cajas
import { StyleSheet } from "react-native";

// SECCION DE EXPORTACION DE ESTILOS
// FUNCION: StyleSheet.create
// Armamos el diccionario maestro de estilos
export default StyleSheet.create({
  // Bloque principal
  // El cascarón de fondo gris clarito con flex uno para abarcarlo todo
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  
  // Contenido centrado general con buen margen a los lados
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Bloque del cuadro de carga gigante
  // Es la típica caja punteada donde le picas para escoger archivos
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
  
  // Título gordo dentro del cuadro de carga
  uploadText: { fontSize: 20, fontWeight: "bold", marginTop: 16 },
  
  // Contenedor maestro para cuando ya seleccionaste archivos
  fileContainer: { width: "100%", flex: 1 },
  
  // Bloque de la tarjetita blanca grande que agrupa tu lista de archivos
  listContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  
  // Bloque para cada fila individual de archivo
  // Los organizamos en row para que queden de lado a lado y les metemos una raya divisoria debajo
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
  },
  
  // El nombre del archivo en gris oscurito que ocupa el espacio del medio gracias a flex 1
  fileName: { flex: 1, marginHorizontal: 12, fontSize: 16, color: "#333" },
  
  // Bloque del botón secreto para seguir agregando más archivos a la licuadora
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 8,
  },
  
  // El textito azul del botón de añadir
  addMoreText: { color: "#4285F4", fontWeight: "bold", marginLeft: 8 },
  
  // Bloque del botón principal de acción gigante de hasta abajo
  actionButton: {
    width: "100%",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  
  // Las letras blancas del botonsote
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  
  // Bloque del botón discreto de reinicio
  cancelButton: { marginTop: 16, padding: 8, alignItems: "center" },
  
  // Texto pálido para el botón de reinicio
  cancelText: { color: "#888", fontSize: 14 },
  
  // Caja agrupadora para el mensaje de triunfo
  completedBox: { alignItems: "center", width: "100%" },
  
  // Letras verdes de victoria
  completedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34A853",
    marginVertical: 16,
  },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si borras la propiedad flex: 1 del estilo fileName? pasa que los textos largos de los archivos empujarán al bote de basura fuera de la pantalla de tu celular rompiendo el diseño y evitando que puedas borrarlos
// para solucionarlo debes volver a asignarle flex 1 para que entienda que solo puede tomar el espacio libre de en medio
// ¿qué pasa si quitas la propiedad borderBottomWidth del estilo fileRow? pasa que todos tus archivos en la lista se verán amontonados sin una raya divisoria que separe cada renglón lo cual hace confusa la lectura de la lista
// para solucionarlo vuelve a poner el ancho y el color del borde de abajo para crear esa rayita elegante
