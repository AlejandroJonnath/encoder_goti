// SECCION DE IMPORTACIONES
// React y el hook de estado local
import React, { useState } from 'react';
// Los componentes de construcción del modal
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  // Para que el teclado no tape el campo de texto en iOS y Android
  KeyboardAvoidingView,
} from 'react-native';
// La conexión a la base de datos Supabase
import { supabase } from '@/shared/services/supabase';
// El fondo degradado oscuro del modal
import { LinearGradient } from 'expo-linear-gradient';
// El icono de usuario
import { User } from 'lucide-react-native';
// La animación de entrada desde abajo con rebote
import Animated, { FadeInUp } from 'react-native-reanimated';

// Sección: Modal de Bienvenida para Completar el Perfil del Usuario (nombre de usuario único)
// Funciones: handleSave valida y guarda el nombre en Supabase verificando que no esté ya en uso

// INTERFAZ: Props
// Los tres datos que necesita el modal para funcionar
interface Props {
  // Si el modal debe estar visible o no
  visible: boolean;
  // El ID del usuario en Supabase para actualizar su perfil
  userId: string;
  // La función que la pantalla padre ejecuta cuando el nombre se guardó exitosamente
  onCompleted: (newName: string) => void;
}

// FUNCION: CompleteProfileModal
// El modal que aparece al primer inicio y obliga al usuario a escoger un nombre único antes de continuar
export function CompleteProfileModal({ visible, userId, onCompleted }: Props) {
  // El texto que el usuario va escribiendo en el campo
  const [fullName, setFullName] = useState('');
  // Si estamos esperando que Supabase responda
  const [saving, setSaving] = useState(false);
  // El mensaje de error que aparece debajo del campo si algo falla
  const [errorMsg, setErrorMsg] = useState('');

  // FUNCION: handleSave
  // Valida el nombre, verifica unicidad en la base de datos y actualiza el perfil
  const handleSave = async () => {
    // Quitamos los espacios sobrantes al principio y al final
    const trimmedName = fullName.trim();

    // Si el campo quedó vacío no dejamos avanzar
    if (!trimmedName) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }

    // 1) Debe empezar con una letra (incluye tildes y ñ)
    // Verificamos con regex que el nombre arranque con una letra real y no con un número o símbolo
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmedName)) {
      setErrorMsg('El nombre debe empezar con una letra.');
      return;
    }

    // Encendemos el indicador de guardado
    setSaving(true);
    // Limpiamos el mensaje de error anterior
    setErrorMsg('');

    // Zona de captura de errores de base de datos
    try {
      // 2) Verificar si el nombre ya existe en la base de datos
      // Preguntamos a Supabase si alguien más ya usa ese nombre exacto
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        // ilike es case-insensitive, así que "Juan" y "juan" son iguales
        .ilike('full_name', trimmedName)
        // maybeSingle devuelve el usuario si existe o null si no hay nadie con ese nombre
        .maybeSingle();

      // Si la consulta de verificación falló
      if (checkError) throw checkError;

      // Si encontramos a alguien con ese nombre
      if (existingUser) {
        // Le avisamos que ese nombre no está disponible
        setErrorMsg('No puedes poner este nombre de usuario. Ya está en uso.');
        // Apagamos el guardado y salimos
        setSaving(false);
        return;
      }

      // 3) Guardar el nuevo nombre
      // Actualizamos el registro del perfil del usuario en la base de datos
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: trimmedName })
        // Solo actualizamos el registro del usuario correcto usando su ID
        .eq('id', userId);

      // Si la actualización falló
      if (error) throw error;
      // Notificamos a la pantalla padre que todo salió bien y le pasamos el nombre nuevo
      onCompleted(trimmedName);
    // Si algo explotó en el proceso
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setErrorMsg('Hubo un error al guardar tu nombre. Intenta de nuevo.');
    } finally {
      // Siempre apagamos el indicador de guardado al terminar
      setSaving(false);
    }
  };

  return (
    // El Modal semitransparente con animación de fade
    <Modal visible={visible} animationType="fade" transparent>
      {/* KeyboardAvoidingView mueve el contenido hacia arriba cuando sale el teclado */}
      <KeyboardAvoidingView
        style={styles.overlay}
        // En iOS el comportamiento es diferente al de Android
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* El fondo oscuro degradado que cubre toda la pantalla detrás del modal */}
        <LinearGradient colors={['rgba(2,6,23,0.95)', 'rgba(15,23,42,0.98)']} style={StyleSheet.absoluteFill} />
        
        {/* La tarjeta central del modal que entra volando desde abajo */}
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.card}>
          {/* El círculo del icono de usuario con fondo morado tenue */}
          <View style={styles.iconWrap}>
            <User size={32} color="#8B5CF6" />
          </View>
          
          {/* El título de bienvenida */}
          <Text style={styles.title}>¡Bienvenido a EncoderGoti!</Text>
          {/* El subtexto que explica por qué hay que poner el nombre */}
          <Text style={styles.subtitle}>
            Para continuar, por favor ingresa tu nombre completo para configurar tu cuenta.
          </Text>

          {/* El contenedor del campo de texto con su etiqueta y mensaje de error */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre Completo</Text>
            {/* El campo de texto donde el usuario escribe su nombre */}
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor="#64748B"
              value={fullName}
              onChangeText={(t) => {
                // Actualizamos el nombre mientras escribe
                setFullName(t);
                // Y limpiamos el error anterior para que no confunda
                setErrorMsg('');
              }}
              // Capitaliza la primera letra de cada palabra automáticamente
              autoCapitalize="words"
            />
            {/* El mensaje de error que solo aparece si hay algo mal */}
            {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          </View>

          {/* El botón de guardar que se deshabilita si el campo está vacío */}
          <TouchableOpacity
            // Si el nombre está vacío el botón se ve apagado con la opacidad reducida
            style={[styles.saveBtn, !fullName.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            // Lo deshabilitamos mientras guarda o si no hay texto
            disabled={saving || !fullName.trim()}
          >
            {/* Si está guardando mostramos la ruedita, si no el texto del botón */}
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Guardar y Continuar</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// SECCION DE ESTILOS
const styles = StyleSheet.create({
  // El contenedor que cubre toda la pantalla y mueve el contenido con el teclado
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  // La tarjeta oscura del modal con borde morado sutil
  card: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    // Borde morado transparente al 30% para no ser tan agresivo
    borderColor: 'rgba(139, 92, 246, 0.3)',
    // Sombra morada suave para que la tarjeta flote
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  // El círculo morado donde vive el icono de usuario
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    // Fondo morado muy tenue al 15% de opacidad
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  // El título grande y en negritas en blanco
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  // El subtexto de instrucción en gris suave
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  // El contenedor que agrupa etiqueta, campo y error
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  // La etiqueta pequeña en mayúsculas sobre el campo
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // El campo de texto oscuro con borde sutil
  input: {
    width: '100%',
    // Fondo muy transparente blanco para el efecto de vidrio
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFF',
  },
  // El texto de error en rojo pequeño que aparece debajo del campo
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  // El botón morado activo de guardar
  saveBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // La versión desactivada del botón con morado a la mitad de opacidad
  saveBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  // El texto blanco del botón
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas handleSave? pasa que el botón de guardar no hará nada y el usuario no podrá nunca configurar su nombre ni avanzar más allá del modal de bienvenida
// para solucionarlo debes volver a implementar la función que valida con regex, consulta si el nombre existe con .ilike, y actualiza el perfil con .update en Supabase
// ¿qué pasa si quitas la verificación .ilike de nombre existente? pasa que varios usuarios podrán tener el mismo nombre sin ninguna restricción lo cual rompe la unicidad del sistema de perfiles
// para solucionarlo debes volver a agregar la consulta a la tabla profiles con .ilike('full_name', trimmedName) antes de intentar actualizar el registro
