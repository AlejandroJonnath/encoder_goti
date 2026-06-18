// SECCION DE IMPORTACIONES
// La herramienta de estilos de React Native
import { StyleSheet } from "react-native";

// Sección: Estilos genéricos compartidos para cualquier pantalla de herramienta de la app

// FUNCION: StyleSheet.create
// Hoja de estilos base reutilizable; si la quitas todas las ToolScreen se verán sin estilos
export default StyleSheet.create({
  // Fondo gris muy claro que cubre toda la pantalla de la herramienta
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  // El área de contenido con padding y centrado tanto horizontal como vertical
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  // La caja punteada grande donde el usuario arrastra o toca para subir su archivo
  uploadBox: {
    width: "100%",
    height: 300,
    borderWidth: 2,
    // El borde punteado que da el aspecto de zona de drop
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  // El texto grande en negritas dentro de la caja de subida
  uploadText: { fontSize: 20, fontWeight: "bold", marginTop: 16 },
  // El texto secundario más pequeño en gris
  uploadSubtext: { fontSize: 14, color: "#888", marginTop: 8 },
  // El contenedor que agrupa la info del archivo seleccionado
  fileContainer: { width: "100%", alignItems: "center" },
  // La tarjetita blanca con sombra que muestra el nombre e icono del archivo
  fileInfoBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    // Sombra sutil para que la tarjeta se vea flotando
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // El nombre del archivo en negritas oscuras centrado con separación superior
  fileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    textAlign: "center",
  },
  // El tamaño del archivo en gris pequeñito debajo del nombre
  fileSize: { fontSize: 14, color: "#888", marginTop: 4 },
  // El botón de acción principal ancho con icono y texto en fila
  actionButton: {
    width: "100%",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  // El texto blanco del botón de acción
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  // El botón de cancelar discreto con solo padding vertical
  cancelButton: { marginTop: 16, padding: 8 },
  // El texto gris apagado del botón de cancelar
  cancelText: { color: "#888", fontSize: 14 },
  // La caja que se muestra cuando el proceso terminó exitosamente
  completedBox: { alignItems: "center", width: "100%" },
  // El texto verde de confirmación de éxito
  completedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34A853",
    marginVertical: 16,
  },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas uploadBox? pasa que la zona de subida de archivos no tendrá aspecto visual de área interactiva y el usuario no sabrá dónde tocar para seleccionar su archivo
// para solucionarlo vuelve a definir el objeto uploadBox con su borde punteado y el tamaño de 300 de altura
// ¿qué pasa si quitas completedBox y completedText? pasa que cuando el proceso termina la pantalla no mostrará ninguna confirmación visual verde y el usuario creerá que nada pasó aunque todo haya salido bien
// para solucionarlo vuelve a agregar los estilos de la caja de completado centrada y el texto en color verde "#34A853"
