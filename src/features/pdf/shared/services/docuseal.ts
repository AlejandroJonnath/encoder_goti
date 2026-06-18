// SECCION DE IMPORTACIONES
// Traemos axios que es la herramienta que usaremos para comunicarnos con internet
import axios from "axios";

// Sección: Biblioteca de integración con DocuSeal API para Firma Electrónica con validez legal en Ecuador
// (Maneja la subida del PDF en Base64, creación del firmante y obtención del widget de firma web)

// Sacamos nuestra llave secreta de DocuSeal desde el entorno seguro del sistema
const DOCUSEAL_API_KEY = process.env.EXPO_PUBLIC_DOCUSEAL_API_KEY;
// Definimos la dirección principal donde vive la API de DocuSeal
const DOCUSEAL_API_URL = "https://api.docuseal.com";

// TIPO: DocuSealSubmission
// Molde que nos dice qué datos nos regresará DocuSeal cuando subimos un documento
export interface DocuSealSubmission {
  // El número de identificación de nuestra firma
  id: number;
  // La dirección web para que el usuario firme o descargue el archivo
  url: string;
  // El estado actual que nos dice si ya terminamos o apenas estamos esperando
  status: "pending" | "completed" | "mock";
}

// FUNCION: createDocuSealSubmission
// Función: Crear una solicitud de firma electrónica real subiendo los datos
export async function createDocuSealSubmission(
  pdfUri: string,
  pdfBase64: string,
  pdfName: string,
  signerName: string,
  signerEmail: string
): Promise<DocuSealSubmission> {
  // Verificamos si no tenemos llave o si es de mentiras para evitar errores
  // Si no hay API key configurada, activamos el modo Sandbox automático
  if (!DOCUSEAL_API_KEY || DOCUSEAL_API_KEY.includes("YOUR_")) {
    // Imprimimos un mensaje secreto en la consola de que estamos jugando
    console.log("[DocuSeal] API Key no detectada. Iniciando firma en modo Sandbox.");
    // Devolvemos una sesión de firma simulada de alta calidad usando un pad público para pruebas
    return {
      // Inventamos un ID usando la fecha
      id: Date.now(),
      // Usamos la URL de demo para no crashear
      url: "https://www.docuseal.com/demo",
      // Lo marcamos como falso
      status: "mock",
    };
  }

  // Zona de riesgo donde hablamos con internet
  try {
    // Mandamos nuestro documento al servidor de DocuSeal usando post
    const response = await axios.post(
      // Esta es la ruta para subir PDFs
      `${DOCUSEAL_API_URL}/submissions/pdf`,
      // Metemos todo en el paquete de envío
      {
        // Le ponemos un título bonito
        name: `Firma Electrónica - ${pdfName}`,
        // Apagamos los correos automáticos
        send_email: false,
        // Agrupamos nuestros documentos
        documents: [
          {
            // El nombre original del archivo
            name: pdfName,
            // Y todo su contenido transformado en texto largo
            file: pdfBase64,
          },
        ],
        // Le decimos a DocuSeal quién va a firmar esto
        submitters: [
          {
            // El nombre completo
            name: signerName,
            // Su correo
            email: signerEmail,
            // Le damos el rol oficial
            role: "Signer",
          },
        ],
      },
      // Pasamos las llaves en los encabezados
      {
        headers: {
          // La contraseña de acceso
          "X-Auth-Token": DOCUSEAL_API_KEY,
          // Y avisamos que mandamos JSON
          "Content-Type": "application/json",
        },
      }
    );

    // Rescatamos los datos que nos devolvió el servidor
    const data = response.data;
    // La API de DocuSeal puede retornar un arreglo o un objeto según el endpoint exacto así que lo aplanamos
    const submission = Array.isArray(data) ? data[0] : data;
    // Escarbamos para encontrar al remitente
    const submitter = submission.submitters?.[0] || submission;

    // Regresamos el objeto limpio y masticado para nuestra aplicación
    return {
      // El ID oficial
      id: submission.id || submitter.submission_id || Date.now(),
      // La URL real donde la persona pondrá su firma
      url: submitter.url || "https://www.docuseal.com/demo",
      // Estado de pendiente porque apenas lo mandamos
      status: "pending",
    };
  // Si algo falla lo cachamos aquí
  } catch (error: any) {
    // Imprimimos el chisme en consola
    console.error("[DocuSeal] Error al crear la firma:", error.response?.data || error.message);
    // Y le aventamos la culpa al que mandó llamar la función
    throw new Error(
      error.response?.data?.error || "Error al conectar con la API de Firma Electrónica DocuSeal"
    );
  }
}

// FUNCION: getDocuSealSignedPdf
// Función: Verificar el estado de la firma y descargar el PDF firmado
export async function getDocuSealSignedPdf(
  submissionId: number,
  isMock: boolean
): Promise<string | null> {
  // Revisamos si estábamos jugando de a mentiras
  if (isMock) {
    // Si es modo Sandbox, retornamos null para indicar que debemos firmar de forma local avanzada
    return null;
  }

  // Si es de a de veras entramos al try
  try {
    // Le preguntamos a DocuSeal cómo va nuestro archivo
    const response = await axios.get(
      // Consultamos la ruta con nuestro ID
      `${DOCUSEAL_API_URL}/submissions/${submissionId}`,
      {
        // Llevamos nuestra credencial
        headers: {
          "X-Auth-Token": DOCUSEAL_API_KEY || "",
        },
      }
    );

    // Guardamos la respuesta
    const submission = response.data;
    // Si la plataforma dice que el usuario ya terminó
    if (submission.status === "completed" || submission.status === "signed") {
      // Obtenemos los documentos asociados que ya están firmados
      const docResponse = await axios.get(
        // Consultamos la ruta de documentos del ID
        `${DOCUSEAL_API_URL}/submissions/${submissionId}/documents`,
        {
          headers: {
            "X-Auth-Token": DOCUSEAL_API_KEY || "",
          },
        }
      );
      
      // Rescatamos los documentos finales
      const documents = docResponse.data;
      // Navegamos por el laberinto de arreglos u objetos que devuelve la API para hallar el enlace de descarga
      const downloadUrl = Array.isArray(documents)
        ? documents[0]?.download_url || documents[0]?.url
        : documents.download_url || documents.url;
        
      // Devolvemos el enlace o null si está vacío
      return downloadUrl || null;
    }
    
    // Si el usuario no ha terminado regresamos null
    return null;
  // Si algo crashea atrapamos el fallo
  } catch (error: any) {
    // Guardamos el error silenciosamente
    console.error("[DocuSeal] Error al obtener PDF firmado:", error.message);
    // No estallamos la app, solo devolvemos null y ya
    return null;
  }
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si borras createDocuSealSubmission? pasa que tu app será incapaz de mandar un solo documento a los servidores de DocuSeal para empezar los trámites, rompiendo toda la conexión principal
// para solucionarlo deberás rehacer la función manteniendo intacto el envío del base64 con el axios post
// ¿qué pasa si quitas getDocuSealSignedPdf? pasa que aunque el usuario firme correctamente tu aplicación jamás se enterará ni será capaz de descargar el PDF finalizado
// para solucionarlo reestablece las dos peticiones get que primero revisan el estatus y luego extraen la url del documento final
