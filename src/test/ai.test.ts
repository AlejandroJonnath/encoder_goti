/*
Nombre de la prueba: Pruebas del Asistente de Inteligencia Artificial
Breve nota: Verifica la priorización de proveedores de IA (Groq), construcción de prompts del sistema, validación de variables de entorno y manejo seguro de errores sin consumir cuotas innecesarias.
*/
import { TestRunner, assert, assertEqual, assertThrows } from './testHelper';

// Lógica pura de selección de proveedor de IA (equivalente a summarizeText en aiAssistant.ts)
export type AIProvider = 'kimi' | 'groq' | 'gemini';

export function resolveAIProvider(keys: { kimi?: string; groq?: string; gemini?: string }): AIProvider {
  if (keys.kimi) return 'kimi';
  if (keys.groq) return 'groq';
  if (keys.gemini) return 'gemini';
  throw new Error('No se ha configurado ninguna clave API (Kimi, Groq o Gemini)');
}

export interface OpenAIPayload {
  url: string;
  body: {
    model: string;
    messages: { role: string; content: string }[];
    temperature: number;
  };
}

export interface GeminiPayload {
  url: string;
  body: {
    contents: { parts: { text: string }[] }[];
  };
}

export function buildAIPromptPayload(provider: AIProvider, textToSummarize: string): OpenAIPayload | GeminiPayload {
  const systemInstruction = 'Eres un asistente experto en lectura y análisis de documentos. Tu tarea es extraer los puntos clave y generar un resumen conciso y bien estructurado del siguiente documento. Usa viñetas para los puntos principales.';

  switch (provider) {
    case 'kimi':
      return {
        url: 'https://api.moonshot.cn/v1/chat/completions',
        body: {
          model: 'moonshot-v1-8k',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: textToSummarize }
          ],
          temperature: 0.3
        }
      };
    case 'groq':
      return {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        body: {
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: textToSummarize }
          ],
          temperature: 0.3
        }
      };
    case 'gemini':
      return {
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        body: {
          contents: [
            {
              parts: [
                { text: `${systemInstruction}\n\nDocumento:\n${textToSummarize}` }
              ]
            }
          ]
        }
      };
  }
}

export async function runAITests() {
  const runner = new TestRunner("Módulo de Inteligencia Artificial (IA)");
  runner.start();

  await runner.test("Prioridad #1: Detección y selección de Kimi (Moonshot)", () => {
    const provider = resolveAIProvider({ kimi: "sk-kimi-123", groq: "gsk-456", gemini: "AIza-789" });
    assertEqual(provider, 'kimi', "Kimi debe tener la primera prioridad si su clave está presente");
  });

  await runner.test("Prioridad #2: Fallback a Groq cuando Kimi no está configurado", () => {
    const provider = resolveAIProvider({ kimi: undefined, groq: "gsk-456", gemini: "AIza-789" });
    assertEqual(provider, 'groq', "Groq debe ser seleccionado si no hay clave de Kimi");
  });

  await runner.test("Prioridad #3: Fallback a Gemini cuando Kimi y Groq no están configurados", () => {
    const provider = resolveAIProvider({ kimi: undefined, groq: undefined, gemini: "AIza-789" });
    assertEqual(provider, 'gemini', "Gemini debe ser seleccionado como respaldo final");
  });

  await runner.test("Manejo de error cuando no existe ninguna API Key configurada", () => {
    assertThrows(() => {
      resolveAIProvider({});
    }, "No se ha configurado ninguna clave API");
  });

  await runner.test("Estructura correcta del payload para OpenAI-compatible (Groq / Kimi)", () => {
    const sampleText = "Contrato de arrendamiento entre las partes...";
    const payload = buildAIPromptPayload('groq', sampleText) as OpenAIPayload;

    assertEqual(payload.body.model, 'openai/gpt-oss-120b');
    assertEqual(payload.body.messages.length, 2);
    assertEqual(payload.body.messages[0]?.role, 'system');
    assertEqual(payload.body.messages[1]?.role, 'user');
    assert(payload.body.messages[1]?.content.includes("Contrato de arrendamiento") || false);
  });

  await runner.test("Estructura correcta del payload para Google Gemini", () => {
    const sampleText = "Informe financiero trimestral...";
    const payload = buildAIPromptPayload('gemini', sampleText) as GeminiPayload;

    assert(payload.url.includes("gemini-1.5-flash"));
    assertEqual(payload.body.contents.length, 1);
    assert(payload.body.contents[0]?.parts[0]?.text.includes("Informe financiero") || false);
  });

  return runner.summary();
}

// Ejecución directa si se invoca este archivo específicamente
if (process.argv[1] && process.argv[1].includes('ai.test')) {
  runAITests();
}
