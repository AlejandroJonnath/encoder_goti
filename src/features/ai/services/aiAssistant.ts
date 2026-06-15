import axios from 'axios';

// Sección: Este archivo centraliza la comunicación con las diferentes inteligencias artificiales para procesar textos y generar resúmenes automáticos

// Funciones: summarizeText sirve para elegir qué inteligencia artificial usar según las claves configuradas y enviar el texto
// Funciones: summarizeWithKimi sirve para mandar el texto a la IA de Moonshot y conseguir un resumen
// Funciones: summarizeWithGroq sirve para mandar el texto al modelo súper rápido de Groq y conseguir un resumen
// Funciones: summarizeWithGemini sirve para mandar el texto a la IA de Google Gemini y conseguir un resumen

// Guardamos la clave de Gemini sacándola de las variables de entorno
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// Guardamos la clave de Kimi sacándola de las variables de entorno
const KIMI_API_KEY = process.env.EXPO_PUBLIC_KIMI_API_KEY;
// Guardamos la clave de Groq sacándola de las variables de entorno
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

// Exportamos la función principal a la que llamará nuestra aplicación cuando el usuario pida un resumen
export async function summarizeText(text: string) {
  // Verificamos si el usuario configuró una clave para la IA Kimi
  if (KIMI_API_KEY) {
    // Si la tiene mandamos el texto a que lo resuma Kimi
    return summarizeWithKimi(text);
  // Si no tiene Kimi verificamos si puso una clave para Groq
  } else if (GROQ_API_KEY) {
    // Si la tiene usamos Groq para resumir
    return summarizeWithGroq(text);
  // Si no tiene las anteriores verificamos si puso una clave de Gemini
  } else if (GEMINI_API_KEY) {
    // Si la tiene usamos a Gemini
    return summarizeWithGemini(text);
  // Si no tiene absolutamente ninguna clave configurada
  } else {
    // Lanzamos un error gigante avisándole al usuario que le falta configurar su API
    throw new Error('No se ha configurado ninguna clave API (Kimi, Groq o Gemini)');
  }
}

// Función interna que se encarga de hablar con la API de Kimi
async function summarizeWithKimi(text: string) {
  // Preparamos la dirección de internet a donde le mandaremos el mensaje
  const url = 'https://api.moonshot.cn/v1/chat/completions';
  // Usamos try para atrapar cualquier error que ocurra en el intento
  try {
    // Hacemos una petición POST con axios para enviarle nuestros datos
    const response = await axios.post(
      url,
      {
        // Le indicamos qué modelo exacto de Kimi queremos usar (la versión 8k)
        model: 'moonshot-v1-8k',
        // Le mandamos los mensajes que definen el comportamiento
        messages: [
          {
            // El rol system es para darle las instrucciones a la IA de cómo debe comportarse
            role: 'system',
            // Le decimos que es un asistente experto y que queremos viñetas
            content: 'Eres un asistente experto en lectura y análisis de documentos. Tu tarea es extraer los puntos clave y generar un resumen conciso y bien estructurado del siguiente documento. Usa viñetas para los puntos principales.'
          },
          {
            // El rol user es lo que nosotros como usuarios le estamos pidiendo
            role: 'user',
            // Le pasamos la palabra DOCUMENTO seguida del texto que sacamos del PDF
            content: `DOCUMENTO:\n${text}`
          }
        ]
      },
      {
        // En los encabezados le pasamos nuestra credencial secreta para que nos deje pasar
        headers: {
          'Authorization': `Bearer ${KIMI_API_KEY}`,
          // Le decimos que le estamos mandando formato JSON
          'Content-Type': 'application/json'
        }
      }
    );
    // Si todo va bien sacamos el texto de la respuesta o devolvemos un mensaje de error si vino vacío
    return response.data.choices[0]?.message?.content || 'No se pudo generar un resumen.';
  // Si hay una falla o error en la red entra aquí
  } catch (error: any) {
    // Imprimimos el error real en la consola de programadores para saber qué falló
    console.error('Error al contactar a Kimi:', error.response?.data || error.message);
    // Le tiramos un error más amigable a la pantalla de la aplicación
    throw new Error('Fallo al generar el resumen con Kimi.');
  }
}

