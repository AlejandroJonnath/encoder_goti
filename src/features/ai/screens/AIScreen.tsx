// SECCION DE IMPORTACIONES
// Importamos Stack de expo-router para poder configurar cómo se ve la barra superior de navegación en esta pantalla
import { Stack } from "expo-router";
// Importamos unos íconos bien bonitos de lucide-react-native para decorar los botones y hacer la interfaz más amigable
import { BrainCircuit, FileText, UploadCloud } from "lucide-react-native";
// Importamos React porque es la librería principal que usamos para construir todas las interfaces de usuario
import React from "react";
// Importamos varios componentes visuales nativos de React Native como textos, cajas, vistas deslables y rueditas de carga
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
// Importamos nuestro gancho personalizado useAIProcessing que tiene toda la inteligencia para procesar el PDF
import { useAIProcessing } from "@/features/ai/hooks/useAIProcessing";
// Importamos los estilos que ya creamos en otro archivo para dejar esta pantalla bien presentable
import styles from "@/features/ai/styles/ai.styles";

// SECCION PRINCIPAL DE LA PANTALLA
// FUNCION: AIScreen
// Este es el componente principal que dibuja la pantalla completa de la Herramienta de Resumen con Inteligencia Artificial
export default function AIScreen() {
  // Bloque de desestructuración
  // Sacamos todas las variables y funciones útiles de nuestro hook personalizado para usarlas directamente en los botones y textos
  const {
    file,
    processing,
    summary,
    pickDocument,
    processSummary,
    setFile,
    setSummary,
  } = useAIProcessing();

  // Bloque de renderizado
  // Aquí empezamos a armar el Lego devolviendo los componentes visuales que verá el usuario en su teléfono
  return (
    // Envolvemos toda la pantalla en un contenedor principal que ocupa todo el espacio
    <View style={styles.container}>
      {/* Configuramos la barrita de arriba cambiándole el título y pintándola de morado para que quede temática */}
      <Stack.Screen
        options={{
          headerTitle: "Resumen IA (Gemini)",
          headerTintColor: "#9C27B0",
        }}
      />

      {/* Bloque condicional inicial */}
      {/* Revisamos si el usuario todavía no ha elegido ningún archivo para mostrarle la pantalla inicial gigante de subida */}
      {!file ? (
        // Centramos todo el contenido vertical y horizontalmente para que el botón de subir quede en el medio
        <View style={styles.centerContent}>
          {/* Creamos un botón gigante con bordes punteados que reacciona cuando el usuario lo toca y ejecuta la función pickDocument */}
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: "#9C27B0" }]}
            onPress={pickDocument}
          >
            {/* Dibujamos un ícono de una nube subiendo un archivo y lo pintamos de morado */}
            <UploadCloud size={64} color="#9C27B0" />
            {/* Le decimos al usuario claramente qué es lo que tiene que hacer con un texto grande */}
            <Text style={[styles.uploadText, { color: "#9C27B0" }]}>
              Selecciona un PDF a resumir
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Bloque condicional secundario
        // Si el usuario ya eligió un archivo entonces cambiamos la vista a un scroll por si el resumen es muy largo
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Bloque de información del archivo */}
          {/* Mostramos una cajita blanca con el ícono de un documento y el nombre real del archivo que el usuario eligió */}
          <View style={styles.fileInfoBox}>
            <FileText size={32} color="#9C27B0" style={{ marginBottom: 8 }} />
            <Text style={styles.fileName}>{file.name}</Text>
          </View>

          {/* Bloque de botón de generar resumen */}
          {/* Si todavía no tenemos un resumen y tampoco estamos procesando mostramos el botón para mandar la orden a la IA */}
          {!summary && !processing && (
            // Este botón morado gigante ejecuta la función processSummary cuando el usuario lo toca
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#9C27B0" }]}
              onPress={processSummary}
            >
              {/* Le ponemos un ícono de un cerebro electrónico al lado del texto para que se vea muy pro */}
              <BrainCircuit color="#fff" size={24} style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>
                Generar Resumen Inteligente
              </Text>
            </TouchableOpacity>
          )}

          {/* Bloque de estado de carga */}
          {/* Si la app está pensando o enviando datos a la nube mostramos esta sección y escondemos el botón */}
          {processing && (
            <View style={styles.loadingBox}>
              {/* Ponemos la clásica ruedita morada girando para que el usuario sepa que no se ha trabado */}
              <ActivityIndicator color="#9C27B0" size="large" />
              <Text style={styles.loadingText}>
                La IA está leyendo y analizando...
              </Text>
            </View>
          )}

          {/* Bloque de resultados finales */}
          {/* Una vez que la IA nos devuelve el resumen mostramos esta cajita especial con todo el texto adentro */}
          {summary && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Resumen Generado:</Text>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          )}

          {/* Bloque de botón para limpiar */}
          {/* Siempre que no estemos procesando le damos la opción al usuario de borrar todo y empezar de cero eligiendo otro archivo */}
          {!processing && (
            // Este botoncito discreto simplemente borra el archivo y el resumen del estado local
            <TouchableOpacity
              onPress={() => {
                setFile(null);
                setSummary(null);
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Elegir otro documento</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la constante { file, processing... } = useAIProcessing()? pasa que la pantalla se quedará sin cerebro y React lanzará un error fatal porque intentará usar variables indefinidas en los botones y textos
// para solucionarlo debes volver a invocar el hook y extraer sus variables al inicio del componente
// ¿qué pasa si quitas el componente TouchableOpacity del uploadBox? pasa que la caja gigante de subir archivo ya no será presionable y el usuario no podrá elegir ningún documento quedándose estancado en la pantalla inicial
// para solucionarlo envuelve nuevamente la vista con TouchableOpacity y ponle su evento onPress
// ¿qué pasa si borras la condición !file ? ( ... ) : ( ... )? pasa que la pantalla se romperá intentando leer propiedades de un archivo nulo o mostrará botones que no tienen sentido en ese momento
// para solucionarlo debes mantener la lógica condicional ternaria separando la pantalla de subida de la pantalla de resultados
