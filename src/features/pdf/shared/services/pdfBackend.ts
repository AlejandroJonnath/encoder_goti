/**
 * Servicio de procesamiento de PDFs conectado a BackendEncoderGoti.
 * Reemplaza servicios costosos de terceros por endpoints propios con costo $0.00.
 */

import { ensureFileInCache, uploadWithXhr } from "@/shared/utils/fileUpload";

export async function extractTextLocally(fileUri: string, fileName: string): Promise<string> {
  // Copiamos el archivo a caché local (fix: content:// URIs no legibles en Android)
  const safeUri = await ensureFileInCache(fileUri, fileName);

  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

  // Usamos XHR en lugar de fetch+FormData (fix: "Unsupported FormDataPart" en Hermes RN 0.86+)
  const data = await uploadWithXhr(
    `${backendUrl}/api/pdf/extract-text`,
    [{ fieldName: "pdf", uri: safeUri, name: fileName, type: "application/pdf" }]
  );

  return data.text || "";
}
