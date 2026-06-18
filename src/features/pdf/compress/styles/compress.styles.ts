// SECCION DE IMPORTACIONES
// Importamos StyleSheet de react-native para poder escribir las reglas de diseño como si fuera CSS
import { StyleSheet } from "react-native";

// SECCION DE EXPORTACION DE ESTILOS
// FUNCION: StyleSheet.create
// Exportamos todo este objeto mágico que pinta de colorcitos la aplicación
export default StyleSheet.create({
  // Bloque del contenedor general
  // Este es el padre de todos que ocupa todo el espacio gracias al flex 1 y le ponemos un color gris blanquecino de fondo
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  
  // Bloque del contenido
  // Le metemos un padding generoso para que las cajas no se peguen a los bordes de la pantalla del celular y centramos todo al medio
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Bloque de la caja de subida
  // Dibujamos ese recuadro grande punteado que sirve como blanco principal para que la gente le pique
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
  
  // Bloque del texto de la caja
  // Simplemente hacemos las letras más grandes y gordas
  uploadText: { fontSize: 20, fontWeight: "bold" },
  
  // Bloque del contenedor del archivo
  // Agrupador para que la información del PDF abarque de lado a lado alineándose siempre al medio
  fileContainer: { width: "100%", alignItems: "center" },
  
  // Bloque de la caja de información del archivo
  // Le ponemos un fondo blanco y un poquito de sombra sutil usando elevation para que parezca una tarjetita 3D
  fileInfoBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
  },
  
  // Bloque del nombre del archivo
  // El texto donde sale el .pdf se pone de color oscuro para que contraste bien fuerte contra el fondo blanco
  fileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    textAlign: "center",
  },
  
  // Bloque del peso del archivo
  // Al subtítulo que dice los megabytes le ponemos un gris más apagado para que no robe tanta atención
  fileSize: { fontSize: 14, color: "#888", marginTop: 4 },
  
  // Bloque del botón principal
  // Configuramos el botonsote de abajo para que sea redondito en las esquinas y meta sus letras e íconos en la misma fila horizontal
  actionButton: {
    width: "100%",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  
  // Bloque del texto del botón
  // Letras blancas gruesas para el botón principal
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  
  // Bloque del botón para cancelar
  // Un botón más discreto solo con un poquito de padding para no estorbar
  cancelButton: { marginTop: 16, padding: 8 },
  
  // Bloque del texto de cancelar
  // Texto chiquito y gris para la opción de arrepentirse
  cancelText: { color: "#888", fontSize: 14 },
  
  // Bloque de la caja completada
  // Cuando el PDF se exprime con éxito alineamos todos los textos de celebración usando este contenedor
  completedBox: { alignItems: "center", width: "100%" },
  
  // Bloque del texto de completado
  // Le ponemos color verde ecológico bien gordo para dar paz mental de que todo salió súper bien
  completedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34A853",
    marginVertical: 16,
  },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si borras el borderStyle dashed del uploadBox? pasa que la caja gigante perderá ese look de cupón recortable y se verá como un simple cuadro aburrido confundiendo a la gente sobre si es un botón o no
// para solucionarlo vuelve a poner borderStyle dashed y fíjate de tener un borderWidth asignado para que se vea
// ¿qué pasa si quitas la elevation 2 del fileInfoBox? pasa que en los teléfonos android la tarjeta perderá su sombreado elegante y se pegará visualmente al fondo quitando ese efecto de material design bonito
// para solucionarlo debes volver a poner la propiedad elevation para Android y acompañarla de las propiedades de shadowOffset si quieres que también se vea bien en iOS