// Función interna que se encarga de hablar con la API veloz de Groq
async function summarizeWithGroq(text: string) {
  // Preparamos la dirección de Groq (curiosamente usan el mismo formato que OpenAI)
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  // Probamos a ejecutar la petición
  try {
    // Mandamos el mensaje a la nube usando axios
    const response = await axios.post(
      url,
      {
        // Usamos el modelo más potente y nuevo que ofrece Groq
        model: 'llama-3.3-70b-versatile', 
        // Armamos la conversación
        messages: [
          {
            // Instrucciones del sistema para darle personalidad a la IA
            role: 'system',
            // Le indicamos cómo debe resumir el texto
            content: 'Eres un asistente experto en lectura y análisis de documentos. Tu tarea es extraer los puntos clave y generar un resumen conciso y bien estructurado del siguiente documento. Usa viñetas para los puntos principales.'
          },
          {
            // Nuestro texto a resumir
            role: 'user',
            // Pasamos el texto extraído del archivo
            content: `DOCUMENTO:\n${text}`
          }
        ]
      },
      {
        // Configuramos la seguridad de la petición
        headers: {
          // Adjuntamos nuestra API key secreta de Groq
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          // El tipo de contenido que enviamos
          'Content-Type': 'application/json'
        }
      }
    );
    // Extraemos la respuesta final navegando por los objetos JSON que nos regresa Groq
    return response.data.choices[0]?.message?.content || 'No se pudo generar un resumen.';
  // Si la petición falla nos vamos al catch
  } catch (error: any) {
    // Dejamos registro del error para el desarrollador
    console.error('Error al contactar a Groq:', error.response?.data || error.message);
    // Cortamos la ejecución y mostramos un error genérico en la app
    throw new Error('Fallo al generar el resumen con Groq.');
  }
}

// Función interna para conectar con la IA de Google Gemini
async function summarizeWithGemini(text: string) {
  // Armamos la URL pegando directamente nuestra llave API en la dirección porque así lo pide Google
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  // Empezamos el intento de petición
  try {
    // Llamamos a la API con un POST
    const response = await axios.post(url, {
      // Gemini tiene una estructura un poco diferente a las otras IAs para mandar el mensaje
      contents: [{
        // Dentro de las partes del contenido ponemos el texto
        parts: [{
          // Juntamos las instrucciones y el documento en un solo texto (prompt)
          text: `Eres un asistente experto en lectura y análisis de documentos. Tu tarea es extraer los puntos clave y generar un resumen conciso y bien estructurado del siguiente documento. Usa viñetas para los puntos principales.\n\nDOCUMENTO:\n${text}`
        }]
      }]
    });
    
    // Si Gemini contesta bien sacamos el texto de la ruta extraña que devuelve su JSON
    const summary = response.data.candidates[0]?.content?.parts[0]?.text;
    // Retornamos el resumen o el texto por defecto
    return summary || 'No se pudo generar un resumen.';
  // Atrapamos errores por si Gemini se cae o sobrepasamos la cuota
  } catch (error: any) {
    // Imprimimos en consola
    console.error('Error al contactar a Gemini:', error.response?.data || error.message);
    // Lanzamos error a la vista del usuario
    throw new Error('Fallo al generar el resumen con Inteligencia Artificial.');
  }
}

// si quitas summarizeText pasa que la aplicación se quedará sin un cerebro central para decidir qué IA usar y todo el sistema de resúmenes se romperá
// si quitas summarizeWithKimi pasa que los usuarios que configuren su llave de Moonshot no podrán usarla
// si quitas summarizeWithGroq pasa que los usuarios no podrán disfrutar de la velocidad ultrarrápida de Llama 3 en Groq
// si quitas summarizeWithGemini pasa que los que quieran usar Google Gemini se quedarán sin poder procesar sus textos
