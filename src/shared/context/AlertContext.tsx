// SECCION DE IMPORTACIONES
// React y las herramientas para crear contextos globales
import React, { createContext, useContext, useState, ReactNode } from 'react';
// Los componentes nativos que necesitamos para pintar la ventana emergente
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
// Animaciones de aparición y desaparición suaves y con rebote
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
// El fondo degradado oscuro de la alerta
import { LinearGradient } from 'expo-linear-gradient';
// Los colores del tema de la app
import { Colors } from '@/shared/theme/theme';
// Los cuatro iconos de los cuatro estados de alerta
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react-native';

// Sección: Sistema Global de Alertas con Modal animado de alta calidad visual
// Funciones: showAlert dispara una ventana emergente; hideAlert la cierra; getAlertConfig determina colores e iconos según el tipo

// TIPO: AlertType
// Los cuatro sabores de alerta que acepta el sistema
export type AlertType = 'success' | 'error' | 'warning' | 'info';

// INTERFAZ: AlertOptions
// La forma exacta de los datos que necesita cualquier alerta
interface AlertOptions {
  // El titular gordo de la alerta
  title: string;
  // El cuerpo explicativo
  message: string;
  // Y de qué color o icono queremos que sea
  type?: AlertType;
}

// INTERFAZ: AlertContextType
// El contrato que define qué funciones expone el contexto hacia afuera
interface AlertContextType {
  // Para abrir la alerta desde cualquier pantalla
  showAlert: (title: string, message: string, type?: AlertType) => void;
  // Para cerrarla programáticamente si es necesario
  hideAlert: () => void;
}

// Creamos el contexto vacío que llenaremos cuando envolvamosnuestra app con el provider
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// FUNCION: useCustomAlert
// El hook que cualquier pantalla puede usar para mandar alertas sin importar dónde esté
export const useCustomAlert = () => {
  // Intentamos obtener el contexto
  const context = useContext(AlertContext);
  // Si alguien lo usa fuera del provider explota con un mensaje claro
  if (!context) {
    throw new Error('useCustomAlert debe usarse dentro de un AlertProvider');
  }
  // Si todo está bien devolvemos el contexto con las dos funciones
  return context;
};

// FUNCION: AlertProvider
// El proveedor que envuelve toda la app y mantiene el estado de la alerta activa
export const AlertProvider = ({ children }: { children: ReactNode }) => {
  // Estado que controla si la ventana está visible o escondida
  const [visible, setVisible] = useState(false);
  // Estado que guarda los datos de la alerta actual
  const [alertData, setAlertData] = useState<AlertOptions>({
    title: '',
    message: '',
    // Por defecto es info (azul cian)
    type: 'info',
  });

  // FUNCION: showAlert
  // Guarda los datos de la alerta y la hace visible
  const showAlert = (title: string, message: string, type: AlertType = 'info') => {
    // Actualizamos el contenido
    setAlertData({ title, message, type });
    // Y encendemos la bandera de visible
    setVisible(true);
  };

  // FUNCION: hideAlert
  // Apaga la ventana de alerta
  const hideAlert = () => {
    setVisible(false);
  };

  // FUNCION: getAlertConfig
  // Dado el tipo de alerta devuelve el color y el icono correspondiente
  const getAlertConfig = (type: AlertType) => {
    switch (type) {
      case 'error':
        return { color: '#EF4444', icon: <AlertCircle color="#EF4444" size={40} /> }; // Rojo
      case 'success':
        return { color: '#10B981', icon: <CheckCircle2 color="#10B981" size={40} /> }; // Verde
      case 'warning':
        return { color: '#F59E0B', icon: <AlertTriangle color="#F59E0B" size={40} /> }; // Amarillo
      case 'info':
      default:
        return { color: Colors.dark.tint, icon: <Info color={Colors.dark.tint} size={40} /> }; // Cian Neón
    }
  };

  // Calculamos la configuración visual para la alerta actualmente mostrada
  const config = getAlertConfig(alertData.type || 'info');

  return (
    // Le pasamos las dos funciones a todos los hijos de la app
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {/* Los hijos son toda la app excepto la propia alerta */}
      {children}

      {/* El Modal flota sobre toda la interfaz cuando está visible */}
      <Modal
        visible={visible}
        // Fondo transparente para que veamos nuestro propio overlay oscuro
        transparent
        // Sin animación nativa porque la manejamos nosotros con Reanimated
        animationType="none"
        // Para que el modal tape también la barra de estado del celular
        statusBarTranslucent
      >
        {/* La capa oscura de fondo que se desvanece suavemente */}
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={styles.overlay}
        >
          {/* La caja de la alerta que salta con rebote de resorte */}
          <Animated.View
            entering={ZoomIn.duration(400).springify()}
            exiting={ZoomOut.duration(300)}
            // El borde cambia de color según el tipo de alerta
            style={[styles.alertBox, { borderColor: config.color }]}
          >
            {/* El fondo degradado oscuro de la tarjeta de alerta */}
            <LinearGradient
              colors={['rgba(15, 23, 42, 0.95)', 'rgba(2, 6, 23, 0.98)']}
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
            />

            {/* Glow sutil basado en el tipo */}
            {/* El brillo de color que emana del borde de la tarjeta */}
            <View style={[styles.glow, { shadowColor: config.color }]} />

            {/* El icono grande de la alerta */}
            <View style={styles.iconContainer}>
              {config.icon}
            </View>

            {/* El título gordo de la alerta */}
            <Text style={styles.title}>{alertData.title}</Text>
            {/* El mensaje explicativo en gris claro */}
            <Text style={styles.message}>{alertData.message}</Text>

            {/* El botón de aceptar que cierra la ventana */}
            <TouchableOpacity
              // El fondo del botón también cambia según el tipo de alerta
              style={[styles.button, { backgroundColor: config.color }]}
              onPress={hideAlert}
            >
              <Text style={styles.buttonText}>Aceptar</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </AlertContext.Provider>
  );
};

// SECCION DE ESTILOS
const styles = StyleSheet.create({
  // El fondo oscuro semitransparente que cubre toda la pantalla
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo difuminado oscuro
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  // La tarjeta de la alerta con bordes redondeados y sombra
  alertBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  // El efecto de brillo de color alrededor de la tarjeta
  glow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    borderRadius: 20,
  },
  // El contenedor que centra el icono con espacio inferior
  iconContainer: {
    marginBottom: 16,
    // zIndex para que quede por encima del gradiente de fondo
    zIndex: 1,
  },
  // El título de la alerta en blanco y negritas
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
    zIndex: 1,
  },
  // El mensaje de la alerta en gris claro
  message: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    zIndex: 1,
  },
  // El botón de cerrar con su color dinámico
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  // El texto oscuro del botón para que contraste con el color vivo del fondo
  buttonText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas showAlert del contexto? pasa que cada pantalla que intente llamar a showAlert obtendrá un error de que la función es undefined y toda la app dejará de mostrar alertas de éxito, error o advertencia
// para solucionarlo debes volver a agregar la función que actualiza alertData con los nuevos datos y llama setVisible(true)
// ¿qué pasa si quitas getAlertConfig? pasa que el sistema de alertas no sabrá qué icono ni qué color usar para cada tipo y probablemente quede todo undefined tirando errores de renderizado
// para solucionarlo debes volver a implementar el switch con los cuatro casos que mapean cada AlertType a su respectivo color hexadecimal y componente de icono
