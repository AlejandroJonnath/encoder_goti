import axios from "axios";

// Sección: Biblioteca de integración con DocuSeal API para Firma Electrónica con validez legal en Ecuador
// (Maneja la subida del PDF en Base64, creación del firmante y obtención del widget de firma web)

const DOCUSEAL_API_KEY = process.env.EXPO_PUBLIC_DOCUSEAL_API_KEY;
const DOCUSEAL_API_URL = "https://api.docuseal.com";

export interface DocuSealSubmission {
  id: number;
  url: string;
  status: "pending" | "completed" | "mock";
}

// Función: Crear una solicitud de firma electrónica real
export async function createDocuSealSubmission(
  pdfUri: string,
  pdfBase64: string,
  pdfName: string,
  signerName: string,
  signerEmail: string
): Promise<DocuSealSubmission> {
  // Si no hay API key configurada, activamos el modo Sandbox automático
  if (!DOCUSEAL_API_KEY || DOCUSEAL_API_KEY.includes("YOUR_")) {
    console.log("[DocuSeal] API Key no detectada. Iniciando firma en modo Sandbox.");
    // Devolvemos una sesión de firma simulada de alta calidad usando un pad público para pruebas
    return {
      id: Date.now(),
      url: "https://www.docuseal.com/demo",
      status: "mock",
    };
  }

  try {
    const response = await axios.post(
      `${DOCUSEAL_API_URL}/submissions/pdf`,
      {
        name: `Firma Electrónica - ${pdfName}`,
        send_email: false,
        documents: [
          {
            name: pdfName,
            file: pdfBase64,
          },
        ],
        submitters: [
          {
            name: signerName,
            email: signerEmail,
            role: "Signer",
          },
        ],
      },
      {
        headers: {
          "X-Auth-Token": DOCUSEAL_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;
    // La API de DocuSeal puede retornar un arreglo o un objeto según el endpoint exacto
    const submission = Array.isArray(data) ? data[0] : data;
    const submitter = submission.submitters?.[0] || submission;

    return {
      id: submission.id || submitter.submission_id || Date.now(),
      url: submitter.url || "https://www.docuseal.com/demo",
      status: "pending",
    };
  } catch (error: any) {
    console.error("[DocuSeal] Error al crear la firma:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error || "Error al conectar con la API de Firma Electrónica DocuSeal"
    );
  }
}

// Función: Verificar el estado de la firma y descargar el PDF firmado
export async function getDocuSealSignedPdf(
  submissionId: number,
  isMock: boolean
): Promise<string | null> {
  if (isMock) {
    // Si es modo Sandbox, retornamos null para indicar que debemos firmar de forma local avanzada
    return null;
  }

  try {
    const response = await axios.get(
      `${DOCUSEAL_API_URL}/submissions/${submissionId}`,
      {
        headers: {
          "X-Auth-Token": DOCUSEAL_API_KEY || "",
        },
      }
    );

    const submission = response.data;
    if (submission.status === "completed" || submission.status === "signed") {
      // Obtenemos los documentos asociados
      const docResponse = await axios.get(
        `${DOCUSEAL_API_URL}/submissions/${submissionId}/documents`,
        {
          headers: {
            "X-Auth-Token": DOCUSEAL_API_KEY || "",
          },
        }
      );
      
      const documents = docResponse.data;
      const downloadUrl = Array.isArray(documents)
        ? documents[0]?.download_url || documents[0]?.url
        : documents.download_url || documents.url;
        
      return downloadUrl || null;
    }
    
    return null;
  } catch (error: any) {
    console.error("[DocuSeal] Error al obtener PDF firmado:", error.message);
    return null;
  }
}
