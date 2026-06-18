// SECCION DE IMPORTACIONES
// La conexión a Supabase que nos permite escribir en la base de datos
import { supabase } from '@/shared/services/supabase';

// Sección: Utilidad de Logging que escribe registros de actividad, errores y eventos en la base de datos
// Funciones: insertLog guarda cualquier evento importante en la tabla logs de Supabase

// TIPO: LogType
// Los tres tipos de registro que acepta el sistema de logs
type LogType = 'error' | 'admin_activity' | 'file_upload';

/**
 * Inserta un log en la base de datos de Supabase.
 * @param logType El tipo de log ('error' | 'admin_activity' | 'file_upload')
 * @param message El mensaje descriptivo del log
 * @param details Objeto opcional con detalles adicionales
 */
// FUNCION: insertLog
// Registra cualquier evento importante de la app directamente en la tabla de logs de Supabase para que los admins puedan ver qué pasa
export async function insertLog(logType: LogType, message: string, details?: any) {
  // Zona segura para no crashear la app si el log falla
  try {
    // Primero obtenemos quién está usando la app en este momento
    const { data: { user } } = await supabase.auth.getUser();
    
    // Insertamos el registro en la tabla logs de la base de datos
    await supabase.from('logs').insert([{
      // El tipo de evento (error, actividad de admin o subida de archivo)
      log_type: logType,
      // El mensaje descriptivo legible
      message: message,
      // Los detalles extra convertidos a texto JSON o nulo si no hay nada
      details: details ? JSON.stringify(details) : null,
      // El ID del usuario que generó el evento o nulo si no hay sesión
      user_id: user?.id || null,
    }]);
  // Si algo falla al escribir en la base de datos
  } catch (error) {
    // Solo lo mandamos a consola; el log no debe interrumpir el flujo normal de la app
    console.error('Error insertando log:', error);
  }
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas insertLog? pasa que ningún evento de la app quedará registrado en la base de datos y los administradores perderán toda visibilidad sobre errores, subidas de archivos y actividad general del sistema
// para solucionarlo debes volver a crear la función async que recibe logType, message y details opcionales e inserta en supabase.from('logs') con el user_id del usuario autenticado
