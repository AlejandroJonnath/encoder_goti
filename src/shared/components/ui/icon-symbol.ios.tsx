import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

// Sección: Este archivo proporciona acceso nativo y directo a la inmensa librería de íconos oficiales de Apple (SF Symbols) exclusivamente cuando la app corre en un dispositivo iOS

// Funciones: IconSymbol sirve para dibujar íconos de Apple con soporte para pesos de trazo y animaciones nativas sin importar fuentes ni imágenes extra

// Exportamos nuestro componente personalizado
export function IconSymbol({
  // El nombre oficial del ícono en la app de SF Symbols de Mac
  name,
  // Por defecto el tamaño de la caja será 24
  size = 24,
  // El color que queremos aplicarle
  color,
  // Estilos adicionales
  style,
  // El grosor del trazo que por defecto es regular
  weight = 'regular',
}: {
  // Tipos para asegurar que no pasamos un nombre inventado
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Retornamos el componente oficial proporcionado por Expo para SF Symbols
  return (
    <SymbolView
      // Le inyectamos el grosor
      weight={weight}
      // Lo coloreamos
      tintColor={color}
      // Hacemos que se acomode manteniendo sus proporciones sin deformarse
      resizeMode="scaleAspectFit"
      // El nombre del ícono
      name={name}
      // Inyectamos el tamaño forzando el ancho y alto a que sean iguales
      style={[
        {
          width: size,
          height: size,
        },
        // Y añadimos los extras
        style,
      ]}
    />
  );
}

// si quitas IconSymbol pasa que los usuarios de iPhone se quedarán sin los íconos del sistema y se mostrarán errores o cuadros vacíos donde debería haber imágenes
