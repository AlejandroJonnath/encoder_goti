import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// Sección: Este archivo configura y arranca la conexión principal entre nuestra aplicación y la base de datos de Supabase además de crear un sistema para guardar credenciales de forma segura y partida en pedazos (chunks) por limitaciones de memoria del celular

// Funciones: getItem sirve para sacar un valor seguro del almacenamiento del celular (incluso si está partido en varios pedazos)
// Funciones: setItem sirve para guardar algo en el celular de forma segura (y partirlo en pedazos si es que el texto es demasiado largo para el sistema)
// Funciones: removeItem sirve para borrar algo del almacenamiento del celular eliminando también todas sus partes si estaba particionado

// Definimos el tamaño máximo de caracteres que podemos guardar de golpe en el celular (SecureStore tiene límites de peso)
const CHUNK_SIZE = 2000;

// Creamos un adaptador personalizado que le enseñará a Supabase cómo guardar cosas en el teléfono sin que se rompa por exceder la memoria
const ChunkedSecureStoreAdapter = {
  // Función para obtener información guardada
  getItem: async (key: string) => {
    // Usamos try para no crashear la app si algo falla al leer
    try {
      // Primero preguntamos si el archivo está partido viendo si existe una variable que nos diga cuántos pedazos hay
      const chunksCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
      // Si la variable no existe significa que el archivo es pequeño y no se partió
      if (!chunksCountStr) {
        // En ese caso simplemente lo devolvemos completo y ya
        return await SecureStore.getItemAsync(key);
      }
      // Si sí estaba partido entonces convertimos el texto de la cantidad a un número matemático
      const chunksCount = parseInt(chunksCountStr, 10);
      // Preparamos una variable vacía donde iremos pegando los pedacitos
      let fullValue = '';
      // Hacemos un bucle que corra tantas veces como pedazos tengamos
      for (let i = 0; i < chunksCount; i++) {
        // Vamos al almacenamiento y sacamos el pedacito número I
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
        // Si el pedacito existe lo pegamos al valor total
        if (chunk) fullValue += chunk;
      }
      // Cuando termina el bucle devolvemos la pieza completa y rearmada
      return fullValue;
    // Si hay un error en el disco del celular
    } catch (e) {
      // Devolvemos nulo para fingir que no hay sesión y evitar que la app explote
      return null;
    }
  },
  // Función para guardar información de la sesión
  setItem: async (key: string, value: string) => {
    // Empezamos intento seguro
    try {
      // Revisamos si la longitud del texto a guardar es menor a nuestro límite de seguridad
      if (value.length < CHUNK_SIZE) {
        // Si cabe borramos por si acaso había pedazos viejos con ese nombre
        await SecureStore.deleteItemAsync(`${key}_chunks`);
        // Y lo guardamos completo en una sola pieza
        await SecureStore.setItemAsync(key, value);
        // Terminamos y salimos
        return;
      }
      // Si el texto es gigantesco (como un token de sesión inmenso) calculamos en cuántos pedazos hay que partirlo
      const chunksCount = Math.ceil(value.length / CHUNK_SIZE);
      // Guardamos primero cuántos pedazos van a ser para saber cómo armarlo luego
      await SecureStore.setItemAsync(`${key}_chunks`, chunksCount.toString());
      // Empezamos a picar el texto con un bucle
      for (let i = 0; i < chunksCount; i++) {
        // Agarramos la rebanada exacta del texto que corresponde a esta vuelta
        const chunk = value.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        // Guardamos el pedacito poniéndole un número de índice
        await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk);
      }
    // Si algo sale mal al guardar
    } catch (e) {
      // Mandamos el error a la consola de desarrolladores
      console.error('ChunkedSecureStoreAdapter setItem error', e);
    }
  },
  // Función para borrar datos (útil cuando cerramos sesión)
  removeItem: async (key: string) => {
    // Abrimos bloque a prueba de errores
    try {
      // Averiguamos primero si la información estaba partida en pedazos
      const chunksCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
      // Si descubrimos que sí estaba partida
      if (chunksCountStr) {
        // Convertimos el número a tipo entero
        const chunksCount = parseInt(chunksCountStr, 10);
        // Hacemos un bucle para ir borrando cada pedacito individual del teléfono
        for (let i = 0; i < chunksCount; i++) {
          // Destruimos el pedazo de esa vuelta
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
        // Cuando borramos todos los pedacitos borramos también la variable que nos decía cuántos pedacitos había
        await SecureStore.deleteItemAsync(`${key}_chunks`);
      // Si no estaba partido y era un texto normal
      } else {
        // Borramos la clave directamente del teléfono de un plumazo
        await SecureStore.deleteItemAsync(key);
      }
    // En caso de fallas al borrar
    } catch (e) {
      // Registramos el problema en consola
      console.error('ChunkedSecureStoreAdapter removeItem error', e);
    }
  },
};

// Extraemos la dirección maestra de nuestra base de datos en Supabase desde las variables secretas
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
// Extraemos la llave anónima de la base de datos (esta es pública y sirve para que la app se comunique)
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Finalmente creamos nuestro cliente o conexión oficial a Supabase y lo exportamos
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Le pasamos algunas configuraciones especiales de autenticación
  auth: {
    // Le decimos que para guardar la sesión use nuestro sistema especial de pedazos (ChunkedSecureStoreAdapter) en lugar del guardado normal que falla
    storage: ChunkedSecureStoreAdapter as any,
    // Le ordenamos que refresque el token de sesión automáticamente cuando se esté venciendo
    autoRefreshToken: true,
    // Le pedimos que la sesión se quede guardada aunque cerremos la aplicación
    persistSession: true,
    // Le decimos que no intente detectar sesiones por la URL web porque estamos en una app móvil nativa
    detectSessionInUrl: false,
  },
});

// si quitas getItem pasa que Supabase olvidará mágicamente quién eres cada vez que cierres y abras la aplicación porque no podrá leer tus llaves guardadas
// si quitas setItem pasa que al iniciar sesión la app chocará contra el límite de memoria del teléfono los tokens gigantes no se guardarán y no podrás entrar a tu cuenta
// si quitas removeItem pasa que cuando intentes cerrar sesión en la app los datos basura se quedarán guardados en el disco de tu teléfono para siempre
