// SECCION DE IMPORTACIONES
// Importamos la herramienta StyleSheet desde react-native para poder crear nuestros estilos como si estuviéramos usando CSS pero adaptado a móviles
import { StyleSheet } from "react-native";

// SECCION DE EXPORTACION DE ESTILOS
// FUNCION: StyleSheet.create
// Exportamos por defecto el objeto de estilos creado para que cualquier pantalla pueda importarlo y aplicarlo a sus componentes
export default StyleSheet.create({
  // Bloque del contenedor principal
  // Este estilo hace que la pantalla ocupe todo el espacio disponible y le pone un color de fondo gris súper clarito casi blanco
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  
  // Bloque para centrar contenido
  // Este estilo se usa cuando queremos que todo esté perfectamente centrado en la pantalla dándole un margen interno de 24 puntos
  centerContent: { flex: 1, padding: 24, justifyContent: "center" },
  
  // Bloque para contenido con scroll
  // Este estilo se usa dentro de las listas o vistas deslizables para alinear los elementos al centro y darles espacio alrededor
  scrollContent: { padding: 24, alignItems: "center" },
  
  // Bloque de la caja de subida
  // Diseñamos el recuadro gigante donde el usuario debe tocar para subir su archivo dándole bordes punteados como un cupón recortable
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
  
  // Bloque del texto de subida
  // Estilo para las letras que van adentro de la caja punteada haciéndolas grandes negritas y con un pequeño margen arriba
  uploadText: { fontSize: 20, fontWeight: "bold", marginTop: 16 },
  
  // Bloque de la cajita de información
  // Creamos el diseño para el recuadro que muestra el nombre del archivo seleccionado poniéndole fondo blanco y un poquito de sombra sutil
  fileInfoBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    elevation: 1,
  },
  
  // Bloque del nombre del archivo
  // Estilo para el texto que muestra exactamente cómo se llama el archivo usando letras grises oscuras centradas y en negrita
  fileName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  
  // Bloque del botón de acción
  // Diseñamos el botón principal que manda a procesar el PDF dándole un tamaño que ocupe todo el ancho y redondeando las esquinas
  actionButton: {
    width: "100%",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  
  // Bloque del texto del botón
  // Le ponemos color blanco a las letras del botón principal y las hacemos grandes y gruesas para que llamen la atención
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  
  // Bloque del recuadro de carga
  // Estilo para centrar la ruedita de carga o los mensajes de "espere por favor" dándoles un buen margen vertical
  loadingBox: { alignItems: "center", marginVertical: 32 },
  
  // Bloque del texto de carga
  // Pintamos de morado el texto que acompaña a la ruedita de carga y le ponemos negritas para que combine con la app
  loadingText: { marginTop: 16, color: "#9C27B0", fontWeight: "bold" },
  
  // Bloque de la caja del resumen
  // Diseñamos el recuadro final donde aparece todo el texto que nos devuelve la inteligencia artificial poniéndole un borde morado bonito
  summaryBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#9C27B0",
    marginBottom: 24,
  },
  
  // Bloque del título del resumen
  // Estilo para la palabra principal que encabeza el resumen pintándola de morado haciéndola más grande y dándole margen abajo
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9C27B0",
    marginBottom: 12,
  },
  
  // Bloque del cuerpo del resumen
  // Configuramos el texto largo que nos dio la IA dándole un gris oscuro y un espacio entre líneas para que sea fácil de leer
  summaryText: { fontSize: 14, color: "#333", lineHeight: 22 },
  
  // Bloque del botón de cancelar
  // Diseñamos un botoncito más pequeño y discreto para cuando el usuario quiere arrepentirse o borrar el archivo actual
  cancelButton: { marginTop: 16, padding: 8 },
  
  // Bloque del texto de cancelar
  // Pintamos el texto de cancelar de un color gris tenue para que no compita visualmente con el botón principal
  cancelText: { color: "#888", fontSize: 14 },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la exportación de StyleSheet.create? pasa que la pantalla se quedará sin diseño y todos los elementos aparecerán amontonados y feos como un documento de texto plano
// para solucionarlo debes volver a envolver todos tus estilos dentro del StyleSheet.create y exportarlo
// ¿qué pasa si borras el estilo uploadBox? pasa que la caja punteada donde el usuario debe subir su PDF desaparecerá visualmente dificultando que el usuario entienda dónde debe tocar
// para solucionarlo vuelve a escribir el bloque uploadBox con su borderStyle dashed y su ancho del 100%
// ¿qué pasa si borras el estilo actionButton? pasa que el botón principal perderá todo su padding y color de fondo volviéndose invisible o muy difícil de presionar con el dedo
// para solucionarlo restaura el actionButton asegurándote de ponerle su flexDirection y su padding adecuado
