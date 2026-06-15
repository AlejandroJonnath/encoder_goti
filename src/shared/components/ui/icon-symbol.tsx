// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Sección: Este archivo es el plan de rescate que dibuja íconos de Google Material Design en Android y en navegadores web ya que ahí no existen los íconos nativos de Apple (SF Symbols)

// Funciones: IconSymbol sirve como un traductor universal que agarra los nombres de los íconos de Apple y los cambia por sus equivalentes más parecidos de Google para que la app se vea bien en Android

// Definimos el tipo de nuestro diccionario de traducción
type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
// Obtenemos solo los nombres de los íconos de Apple que hayamos configurado aquí
type IconSymbolName = keyof typeof MAPPING;

// MAPPING es nuestro diccionario manual para traducir los nombres de los íconos
const MAPPING = {
  // Cuando iOS pida "house.fill" en Android mostraremos "home"
  'house.fill': 'home',
  // Cuando iOS pida un avioncito de papel aquí usamos "send"
  'paperplane.fill': 'send',
  // Cuando iOS pida los corchetes de código aquí llamamos "code"
  'chevron.left.forwardslash.chevron.right': 'code',
  // Flechita a la derecha se llama "chevron-right"
  'chevron.right': 'chevron-right',
} as IconMapping;

// Exportamos nuestro componente universal
export function IconSymbol({
  // Extraemos las propiedades que nos pasan
  name,
  // Tamaño por defecto
  size = 24,
  // Color o material opaco
  color,
  // Estilo adicional
  style,
}: {
  // Tipado
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // Renderizamos el ícono vectorial pero traduciendo el nombre en tiempo real a través del MAPPING
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}

// si quitas IconSymbol pasa que tu aplicación explotará inmediatamente cuando alguien intente abrirla en Android o en Chrome porque intentarán cargar archivos visuales de iOS que no existen en esos sistemas
