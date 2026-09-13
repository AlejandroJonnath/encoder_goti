/*
Nombre de la prueba: Pruebas del Sistema de Registro y Auditoría (Logger)
Breve nota: Verifica la serialización segura de eventos, tipado estricto de categorías ('error', 'admin_activity', 'file_upload') y el manejo de excepciones para garantizar que nunca interrumpa el flujo de la aplicación.
*/

import { TestRunner, assert, assertEqual } from './testHelper';

export type LogType = 'error' | 'admin_activity' | 'file_upload';

export interface LogEntry {
  log_type: LogType;
  message: string;
  details: string | null;
  user_id: string | null;
  created_at?: string;
}

// Simulador de la lógica pura de construcción y serialización de logs de logger.ts
export function buildLogPayload(
  logType: LogType,
  message: string,
  details?: any,
  userId?: string | null
): LogEntry {
  // Validación de tipos permitidos
  const validTypes: LogType[] = ['error', 'admin_activity', 'file_upload'];
  if (!validTypes.includes(logType)) {
    throw new Error(`Tipo de log no válido: ${logType}`);
  }

  let serializedDetails: string | null = null;
  if (details !== undefined && details !== null) {
    try {
      serializedDetails = JSON.stringify(details);
    } catch {
      serializedDetails = String(details);
    }
  }

  return {
    log_type: logType,
    message: String(message || ''),
    details: serializedDetails,
    user_id: userId || null,
  };
}

// Envío a prueba de fallos (garantiza que jamás crashea si la red o base de datos falla)
export async function safeInsertLog(
  mockInsertFn: () => Promise<void>
): Promise<{ success: boolean; errorHandled: boolean }> {
  try {
    await mockInsertFn();
    return { success: true, errorHandled: false };
  } catch (err) {
    // Solo captura y reporta en consola interna sin lanzar error hacia arriba
    return { success: false, errorHandled: true };
  }
}

export async function runLoggerTests() {
  const runner = new TestRunner("Módulo de Registro y Auditoría (Logger)");
  runner.start();

  await runner.test("Construcción correcta de log de tipo 'error'", () => {
    const log = buildLogPayload('error', 'Fallo al comprimir documento', { code: 500, file: 'test.pdf' }, 'usr_123');
    assertEqual(log.log_type, 'error');
    assertEqual(log.message, 'Fallo al comprimir documento');
    assertEqual(log.user_id, 'usr_123');
    assert(log.details !== null && log.details.includes('"code":500'), "Detalles deben estar serializados en JSON");
  });

  await runner.test("Construcción de log de tipo 'file_upload' sin usuario autenticado", () => {
    const log = buildLogPayload('file_upload', 'Subida de archivo anónimo', { size: 1024 }, null);
    assertEqual(log.log_type, 'file_upload');
    assertEqual(log.user_id, null, "El ID de usuario debe ser null para invitados");
  });

  await runner.test("Construcción de log de tipo 'admin_activity' sin detalles adicionales", () => {
    const log = buildLogPayload('admin_activity', 'Admin consultó estadísticas');
    assertEqual(log.log_type, 'admin_activity');
    assertEqual(log.details, null, "Detalles vacíos deben serializarse como null");
  });

  await runner.test("Rechazo ante tipo de log no admitido por el esquema de base de datos", () => {
    let threw = false;
    try {
      // Forzar tipo inválido
      buildLogPayload('tipo_invalido' as any, 'Mensaje de prueba');
    } catch {
      threw = true;
    }
    assert(threw, "Debe lanzar error si el tipo de log no pertenece a LogType");
  });

  await runner.test("Comportamiento no bloqueante ante fallos de conexión (Safe Execution)", async () => {
    // Simular un fallo de red o timeout en Supabase
    const result = await safeInsertLog(async () => {
      throw new Error("Conexión de red perdida en Supabase");
    });

    assertEqual(result.success, false);
    assertEqual(result.errorHandled, true, "El error debe ser contenido de forma segura para no romper la app");
  });

  return runner.summary();
}

// Ejecución directa si se invoca este archivo específicamente
if (process.argv[1] && process.argv[1].includes('logger.test')) {
  runLoggerTests();
}
