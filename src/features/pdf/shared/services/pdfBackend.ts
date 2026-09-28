/**
 * Servicio de procesamiento de PDFs conectado a BackendEncoderGoti.
 * Reemplaza servicios costosos de terceros por endpoints propios con costo $0.00.
 */

export async function extractTextLocally(fileUri: string, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("pdf", {
    uri: fileUri,
    name: fileName,
    type: "application/pdf",
  } as any);

  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";
  const response = await fetch(`${backendUrl}/api/pdf/extract-text`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Error al extraer texto del documento desde el servidor");
  }

  const data = await response.json();
  return data.text || "";
}
