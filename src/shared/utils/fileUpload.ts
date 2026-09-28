/**
 * fileUpload.ts
 *
 * Utilidades para subir archivos desde React Native de forma compatible
 * con Expo SDK 57 / React Native 0.86+ (Hermes).
 *
 * PROBLEMA RESUELTO:
 *  - React Native 0.76+ con Hermes ya no acepta objetos planos { uri, name, type }
 *    directamente en FormData con fetch nativo → "Unsupported FormDataPart implementation"
 *  - expo-file-system uploadAsync no puede leer URIs content:// de DocumentPicker
 *    sin copiarlas primero a la caché → "Location isn't readable"
 *
 * SOLUCIÓN:
 *  - ensureFileInCache: copia el archivo a la caché si su URI no es file://
 *  - uploadWithXhr: reemplaza fetch+FormData por XMLHttpRequest que sí soporta
 *    objetos { uri, name, type } en Android a través de la capa nativa de RN.
 */

import { File } from 'expo-file-system';
import { cacheDirectory, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';

/**
 * Lee un archivo de forma directa como Base64 con total fidelidad binaria.
 * Soporta de manera fluida y silenciosa:
 *  1. Archivos en cacheDirectory (vía File.base64 o readAsStringAsync)
 *  2. Archivos de DocumentPicker (content:// o file:// vía fetch + arrayBuffer)
 */
export async function readFileAsBase64(uri: string): Promise<string> {
  // Estrategia 1: API moderna File (ideal para archivos en cache/documentDirectory)
  try {
    const file = new File(uri);
    const base64 = await file.base64();
    if (base64 && base64.length > 0) {
      return base64;
    }
  } catch {
    // Silencioso: si no tiene permiso directo sobre esta ruta específica continúa
  }

  // Estrategia 2: API legacy readAsStringAsync
  try {
    const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
    if (base64 && base64.length > 0) {
      return base64;
    }
  } catch {
    // Silencioso
  }

  // Estrategia 3: fetch + arrayBuffer (opera sobre ContentResolver de Android sin restricciones)
  try {
    const response = await fetch(uri);
    const buffer = await response.arrayBuffer();
    if (buffer && buffer.byteLength > 0) {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize) as any);
      }
      return btoa(binary);
    }
  } catch {
    // Silencioso
  }

  throw new Error('No se pudo leer el contenido del archivo.');
}

/**
 * Garantiza que el archivo esté en el directorio de caché de la aplicación.
 * Si ya está en caché lo retorna; si no, lo copia limpiamente sin advertencias.
 */
export async function ensureFileInCache(uri: string, fileName: string): Promise<string> {
  // Si ya se encuentra dentro de nuestra propia caché, es seguro y accesible
  if (cacheDirectory && uri.startsWith(cacheDirectory)) {
    return uri;
  }

  const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const destUri = `${cacheDirectory}${safeName}`;

  try {
    const base64 = await readFileAsBase64(uri);
    await writeAsStringAsync(destUri, base64, { encoding: 'base64' });
    return destUri;
  } catch {
    return uri;
  }
}

/**
 * Interfaz para describir una entrada de archivo dentro del FormData
 */
export interface FileEntry {
  fieldName: string;
  uri: string;
  name: string;
  type: string;
}

/**
 * Interfaz para describir un campo de texto dentro del FormData
 */
export interface TextField {
  fieldName: string;
  value: string;
}

/**
 * Realiza un POST multipart/form-data usando XMLHttpRequest.
 * XMLHttpRequest en React Native sí soporta objetos { uri, name, type } como
 * partes de FormData porque pasa por la capa nativa de networking de RN,
 * a diferencia de fetch que en RN 0.76+ con Hermes los rechaza.
 *
 * @param url       - URL del endpoint
 * @param files     - Lista de archivos a adjuntar
 * @param fields    - Lista de campos de texto adicionales
 * @param headers   - Cabeceras HTTP adicionales (ej. tokens de auth)
 * @returns         - La respuesta parseada como JSON
 */
export function uploadWithXhr(
  url: string,
  files: FileEntry[],
  fields: TextField[] = [],
  headers: Record<string, string> = {}
): Promise<any> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    // Adjuntamos cada archivo usando el formato que XHR nativo de RN entiende
    files.forEach(({ fieldName, uri, name, type }) => {
      formData.append(fieldName, { uri, name, type } as any);
    });

    // Adjuntamos los campos de texto planos
    fields.forEach(({ fieldName, value }) => {
      formData.append(fieldName, value);
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    // Aplicamos cabeceras personalizadas
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error || `Error ${xhr.status} del servidor`));
        } catch {
          reject(new Error(`Error ${xhr.status} del servidor`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Error de red al subir el archivo'));
    xhr.ontimeout = () => reject(new Error('Tiempo de espera agotado'));
    xhr.timeout = 120000; // 2 minutos máximo

    xhr.send(formData);
  });
}
